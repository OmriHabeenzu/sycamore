import { useState, useEffect, useRef } from 'react'
import { MessageSquare, X, Send, Loader } from 'lucide-react'
import api from '../api/axios'

function getSessionId() {
  let id = localStorage.getItem('sycamore_chat_session')
  if (!id) {
    id = 'sess_' + Math.random().toString(36).slice(2) + Date.now()
    localStorage.setItem('sycamore_chat_session', id)
  }
  return id
}

export default function ChatWidget() {
  const [open, setOpen]               = useState(false)
  const [messages, setMessages]       = useState([])
  const [input, setInput]             = useState('')
  const [sending, setSending]         = useState(false)
  const [started, setStarted]         = useState(false)
  const [info, setInfo]               = useState({ name: '', phone: '' })
  const [lastId, setLastId]           = useState(0)
  const bottomRef                     = useRef(null)
  const sessionId                     = getSessionId()

  useEffect(() => {
    if (!open || !started) return
    const poll = setInterval(() => {
      api.get(`/public/chat/${sessionId}?since=${lastId}`)
        .then(res => {
          const msgs = res.data?.data || []
          if (msgs.length > 0) {
            setMessages(prev => [...prev, ...msgs])
            setLastId(msgs[msgs.length - 1].id)
          }
        })
        .catch(() => {})
    }, 4000)
    return () => clearInterval(poll)
  }, [open, started, lastId, sessionId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const startChat = async () => {
    if (!info.name.trim()) return
    setSending(true)
    try {
      await api.post('/public/chat', {
        session_id: sessionId,
        visitor_name: info.name,
        visitor_phone: info.phone,
        message: `Hi, I'm ${info.name}. I'd like some information about Sycamore Cooperative.`,
      })
      setMessages([{
        id: 0,
        sender: 'visitor',
        message: `Hi, I'm ${info.name}. I'd like some information about Sycamore Cooperative.`,
        created_at: new Date().toISOString(),
      }, {
        id: -1,
        sender: 'staff',
        message: `Hello ${info.name}! Welcome to Sycamore. Our team will respond shortly. In the meantime, feel free to send your question.`,
        created_at: new Date().toISOString(),
      }])
      setStarted(true)
    } catch {
    } finally {
      setSending(false)
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || sending) return
    const text = input.trim()
    setInput('')
    setSending(true)
    setMessages(prev => [...prev, { id: Date.now(), sender: 'visitor', message: text, created_at: new Date().toISOString() }])
    try {
      const res = await api.post('/public/chat', {
        session_id: sessionId,
        visitor_name: info.name,
        visitor_phone: info.phone,
        message: text,
      })
      setLastId(res.data.message_id || lastId)
    } catch {
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-24 right-6 z-50 w-14 h-14 bg-primary-700 rounded-full flex items-center justify-center shadow-lg hover:bg-primary-800 transition-colors"
        aria-label="Open chat"
      >
        {open ? <X className="w-6 h-6 text-white" /> : <MessageSquare className="w-6 h-6 text-white" />}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-44 right-6 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden" style={{ maxHeight: '420px' }}>
          {/* Header */}
          <div className="bg-primary-700 px-4 py-3 flex items-center justify-between">
            <div>
              <div className="font-display font-bold text-white text-sm">Sycamore Support</div>
              <div className="text-xs text-primary-200">We usually reply within a few hours</div>
            </div>
            <button onClick={() => setOpen(false)} className="text-primary-200 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {!started ? (
            /* Intro form */
            <div className="p-4 flex flex-col gap-3 flex-1">
              <p className="text-sm text-gray-600">Before we start, please share your name.</p>
              <input
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="Your name *"
                value={info.name}
                onChange={e => setInfo(p => ({ ...p, name: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && startChat()}
              />
              <input
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="Phone number (optional)"
                value={info.phone}
                onChange={e => setInfo(p => ({ ...p, phone: e.target.value }))}
              />
              <button
                onClick={startChat}
                disabled={!info.name.trim() || sending}
                className="btn-primary text-sm justify-center py-2.5 disabled:opacity-60"
              >
                {sending ? <Loader className="w-4 h-4 animate-spin" /> : 'Start Chat'}
              </button>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: 0 }}>
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.sender === 'visitor' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                      m.sender === 'visitor'
                        ? 'bg-primary-700 text-white rounded-br-sm'
                        : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                    }`}>
                      {m.message}
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="border-t border-gray-100 p-3 flex gap-2">
                <input
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="Type a message..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || sending}
                  className="w-9 h-9 bg-primary-700 rounded-lg flex items-center justify-center hover:bg-primary-800 disabled:opacity-50"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}
