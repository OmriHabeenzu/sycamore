import { useState } from 'react'
import { Phone, Mail, MapPin, MessageCircle, CheckCircle, Loader, AlertCircle } from 'lucide-react'
import api from '../api/axios'

const contacts = [
  { icon: <Phone className="w-5 h-5" />,       label: 'Phone',    value: '+260 976 054 486',         href: 'tel:+260976054486' },
  { icon: <Mail className="w-5 h-5" />,         label: 'Email',    value: 'sycamore.agric@gmail.com', href: 'mailto:sycamore.agric@gmail.com' },
  { icon: <MessageCircle className="w-5 h-5" />,label: 'WhatsApp', value: 'Chat with us on WhatsApp', href: 'https://wa.me/260976054486' },
  { icon: <MapPin className="w-5 h-5" />,       label: 'Location', value: 'Second floor, Woodgate House, Along Cairo Rd, Lusaka', href: null },
]

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [status, setStatus] = useState('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')
    try {
      await api.post('/public/contact', form)
      setStatus('success')
      setForm({ name: '', email: '', phone: '', message: '' })
    } catch {
      setStatus('error')
      setErrorMsg('Could not send message. Please try WhatsApp or email us directly.')
    }
  }

  return (
    <>
      <section className="bg-primary-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h1 className="text-4xl md:text-5xl font-display font-extrabold mb-5">Contact Us</h1>
          <p className="text-lg text-primary-200">Have questions? Reach us via WhatsApp, email, or the form below.</p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-14">
            {/* Contact info */}
            <div>
              <h2 className="text-2xl font-display font-bold text-gray-900 mb-2">Get in Touch</h2>
              <p className="text-sm text-gray-500 mb-8">Second floor, Woodgate House, Along Cairo Rd, Lusaka, Zambia<br/>PO Box CA 136, Lusaka</p>
              <div className="space-y-5">
                {contacts.map(c => (
                  <div key={c.label} className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-primary-700 shrink-0">
                      {c.icon}
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 uppercase tracking-wider">{c.label}</div>
                      {c.href ? (
                        <a href={c.href} target={c.href.startsWith('http') ? '_blank' : undefined}
                          rel="noreferrer"
                          className="font-medium text-gray-900 hover:text-primary-700 transition-colors">
                          {c.value}
                        </a>
                      ) : (
                        <div className="font-medium text-gray-900">{c.value}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 bg-primary-50 border border-primary-100 rounded-2xl p-6">
                <h3 className="font-display font-bold text-gray-900 mb-2">Fastest Response</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  For the quickest reply, reach us on <strong>WhatsApp</strong>. Our team
                  typically responds within a few hours during business hours.
                </p>
                <a
                  href="https://wa.me/260976054486?text=Hello%20Sycamore%20Cooperative"
                  target="_blank" rel="noreferrer"
                  className="btn-primary mt-4 text-sm"
                >
                  <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
                </a>
              </div>
            </div>

            {/* Contact form */}
            <div>
              <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">Send a Message</h2>
              {status === 'success' ? (
                <div className="bg-primary-50 border border-primary-200 rounded-2xl p-10 text-center">
                  <CheckCircle className="w-12 h-12 text-primary-600 mx-auto mb-3" />
                  <h3 className="font-display font-bold text-gray-900 text-lg mb-2">Message Sent!</h3>
                  <p className="text-gray-600 text-sm">We'll get back to you within 2 business days.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Full Name *</label>
                      <input name="name" value={form.name} onChange={handleChange}
                        required className="input-field" placeholder="Your name" />
                    </div>
                    <div>
                      <label className="label">Phone Number</label>
                      <input name="phone" value={form.phone} onChange={handleChange}
                        type="tel" className="input-field" placeholder="+260 XXX XXX XXX" />
                    </div>
                  </div>
                  <div>
                    <label className="label">Email Address</label>
                    <input name="email" value={form.email} onChange={handleChange}
                      type="email" className="input-field" placeholder="Optional" />
                  </div>
                  <div>
                    <label className="label">Message *</label>
                    <textarea name="message" value={form.message} onChange={handleChange}
                      required rows={5} className="input-field resize-none"
                      placeholder="How can we help you?" />
                  </div>
                  {status === 'error' && (
                    <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
                      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />{errorMsg}
                    </div>
                  )}
                  <button type="submit" disabled={status === 'loading'}
                    className="btn-primary w-full justify-center py-3.5 disabled:opacity-60">
                    {status === 'loading'
                      ? <><Loader className="w-4 h-4 animate-spin" /> Sending...</>
                      : 'Send Message'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
