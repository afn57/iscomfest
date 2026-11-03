const EXT_SOURCE = 'focusly-ext'
const APP_SOURCE = 'focusly-app'

function toPage(message) {
  window.postMessage({ source: EXT_SOURCE, ...message }, '*')
}

function replyAck(forType, response) {
  toPage({ type: 'ack', for: forType, ok: Boolean(response && response.ok), status: response && response.status })
}

toPage({ type: 'ready' })

window.addEventListener('message', (event) => {
  if (event.source !== window) return
  const message = event.data
  if (!message || message.source !== APP_SOURCE || typeof message.type !== 'string') return

  if (message.type === 'hello') {
    toPage({ type: 'ready' })
    return
  }

  if (message.type === 'lock' || message.type === 'unlock' || message.type === 'status') {
    try {
      chrome.runtime.sendMessage(
        {
          type: message.type,
          hosts: message.hosts,
          expiresAt: message.expiresAt,
          appOrigin: message.appOrigin,
        },
        (response) => {
          if (chrome.runtime.lastError) {
            replyAck(message.type, null)
            return
          }
          replyAck(message.type, response)
        },
      )
    } catch {
      replyAck(message.type, null)
    }
  }
})
