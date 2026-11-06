import { spawn } from 'node:child_process'
import http from 'node:http'
import { setTimeout as sleep } from 'node:timers/promises'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const EXT = process.cwd() + '\\extension'
const PORT = 9455
const WEB = 8899
const PROFILE = process.env.TEMP + '\\fg-e2e-profile'

const HTML = `<!doctype html><html><head><meta charset="utf-8"><title>test</title></head>
<body><h1>focusguard e2e fixture</h1></body></html>`

const log = (...a) => console.log('  ', ...a)
let failures = 0
function check(name, ok, extra = '') {
  if (ok) console.log(`  OK   ${name}`)
  else { failures++; console.log(`  FAIL ${name} ${extra}`) }
}

/* ---------- static server ---------- */
const server = http.createServer((_req, res) => {
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
  res.end(HTML)
})
await new Promise((r) => server.listen(WEB, '127.0.0.1', r))

/* ---------- launch Edge ---------- */
const edge = spawn(EDGE, [
  '--headless=new',
  '--disable-gpu',
  '--no-first-run',
  `--user-data-dir=${PROFILE}`,
  `--load-extension=${EXT}`,
  `--remote-debugging-port=${PORT}`,
  '--host-resolver-rules=MAP blocked.test 127.0.0\.1',
  'about:blank',
], { stdio: 'ignore', detached: false })
process.on('exit', () => { try { edge.kill() } catch {} })

