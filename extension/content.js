/* FocusGuard content script — dua peran:
   1. Jembatan di halaman website utama (localhost): window.postMessage <-> chrome.runtime
   2. Overlay pemblokir di situs yang dibatasi                               */

;(() => {
  if (window.__focusGuardLoaded) return
  window.__focusGuardLoaded = true

  const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1'])
  const isBridgePage = LOCAL_HOSTS.has(location.hostname)

  const OVERLAY_HTML = `
    <div class="fg-card" style="background:rgba(15,18,30,.92);border:1px solid rgba(255,255,255,.12);border-radius:16px;padding:32px 36px;max-width:420px;text-align:center;box-shadow:0 24px 64px rgba(0,0,0,.55);">
      <div style="font-size:34px;line-height:1;">&#128274;</div>
      <div style="margin-top:14px;font:700 20px/1.3 system-ui,-apple-system,sans-serif;color:#eef1ff;">Sedang Fokus</div>
      <div style="margin-top:6px;font:400 13.5px/1.5 system-ui,-apple-system,sans-serif;color:#9aa3c0;">
        Situs ini diblokir selama sesi FocusGuard berjalan.
      </div>
      <div data-fg-countdown style="margin-top:18px;font:700 40px/1 ui-monospace,SFMono-Regular,Menlo,monospace;color:#7c8cff;letter-spacing:.04em;">--:--</div>
      <div style="margin-top:8px;font:500 12px/1.4 system-ui,sans-serif;color:#697099;text-transform:uppercase;letter-spacing:.12em;">waktu tersisa</div>
      <div data-fg-hosts style="margin-top:16px;font:400 12px/1.5 system-ui,sans-serif;color:#8b93b5;"></div>
    </div>`

  const OVERLAY_CSS = `
    #focusguard-overlay {
      position: fixed; inset: 0; z-index: 2147483647;
      display: flex; align-items: center; justify-content: center;
      background: radial-gradient(1200px 800px at 50% 20%, #1a2140 0%, #0b0e1a 55%, #05060d 100%);
      opacity: 1; transition: opacity .2s ease;
    }
    #focusguard-overlay.fg-hiding { opacity: 0; pointer-events: none; }`

  /* ---------------------------------------------------------------- */
  /* Peran A — bridge di website utama                                  */
  /* ---------------------------------------------------------------- */
  function setupBridge() {
    const sendToBackground = (payload) =>
      new Promise((resolve) => {
        try {
          chrome.runtime.sendMessage({ channel: 'focusguard', ...payload }, (res) => {
            if (chrome.runtime.lastError) resolve(null)
            else resolve(res ?? null)
          })
        } catch {
          resolve(null)
        }
      })

    const postToPage = (data) => {
      window.postMessage({ source: 'focusguard-ext', ...data }, '*')
    }

    window.addEventListener('message', (event) => {
      if (event.source !== window) return
      const data = event.data
      if (!data || data.source !== 'focusguard-web') return

      if (data.type === 'HELLO') {
        postToPage({ type: 'HELLO_ACK' })
        return
      }
      if (data.type === 'START' || data.type === 'STOP') {
        sendToBackground({ type: data.type, hosts: data.hosts, endsAt: data.endsAt }).then((res) => {
          postToPage({ type: data.type === 'START' ? 'START_ACK' : 'STOP_ACK', ok: Boolean(res?.ok) })
        })
      }
    })

    postToPage({ type: 'HELLO_ACK' })
  }

  /* ---------------------------------------------------------------- */
  /* Peran B — overlay di situs terblokir                               */
  /* ---------------------------------------------------------------- */
  function setupOverlay() {
    let overlay = null
    let countdownId = null

    const fmt = (ms) => {
      const total = Math.max(0, Math.ceil(ms / 1000))
      const h = Math.floor(total / 3600)
      const m = Math.floor((total % 3600) / 60)
      const s = total % 60
      const mm = String(m).padStart(2, '0')
      const ss = String(s).padStart(2, '0')
      return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
    }

    const unmount = () => {
      if (countdownId !== null) {
        window.clearInterval(countdownId)
        countdownId = null
      }
      document.documentElement.style.removeProperty('pointer-events')
      if (!overlay) return
      const el = overlay
      overlay = null
      el.classList.add('fg-hiding')
      window.setTimeout(() => el.remove(), 220)
    }

    const mount = (state) => {
      if (overlay) return
      if (!document.body) {
        document.addEventListener('DOMContentLoaded', () => mount(state), { once: true })
        return
      }

      let style = document.getElementById('focusguard-style')
      if (!style) {
        style = document.createElement('style')
        style.id = 'focusguard-style'
        style.textContent = OVERLAY_CSS
        document.head.appendChild(style)
      }

      overlay = document.createElement('div')
      overlay.id = 'focusguard-overlay'
      overlay.setAttribute('role', 'dialog')
      overlay.setAttribute('aria-modal', 'true')
      overlay.setAttribute('aria-label', 'Situs diblokir selama sesi fokus')
      overlay.innerHTML = OVERLAY_HTML
      document.body.appendChild(overlay)

      const countdownEl = overlay.querySelector('[data-fg-countdown]')
      const hostsEl = overlay.querySelector('[data-fg-hosts]')
      if (hostsEl) {
        const hosts = Array.isArray(state?.hosts) ? state.hosts : []
        hostsEl.textContent =
          hosts.length > 0 ? `Diblokir: ${hosts.slice(0, 4).join(', ')}${hosts.length > 4 ? `, +${hosts.length - 4} lain` : ''}` : ''
      }

      const tick = () => {
        if (!overlay || !countdownEl) return
        const endsAt = Number(overlay.dataset.endsAt || 0)
        countdownEl.textContent = fmt(endsAt - Date.now())
      }
      if (state?.endsAt) overlay.dataset.endsAt = String(state.endsAt)
      tick()
      countdownId = window.setInterval(tick, 1000)

      // cegah interaksi halaman di bawah overlay
      document.documentElement.style.setProperty('pointer-events', 'none', 'important')
      overlay.style.pointerEvents = 'auto'
    }

    const applyState = (state) => {
      const shouldBlock =
        state &&
        Array.isArray(state.hosts) &&
        Date.now() < state.endsAt &&
        state.hosts.some((h) => {
          const host = location.hostname.toLowerCase()
          return host === h || host.endsWith('.' + h)
        })
      if (shouldBlock) mount(state)
      else unmount()
    }

    const fetchState = () =>
      new Promise((resolve) => {
        try {
          chrome.runtime.sendMessage({ channel: 'focusguard', type: 'GET_STATE' }, (res) => {
            if (chrome.runtime.lastError) resolve(null)
            else resolve(res?.state ?? null)
          })
        } catch {
          resolve(null)
        }
      })

    chrome.runtime.onMessage.addListener((message) => {
      if (!message || message.channel !== 'focusguard') return
      if (message.type === 'UNLOCK') unmount()
      else if (message.type === 'SYNC') applyState(message.state)
    })

    fetchState().then(applyState)
  }

  if (isBridgePage) setupBridge()
  else setupOverlay()
})()
