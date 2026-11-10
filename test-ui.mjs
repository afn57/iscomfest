import { spawn } from 'node:child_process'
import http from 'node:http'
import { setTimeout as sleep } from 'node:timers/promises'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const EXT = process.cwd() + '\\extension'
const CDP_PORT = 9461
const APP_PORT = 5199
const FIXTURE_PORT = 8899
const PROFILE = process.env.TEMP + '\\fg-ui-profile'

let failures = 0
const check = (name, ok, extra = '') => {
  if (ok) console.log(`  OK   ${name}`)
  else { failures++; console.log(`  FAIL ${name} ${extra}`) }
}
const sleepMs = (ms) => new Promise((r) => setTimeout(r, ms))

/* ---------- servers ---------- */
const fixture = http.createServer((_req, res) => {
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
  res.end('<!doctype html><title>fixture</title><body>blocked fixture</body>')
})
await new Promise((r) => fixture.listen(FIXTURE_PORT, '127.0.0.1', r))

const vite = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--port', String(APP_PORT), '--strictPort'], {
  stdio: 'ignore', cwd: process.cwd(),
})
process.on('exit', () => { try { vite.kill(); fixture.close() } catch {} })

async function waitForHttp(url, ms = 30000) {
  const start = Date.now()
  while (Date.now() - start < ms) {
    try { const r = await fetch(url); if (r.ok) return true } catch {}
    await sleepMs(400)
  }
  return false
}
const appUp = await waitForHttp(`http://localhost:${APP_PORT}/`)
console.log('vite dev server:', appUp ? 'OK' : 'GAGAL')
if (!appUp) process.exit(1)

/* ---------- Edge ---------- */
const edge = spawn(EDGE, [
  '--headless=new', '--disable-gpu', '--no-first-run',
  `--user-data-dir=${PROFILE}`,
  `--load-extension=${EXT}`,
  `--remote-debugging-port=${CDP_PORT}`,
  `--host-resolver-rules=MAP blocked.test 127.0.0.1`,
  `http://localhost:${APP_PORT}/focus?tab=session`,
], { stdio: 'ignore' })
process.on('exit', () => { try { edge.kill() } catch {} })

async function cdpHttp(path) {
  for (let i = 0; i < 60; i++) {
    try { const r = await fetch(`http://127.0.0.1:${CDP_PORT}${path}`); return await r.json() } catch { await sleepMs(500) }
  }
  throw new Error('CDP tidak terjangkau')
}
const version = await cdpHttp('/json/version')

function connect(url) {
  const ws = new WebSocket(url)
  const pending = new Map(); const listeners = []; let id = 0
  ws.addEventListener('message', (ev) => {
    const m = JSON.parse(ev.data)
    if (m.id && pending.has(m.id)) {
      const { resolve, reject } = pending.get(m.id); pending.delete(m.id)
      m.error ? reject(new Error(m.error.message)) : resolve(m.result)
    } else if (m.method) listeners.forEach((fn) => fn(m))
  })
  return {
    open: new Promise((res, rej) => { ws.addEventListener('open', res, { once: true }); ws.addEventListener('error', () => rej(new Error('ws')), { once: true }) }),
    send(method, params = {}, sessionId) {
      const mid = ++id
      return new Promise((resolve, reject) => {
        pending.set(mid, { resolve, reject })
        ws.send(JSON.stringify({ id: mid, method, params, ...(sessionId ? { sessionId } : {}) }))
        setTimeout(() => { if (pending.has(mid)) { pending.delete(mid); reject(new Error('timeout ' + method)) } }, 15000)
      })
    },
    on(fn) { listeners.push(fn) },
    close() { try { ws.close() } catch {} },
  }
}
const browser = connect(version.webSocketDebuggerUrl)
await browser.open
const attach = async (id) => (await browser.send('Target.attachToTarget', { targetId: id, flatten: true })).sessionId
const evalJs = async (sid, expr, awaitPromise = false) => {
  const r = await browser.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise }, sid)
  if (r.exceptionDetails) return 'EXC: ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text)
  return r.result.value
}
async function poll(fn, ms = 15000, step = 400) {
  const start = Date.now()
  while (Date.now() - start < ms) { const v = await fn(); if (v) return v; await sleepMs(step) }
  return null
}

