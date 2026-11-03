const BLOCK_RULE_ID = 1
const REDIRECT_RULE_ID = 2
const STORAGE_KEY = 'focuslyLock'
const ALARM_NAME = 'focusly-unlock'

const RESOURCE_TYPES = [
  'main_frame',
  'sub_frame',
  'stylesheet',
  'script',
  'image',
  'font',
  'object',
  'xmlhttprequest',
  'ping',
  'media',
  'websocket',
  'webtransport',
  'webbundle',
  'other',
]

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message || typeof message.type !== 'string') return
  if (message.type === 'lock') {
    lock(message).then(sendResponse)
    return true
  }
  if (message.type === 'unlock') {
    unlock().then(sendResponse)
    return true
  }
  if (message.type === 'status') {
    status().then(sendResponse)
    return true
  }
})

function normalizeHosts(hosts) {
  const out = new Set()
  for (const raw of Array.isArray(hosts) ? hosts : []) {
    if (typeof raw !== 'string') continue
    const host = raw
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/.*$/, '')
      .replace(/:\d+$/, '')
    if (host.includes('.')) out.add(host)
  }
  return [...out]
}

async function applyRules(hosts) {
  const blockRule = {
    id: BLOCK_RULE_ID,
    priority: 1,
    action: { type: 'block' },
    condition: { requestDomains: hosts, resourceTypes: RESOURCE_TYPES },
  }
  const redirectRule = {
    id: REDIRECT_RULE_ID,
    priority: 2,
    action: { type: 'redirect', redirect: { extensionPath: '/blocked.html' } },
    condition: { requestDomains: hosts, resourceTypes: ['main_frame'] },
  }
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [BLOCK_RULE_ID, REDIRECT_RULE_ID],
    addRules: [blockRule, redirectRule],
  })
}

async function lock({ hosts, expiresAt, appOrigin }) {
  const clean = normalizeHosts(hosts)
  if (!clean.length || !Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
    await unlock()
    return { ok: false, status: { engaged: false } }
  }
  await applyRules(clean)
  await chrome.storage.local.set({
    [STORAGE_KEY]: { hosts: clean, expiresAt, appOrigin: typeof appOrigin === 'string' ? appOrigin : '' },
  })
  chrome.alarms.create(ALARM_NAME, { when: expiresAt })
  return { ok: true, status: { engaged: true, hosts: clean, expiresAt } }
}

async function unlock() {
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [BLOCK_RULE_ID, REDIRECT_RULE_ID],
  })
  await chrome.storage.local.remove(STORAGE_KEY)
  chrome.alarms.clear(ALARM_NAME)
  return { ok: true, status: { engaged: false } }
}

async function status() {
  const rules = await chrome.declarativeNetRequest.getDynamicRules()
  const engaged = rules.some((rule) => rule.id === BLOCK_RULE_ID)
  if (!engaged) {
    await chrome.storage.local.remove(STORAGE_KEY)
    return { ok: true, status: { engaged: false } }
  }
  const data = (await chrome.storage.local.get(STORAGE_KEY))[STORAGE_KEY]
  if (!data || !Number.isFinite(data.expiresAt) || data.expiresAt <= Date.now()) {
    await unlock()
    return { ok: true, status: { engaged: false } }
  }
  return {
    ok: true,
    status: { engaged: true, hosts: data.hosts, expiresAt: data.expiresAt, appOrigin: data.appOrigin },
  }
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) unlock()
})

// Alarms do not survive a browser restart; reconcile rules and storage on boot.
async function reconcile() {
  const rules = await chrome.declarativeNetRequest.getDynamicRules()
  const hasRules = rules.some((rule) => rule.id === BLOCK_RULE_ID)
  const data = (await chrome.storage.local.get(STORAGE_KEY))[STORAGE_KEY]
  const valid = data && Number.isFinite(data.expiresAt) && data.expiresAt > Date.now()
  if (!valid) {
    if (hasRules || data) await unlock()
    return
  }
  const clean = normalizeHosts(data.hosts)
  if (!clean.length) {
    await unlock()
    return
  }
  await applyRules(clean)
  chrome.alarms.create(ALARM_NAME, { when: data.expiresAt })
}

chrome.runtime.onStartup.addListener(() => reconcile())
chrome.runtime.onInstalled.addListener(() => reconcile())