async function cdpHttp(path) {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}${path}`)
      return await res.json()
    } catch { await sleep(500) }
  }
  throw new Error('CDP tidak terjangkau')
}

const version = await cdpHttp('/json/version')
log('browser:', version.Browser)

/* ---------- CDP session helper ---------- */
function connect(url) {
  const ws = new WebSocket(url)
  const pending = new Map()
  const listeners = []
  let id = 0
  ws.addEventListener('message', (ev) => {
    const msg = JSON.parse(ev.data)
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id)
      pending.delete(msg.id)
      msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result)
    } else if (msg.method) listeners.forEach((fn) => fn(msg))
  })
  return {
    open: new Promise((res, rej) => {
      ws.addEventListener('open', res, { once: true })
      ws.addEventListener('error', () => rej(new Error('ws error')), { once: true })
    }),
    send(method, params = {}, sessionId) {
      const mid = ++id
      return new Promise((resolve, reject) => {
        pending.set(mid, { resolve, reject })
        ws.send(JSON.stringify({ id: mid, method, params, ...(sessionId ? { sessionId } : {}) }))
        setTimeout(() => {
          if (pending.has(mid)) { pending.delete(mid); reject(new Error(`timeout ${method}`)) }
        }, 15000)
      })
    },
    on(fn) { listeners.push(fn) },
    close() { try { ws.close() } catch {} },
  }
}

const browser = connect(version.webSocketDebuggerUrl)
await browser.open

async function attach(targetId) {
  const { sessionId } = await browser.send('Target.attachToTarget', { targetId, flatten: true })
  return sessionId
}
async function evalJs(sessionId, expression, awaitPromise = false) {
  const r = await browser.send('Runtime.evaluate', { expression, awaitPromise, returnByValue: true }, sessionId)
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || 'eval exception')
  return r.result.value
}
async function poll(fn, ms = 12000, step = 400) {
  const start = Date.now()
  while (Date.now() - start < ms) {
    const v = await fn()
    if (v) return v
    await sleep(step)
  }
  return null
}

try {
  /* ---------- 1. service worker FocusGuard hidup ---------- */
  const sw = await poll(async () => {
    const t = await cdpHttp('/json/list')
    return t.find((x) => x.type === 'service_worker' && x.url.endsWith('/background.js')) || null
  }, 20000, 500)
  check('service worker background.js termuat', Boolean(sw))
  const swSession = await attach(sw.id)
  await browser.send('Runtime.enable', {}, swSession).catch(() => {})
  const swName = await poll(async () => {
    try {
      const v = await evalJs(swSession, 'chrome.runtime.getManifest().name')
      return v || null
    } catch { return null }
  }, 8000, 400)
  check('manifest terbaca oleh Chrome', swName === 'FocusGuard', `name=${swName}`)

  /* ---------- 2. bridge di localhost: HELLO ---------- */
  const bridgeTarget = await browser.send('Target.createTarget', { url: `http://127.0.0.1:${WEB}/bridge` })
  const bridgeSession = await attach(bridgeTarget.targetId)
  await browser.send('Runtime.enable', {}, bridgeSession)
  await sleep(800)

  const hello = await evalJs(bridgeSession, `new Promise((resolve) => {
    const to = setTimeout(() => resolve('TIMEOUT'), 5000)
    window.addEventListener('message', function h(e) {
      if (e.data && e.data.source === 'focusguard-ext' && e.data.type === 'HELLO_ACK') {
        clearTimeout(to); window.removeEventListener('message', h); resolve('HELLO_ACK')
      }
    })
    window.postMessage({ source: 'focusguard-web', type: 'HELLO' }, '*')
  })`, true)
  check('handshake HELLO_ACK dari ekstensi', hello === 'HELLO_ACK', hello)

  /* ---------- 3. START sesi (instagram.com, 60 dtk) ---------- */
  const startAck = await evalJs(bridgeSession, `new Promise((resolve) => {
    const to = setTimeout(() => resolve('TIMEOUT'), 6000)
    window.addEventListener('message', function h(e) {
      if (e.data && e.data.source === 'focusguard-ext' && e.data.type === 'START_ACK') {
        clearTimeout(to); window.removeEventListener('message', h); resolve(e.data.ok ? 'OK' : 'NOT_OK')
      }
    })
    window.postMessage({ source: 'focusguard-web', type: 'START',
      hosts: ['blocked.test'], endsAt: Date.now() + 60000 }, '*')
  })`, true)
  check('START_ACK diterima website', startAck === 'OK', startAck)

  const stored = await evalJs(swSession, 'chrome.storage.local.get("focusguard_session").then(s => JSON.stringify(s.focusguard_session))', true)
  const state = JSON.parse(stored)
  check('state sesi tersimpan', state && state.hosts[0] === 'blocked.test' && state.endsAt > Date.now(), stored)

  const alarms = await evalJs(swSession, 'chrome.alarms.getAll().then(a => a.map(x => x.name).join(","))', true)
  check('alarm unlock dibuat', alarms.includes('focusguard_unlock'), alarms)

  /* ---------- 4. overlay muncul di situs terblokir ---------- */
  const siteTarget = await browser.send('Target.createTarget', { url: `http://blocked.test:${WEB}/` })
  const siteSession = await attach(siteTarget.targetId)
  await browser.send('Runtime.enable', {}, siteSession)
  const mounted = await poll(() => evalJs(siteSession,
    'Boolean(document.getElementById("focusguard-overlay"))').catch(() => false))
  check('overlay terpasang di blocked.test', mounted === true)

  if (mounted) {
    const cd = await evalJs(siteSession, 'document.querySelector("[data-fg-countdown]").textContent')
    check('countdown tampil (bukan placeholder)', cd !== '--:--' && /\d/.test(cd), `countdown=${cd}`)
    const z = await evalJs(siteSession, 'getComputedStyle(document.getElementById("focusguard-overlay")).zIndex')
    check('overlay menutupi penuh (z-index max)', z === '2147483647', `z=${z}`)
  }

  /* ---------- 5. reload situs -> overlay lewat GET_STATE ---------- */
  await browser.send('Page.reload', {}, siteSession).catch(() => {})
  await browser.send('Page.navigate', { url: `http://blocked.test:${WEB}/?v=2` }, siteSession).catch(() => {})
  const remounted = await poll(() => evalJs(siteSession,
    'Boolean(document.getElementById("focusguard-overlay"))').catch(() => false))
  check('overlay muncul lagi setelah reload', remounted === true)

  /* ---------- 6. situs NON-blokir tidak dikunci ---------- */
  const safeTarget = await browser.send('Target.createTarget', { url: `http://127.0.0.1:${WEB}/safe` })
  const safeSession = await attach(safeTarget.targetId)
  await browser.send('Runtime.enable', {}, safeSession)
  await sleep(1500)
  const safeBlocked = await evalJs(safeSession, 'Boolean(document.getElementById("focusguard-overlay"))')
  check('situs di luar blocklist tidak tertutup', safeBlocked === false)

  /* ---------- 7. STOP -> overlay dilepas ---------- */
  const stopAck = await evalJs(bridgeSession, `new Promise((resolve) => {
    const to = setTimeout(() => resolve('TIMEOUT'), 6000)
    window.addEventListener('message', function h(e) {
      if (e.data && e.data.source === 'focusguard-ext' && e.data.type === 'STOP_ACK') {
        clearTimeout(to); window.removeEventListener('message', h); resolve(e.data.ok ? 'OK' : 'NOT_OK')
      }
    })
    window.postMessage({ source: 'focusguard-web', type: 'STOP' }, '*')
  })`, true)
  check('STOP_ACK diterima website', stopAck === 'OK', stopAck)

  const unlocked = await poll(() => evalJs(siteSession,
    '!document.getElementById("focusguard-overlay")').catch(() => false))
  check('overlay dilepas setelah STOP', unlocked === true)

  const cleared = await evalJs(swSession, 'chrome.storage.local.get("focusguard_session").then(s => Object.keys(s).length === 0)', true)
  check('state dibersihkan', cleared === true)

  /* ---------- 8. auto-unlock via alarm saat waktu habis ---------- */
  const shortAck = await evalJs(bridgeSession, `new Promise((resolve) => {
    const to = setTimeout(() => resolve('TIMEOUT'), 6000)
    window.addEventListener('message', function h(e) {
      if (e.data && e.data.source === 'focusguard-ext' && e.data.type === 'START_ACK') {
        clearTimeout(to); window.removeEventListener('message', h); resolve(e.data.ok ? 'OK' : 'NOT_OK')
      }
    })
    window.postMessage({ source: 'focusguard-web', type: 'START',
      hosts: ['blocked.test'], endsAt: Date.now() + 4000 }, '*')
  })`, true)
  check('sesi pendek 4 dtk dimulai', shortAck === 'OK', shortAck)

  const shortMounted = await poll(() => evalJs(siteSession,
    'Boolean(document.getElementById("focusguard-overlay"))').catch(() => false))
  check('overlay terpasang pada sesi pendek', shortMounted === true)

  // tunggu alarm unlock (4 dtk + buffer)
  const autoUnlocked = await poll(() => evalJs(siteSession,
    '!document.getElementById("focusguard-overlay")').catch(() => false), 15000, 500)
  check('overlay terbuka otomatis saat waktu habis (alarm)', autoUnlocked === true)

  const autoCleared = await evalJs(swSession,
    'chrome.storage.local.get("focusguard_session").then(s => Object.keys(s).length === 0)', true)
  check('state bersih otomatis setelah alarm', autoCleared === true)

  /* ---------- 9. bridge tetap hidup setelah STOP ---------- */
  const gs = await evalJs(bridgeSession, `new Promise((resolve) => {
    window.addEventListener('message', function h(e) {
      if (e.data && e.data.source === 'focusguard-ext' && e.data.type === 'STOP_ACK') { window.removeEventListener('message', h) }
    })
    window.postMessage({ source: 'focusguard-web', type: 'HELLO' }, '*')
    resolve('done')
  })`, true)
  check('bridge tetap hidup setelah STOP', gs === 'done')
} catch (err) {
  failures++
  console.log('  ERROR', err.message)
} finally {
  browser.close()
  edge.kill()
  server.close()
}

console.log(failures === 0 ? '\nSEMUA TEST LULUS' : `\n${failures} TEST GAGAL`)
process.exit(failures === 0 ? 0 : 1)
