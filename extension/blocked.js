const countdownEl = document.getElementById('countdown')
const messageEl = document.getElementById('message')
const hostsEl = document.getElementById('hosts')
const backEl = document.getElementById('back')

function renderClock(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

chrome.storage.local.get('focuslyLock').then((data) => {
  const lock = data && data.focuslyLock
  if (lock && Array.isArray(lock.hosts)) {
    for (const host of lock.hosts.slice(0, 8)) {
      const chip = document.createElement('span')
      chip.className = 'host'
      chip.textContent = host
      hostsEl.appendChild(chip)
    }
  }
  if (lock && lock.appOrigin) {
    backEl.href = `${lock.appOrigin}/focus`
  }

  const tick = () => {
    if (!lock || !Number.isFinite(lock.expiresAt)) {
      countdownEl.textContent = '--:--'
      return
    }
    const remaining = lock.expiresAt - Date.now()
    if (remaining <= 0) {
      countdownEl.textContent = '00:00'
      messageEl.textContent = 'Sesi fokus selesai. Website sudah bisa dibuka kembali.'
      backEl.classList.remove('hidden')
      return
    }
    countdownEl.textContent = renderClock(remaining)
    window.setTimeout(tick, 1000)
  }
  tick()
})
