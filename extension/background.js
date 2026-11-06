const STATE_KEY = 'focusguard_session'
const ALARM_ID = 'focusguard_unlock'

function hostMatches(hostname, hosts) {
  const h = String(hostname || '').toLowerCase()
  return (hosts || []).some((raw) => {
    const base = String(raw).toLowerCase()
    return base && (h === base || h.endsWith('.' + base))
  })
}

function isBlockedUrl(url, hosts) {
  try {
    const u = new URL(url)
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return false
    return hostMatches(u.hostname, hosts)
  } catch {
    return false
  }
}

async function getState() {
  const data = await chrome.storage.local.get(STATE_KEY)
  const state = data[STATE_KEY]
  if (!state || !Array.isArray(state.hosts) || typeof state.endsAt !== 'number') return null
  if (Date.now() >= state.endsAt) {
    await clearState()
    return null
  }
  return state
}

async function clearState() {
  await chrome.storage.local.remove(STATE_KEY)
  await chrome.alarms.clear(ALARM_ID)
}

async function broadcast(type, state) {
  const tabs = await chrome.tabs.query({})
  await Promise.all(
    tabs.map((tab) => {
      if (!tab.id) return Promise.resolve()
      return chrome.tabs
        .sendMessage(tab.id, { channel: 'focusguard', type, state: state || null })
        .catch(() => {})
    }),
  )
}

async function injectIntoBlockedTabs(state) {
  const tabs = await chrome.tabs.query({})
  for (const tab of tabs) {
    if (!tab.id || !tab.url || !isBlockedUrl(tab.url, state.hosts)) continue
    try {
      await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] })
    } catch {
      /* tab terlarang seperti chrome:// — abaikan */
    }
  }
}

async function startSession(hosts, endsAt) {
  const cleanHosts = (hosts || [])
    .map((h) => String(h).toLowerCase().trim())
    .filter((h) => h.length > 0)
  if (cleanHosts.length === 0 || !Number.isFinite(endsAt) || endsAt <= Date.now()) {
    await stopSession()
    return false
  }
  const state = { hosts: cleanHosts, endsAt }
  await chrome.storage.local.set({ [STATE_KEY]: state })
  await chrome.alarms.create(ALARM_ID, { when: endsAt })
  await injectIntoBlockedTabs(state)
  await broadcast('SYNC', state)
  return true
}

async function stopSession() {
  await clearState()
  await broadcast('UNLOCK', null)
}

async function restoreSession() {
  const state = await getState()
  if (!state) return
  await chrome.alarms.create(ALARM_ID, { when: state.endsAt })
  await injectIntoBlockedTabs(state)
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || message.channel !== 'focusguard') return

  if (message.type === 'GET_STATE') {
    getState().then((state) => sendResponse({ ok: true, state }))
    return true
  }

  if (message.type === 'START' || message.type === 'STOP') {
    const origin = sender.url || ''
    if (!/^https?:\/\/(localhost|127\.0\.0\.1)([/:?#]|$)/.test(origin)) {
      sendResponse({ ok: false })
      return false
    }
    const task =
      message.type === 'START'
        ? startSession(message.hosts, message.endsAt).then((active) => ({ ok: true, active }))
        : stopSession().then(() => ({ ok: true, active: false }))
    task.then(sendResponse)
    return true
  }
})

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_ID) stopSession()
})

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'loading' || !tab.url) return
  getState().then((state) => {
    if (!state || !isBlockedUrl(tab.url, state.hosts)) return
    return chrome.scripting
      .executeScript({ target: { tabId }, files: ['content.js'] })
      .catch(() => {})
  })
})

chrome.runtime.onInstalled.addListener(() => restoreSession())
chrome.runtime.onStartup.addListener(() => restoreSession())
