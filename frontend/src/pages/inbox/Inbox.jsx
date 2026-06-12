import { useEffect, useState } from 'react'
import { Mail, MessageSquare, Trash2, Reply, CheckCircle, Clock, Loader, Send, ChevronLeft } from 'lucide-react'
import api from '../../api/axios'

const statusColor = {
  unread:  'bg-red-100 text-red-700',
  read:    'bg-gray-100 text-gray-600',
  replied: 'bg-green-100 text-green-700',
}

export default function Inbox() {
  const [tab, setTab]               = useState('contact') // contact | chat
  const [contacts, setContacts]     = useState([])
  const [sessions, setSessions]     = useState([])
  const [selected, setSelected]     = useState(null)
  const [thread, setThread]         = useState([])
  const [reply, setReply]           = useState('')
  const [sending, setSending]       = useState(false)
  const [loading, setLoading]       = useState(true)

  useEffect(() => { fetchList() }, [tab])

  const fetchList = async () => {
    setLoading(true)
    setSelected(null)
    setThread([])
    try {
      if (tab === 'contact') {
        const res = await api.get('/inbox/contact')
        setContacts(res.data.data)
      } else {
        const res = await api.get('/inbox/chat')
        setSessions(res.data.data)
      }
    } finally {
      setLoading(false)
    }
  }

  const openContact = async (item) => {
    setSelected(item)
    const res = await api.get(`/inbox/contact/${item.id}`)
    setSelected(res.data)
    setReply(res.data.reply || '')
    setContacts(prev => prev.map(c => c.id === item.id ? { ...c, status: 'read' } : c))
  }

  const sendContactReply = async () => {
    if (!reply.trim() || !selected) return
    setSending(true)
    try {
      const res = await api.post(`/inbox/contact/${selected.id}/reply`, { reply })
      setSelected(res.data)
      setContacts(prev => prev.map(c => c.id === selected.id ? { ...c, status: 'replied' } : c))
    } finally {
      setSending(false)
    }
  }

  const deleteContact = async (id) => {
    await api.delete(`/inbox/contact/${id}`)
    setContacts(prev => prev.filter(c => c.id !== id))
    if (selected?.id === id) setSelected(null)
  }

  const openChat = async (session) => {
    setSelected(session)
    const res = await api.get(`/inbox/chat/${session.session_id}`)
    setThread(res.data.data)
    setSessions(prev => prev.map(s => s.session_id === session.session_id ? { ...s, unread_count: 0 } : s))
  }

  const sendChatReply = async () => {
    if (!reply.trim() || !selected) return
    setSending(true)
    try {
      const res = await api.post(`/inbox/chat/${selected.session_id}/reply`, { message: reply })
      setThread(prev => [...prev, res.data])
      setReply('')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Inbox</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab('contact')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'contact' ? 'bg-green-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          <Mail className="w-4 h-4" /> Contact Messages
        </button>
        <button onClick={() => setTab('chat')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'chat' ? 'bg-green-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          <MessageSquare className="w-4 h-4" /> Live Chat
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-12"><Loader className="w-6 h-6 animate-spin text-green-600" /></div>
          ) : tab === 'contact' ? (
            contacts.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-12">No messages yet</p>
            ) : contacts.map(c => (
              <div key={c.id} onClick={() => openContact(c)}
                className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${selected?.id === c.id ? 'bg-green-50' : ''}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-medium text-gray-900 text-sm truncate">{c.name}</div>
                    <div className="text-xs text-gray-500 truncate">{c.message?.slice(0, 60)}...</div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${statusColor[c.status]}`}>{c.status}</span>
                </div>
              </div>
            ))
          ) : (
            sessions.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-12">No chat sessions yet</p>
            ) : sessions.map(s => (
              <div key={s.session_id} onClick={() => openChat(s)}
                className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${selected?.session_id === s.session_id ? 'bg-green-50' : ''}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900 text-sm">{s.visitor_name || 'Anonymous'}</div>
                    {s.visitor_phone && <div className="text-xs text-gray-500">{s.visitor_phone}</div>}
                  </div>
                  {s.unread_count > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{s.unread_count}</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Detail */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col min-h-96">
          {!selected ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              Select a message to view
            </div>
          ) : tab === 'contact' ? (
            <div className="flex flex-col flex-1 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="font-bold text-gray-900">{selected.name}</h2>
                  {selected.email && <div className="text-sm text-gray-500">{selected.email}</div>}
                  {selected.phone && <div className="text-sm text-gray-500">{selected.phone}</div>}
                </div>
                <button onClick={() => deleteContact(selected.id)} className="text-red-400 hover:text-red-600 p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed mb-4">{selected.message}</div>
              {selected.status === 'replied' && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800 mb-4">
                  <div className="font-semibold mb-1 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Your Reply</div>
                  {selected.reply}
                </div>
              )}
              <div className="mt-auto">
                <textarea rows={3} value={reply} onChange={e => setReply(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none resize-none"
                  placeholder="Write a reply (internal note — not sent automatically)..." />
                <button onClick={sendContactReply} disabled={sending || !reply.trim()}
                  className="mt-2 flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-800 disabled:opacity-50">
                  {sending ? <Loader className="w-4 h-4 animate-spin" /> : <Reply className="w-4 h-4" />}
                  Save Reply
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col flex-1">
              <div className="p-4 border-b border-gray-100">
                <div className="font-bold text-gray-900">{selected.visitor_name || 'Anonymous'}</div>
                {selected.visitor_phone && <div className="text-xs text-gray-500">{selected.visitor_phone}</div>}
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {thread.map(m => (
                  <div key={m.id} className={`flex ${m.sender === 'staff' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs px-3 py-2 rounded-xl text-sm ${m.sender === 'staff' ? 'bg-green-700 text-white' : 'bg-gray-100 text-gray-800'}`}>
                      {m.message}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-gray-100 flex gap-2">
                <input value={reply} onChange={e => setReply(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendChatReply()}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                  placeholder="Type a reply..." />
                <button onClick={sendChatReply} disabled={!reply.trim() || sending}
                  className="w-9 h-9 bg-green-700 rounded-lg flex items-center justify-center hover:bg-green-800 disabled:opacity-50">
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