try {
  /* ---------- service worker ---------- */
  const sw = await poll(async () => {
    const t = await cdpHttp('/json/list')
    return t.find((x) => x.type === 'service_worker' && x.url.endsWith('/background.js')) || null
  }, 20000, 500)
  check('ekstensi termuat di Edge (SW background.js)', Boolean(sw))
  const swSession = await attach(sw.id)
  await browser.send('Runtime.enable', {}, swSession).catch(() => {})

  /* ---------- halaman aplikasi ---------- */
  const pages = await cdpHttp('/json/list')
  const appPage = pages.find((p) => p.type === 'page' && p.url.includes(`:${APP_PORT}`))
  check('halaman aplikasi terbuka', Boolean(appPage), JSON.stringify(pages.map((p) => p.url)))
  const appSession = await attach(appPage.id)
  await browser.send('Runtime.enable', {}, appSession)

  await poll(() => evalJs(appSession, 'document.readyState === "complete" && Boolean(document.getElementById("root"))'), 15000)

  /* ---------- 1. banner handshake ---------- */
  const badge = await poll(() => evalJs(appSession,
    `(document.body.innerText.match(/Ekstensi (terhubung|belum terdeteksi)/) || [])[1] || null`), 15000, 500)
  check('banner FocusGuard = terhubung (handshake website<->ekstensi)', badge === 'terhubung', `banner=${badge}`)

  /* ---------- 2. tandai website custom lewat UI ---------- */
  const added = await evalJs(appSession, `(() => {
    const inputs = [...document.querySelectorAll('input')]
    const name = inputs.find(i => i.placeholder && i.placeholder.includes('ChatGPT'))
    const host = inputs.find(i => i.placeholder === 'domain.com')
    if (!name || !host) return 'input tidak ditemukan'
    const set = (el, v) => {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
      setter.call(el, v); el.dispatchEvent(new Event('input', { bubbles: true }))
    }
    set(name, 'Fixture'); set(host, 'blocked.test')
    const btn = [...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Tambah')
    if (!btn) return 'tombol Tambah tidak ditemukan'
    btn.click(); return 'clicked'
  })()`)
  check('form website custom diisi + klik Tambah', added === 'clicked', added)
  await sleepMs(600)
  const marked = await evalJs(appSession, 'document.body.innerText.includes("blocked.test")')
  check('website blocked.test masuk daftar', marked === true)

  /* ---------- 3. mulai sesi fokus lewat UI ---------- */
  const started = await poll(() => evalJs(appSession, `(() => {
    const btn = [...document.querySelectorAll('button')].find(b => b.textContent.includes('Start Focus Session'))
    if (!btn) return false
    btn.click(); return true
  })()`), 10000, 400)
  check('klik Start Focus Session', started === true)

  const state = await poll(async () => {
    const raw = await evalJs(swSession,
      'chrome.storage.local.get("focusguard_session").then(s => JSON.stringify(s.focusguard_session || null))', true)
    try { return JSON.parse(raw).hosts?.includes('blocked.test') ? JSON.parse(raw) : null } catch { return null }
  }, 10000, 400)
  check('ekstensi menerima START (state + hosts)', Boolean(state && state.hosts?.includes('blocked.test')),
    JSON.stringify(state))

  /* ---------- 4. buka situs terblokir -> overlay ---------- */
  const siteTarget = await browser.send('Target.createTarget', { url: `http://blocked.test:${FIXTURE_PORT}/` })
  const siteSession = await attach(siteTarget.targetId)
  await browser.send('Runtime.enable', {}, siteSession)
  const overlay = await poll(() => evalJs(siteSession,
    'Boolean(document.getElementById("focusguard-overlay"))').catch(() => false))
  check('OVERLAY MEMBLOKIR situs yang ditandai', overlay === true)

  /* ---------- 4b. tandai website LAIN di tengah sesi aktif ---------- */
  const stateBefore = await evalJs(swSession,
    'chrome.storage.local.get("focusguard_session").then(s => JSON.stringify(s.focusguard_session || null))', true)
  const addedMid = await evalJs(appSession, `(() => {
    const inputs = [...document.querySelectorAll('input')]
    const name = inputs.find(i => i.placeholder && i.placeholder.includes('ChatGPT'))
    const host = inputs.find(i => i.placeholder === 'domain.com')
    if (!name || !host) return 'input tidak ditemukan'
    const set = (el, v) => {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
      setter.call(el, v); el.dispatchEvent(new Event('input', { bubbles: true }))
    }
    set(name, 'Lainnya'); set(host, 'late.test')
    const btn = [...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Tambah')
    if (!btn) return 'tombol Tambah tidak ditemukan'
    btn.click(); return 'clicked'
  })()`)
  check('tambah website baru saat sesi BERJALAN', addedMid === 'clicked', addedMid)
  const stateMid = await poll(async () => {
    const raw = await evalJs(swSession,
      'chrome.storage.local.get("focusguard_session").then(s => JSON.stringify(s.focusguard_session || null))', true)
    try { return JSON.parse(raw).hosts.includes('late.test') ? raw : null } catch { return null }
  }, 8000, 300)
  const beforeHosts = (() => { try { return JSON.parse(stateBefore).hosts } catch { return [] } })()
  check('ekstensi menerima update hosts di tengah sesi',
    Array.isArray(beforeHosts) && !beforeHosts.includes('late.test') && Boolean(stateMid) && JSON.parse(stateMid).hosts.includes('late.test'),
    `sebelum=${stateBefore} sesudah=${stateMid}`)

  /* ---------- 5. situs lain aman ---------- */
  const safeTarget = await browser.send('Target.createTarget', { url: `http://127.0.0.1:${FIXTURE_PORT}/` })
  const safeSession = await attach(safeTarget.targetId)
  await browser.send('Runtime.enable', {}, safeSession)
  await sleepMs(1500)
  const safeOk = await evalJs(safeSession, 'Boolean(document.getElementById("focusguard-overlay"))')
  check('situs TIDAK ditandai tetap terbuka', safeOk === false)

  /* ---------- 6. akhiri sesi lewat UI -> overlay lepas ---------- */
  const endClicked = await poll(() => evalJs(appSession, `(() => {
    const btn = [...document.querySelectorAll('button')].find(b => b.textContent.includes('End Session'))
    if (!btn) return false
    btn.click(); return true
  })()`), 10000, 400)
  check('klik End Session', endClicked === true)
  const confirmed = await poll(() => evalJs(appSession, `(() => {
    const btn = [...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Akhiri sesi')
    if (!btn) return false
    btn.click(); return true
  })()`), 8000, 400)
  check('konfirmasi akhiri sesi', confirmed === true)
  const unlocked = await poll(() => evalJs(siteSession,
    '!document.getElementById("focusguard-overlay")').catch(() => false))
  check('overlay terbuka setelah sesi diakhiri', unlocked === true)

  /* ---------- diagnosis bila ada kegagalan ---------- */
  if (failures > 0) {
    const diag = await evalJs(appSession, `JSON.stringify({
      banner: (document.body.innerText.match(/Ekstensi (terhubung|belum terdeteksi)/) || [])[1],
      hasSession: Boolean([...document.querySelectorAll('button')].find(b => b.textContent.includes('End Session')))
    })`)
    console.log('  diag aplikasi:', diag)
  }
} catch (err) {
  failures++
  console.log('  ERROR', err.message)
} finally {
  browser.close(); edge.kill(); vite.kill(); fixture.close()
}
console.log(failures === 0 ? '\nSEMUA TEST LULUS' : `\n${failures} TEST GAGAL`)
process.exit(failures === 0 ? 0 : 1)
