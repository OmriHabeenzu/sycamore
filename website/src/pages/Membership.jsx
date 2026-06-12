import { useState, useEffect } from 'react'
import { CheckCircle, Users, Leaf, ArrowRight, AlertCircle, Loader } from 'lucide-react'
import api from '../api/axios'

const steps = [
  { num: '01', title: 'Invitation',   desc: 'You must be referred by an existing Sycamore member. The referring member introduces you and their name is permanently linked to your profile.' },
  { num: '02', title: 'Orientation',  desc: 'A 15–20 minute session via call, WhatsApp, or in-person covering how savings, loans, and farm investment work. You\'ll have 48 hours for questions.' },
  { num: '03', title: 'Application',  desc: 'Complete the membership form with your personal details, occupation, monthly savings commitment, and next of kin.' },
  { num: '04', title: 'Agreement',    desc: 'Sign the Sycamore Member Agreement. You\'ll receive a copy, get added to the WhatsApp group, and your profile is created in the system.' },
  { num: '05', title: 'Activation',   desc: 'Membership activates the moment you make your first savings contribution. No first contribution — no active membership.' },
]

const benefits = [
  'Access to low-interest loans funded by the collective pool',
  'Annual dividends from cooperative profits and farm investments',
  'Digital account management via WhatsApp',
  'Benevolent fund support during emergencies and bereavements',
  'Equal vote in cooperative governance and elections',
  'Participation in shared farm investment opportunities',
]

const INIT = {
  full_name: '', nrc_number: '', phone: '', email: '',
  gender: '', dob: '', occupation: '', monthly_income: '', monthly_commitment: '',
  nok_name: '', nok_phone: '', nok_relationship: '',
  referred_by: '', notes: '',
}

export default function Membership() {
  const [form, setForm] = useState(INIT)
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const hash = window.location.hash
    if (hash === '#apply') {
      const el = document.getElementById('apply')
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')
    try {
      await api.post('/public/membership-applications', form)
      setStatus('success')
      setForm(INIT)
    } catch (err) {
      setStatus('error')
      setErrorMsg(
        err.response?.data?.message ||
        'Something went wrong. Please try again or contact us via WhatsApp.'
      )
    }
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-primary-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-primary-700/50 border border-primary-600/40 rounded-full px-4 py-2 text-sm text-primary-200 mb-6">
              <Users className="w-4 h-4" /> Membership
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-extrabold mb-5">Become a Member</h1>
            <p className="text-lg text-primary-200 leading-relaxed">
              Sycamore membership is exclusive and referral-based — ensuring we maintain a
              trusted, high-quality community of committed members.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-14 items-start">
            <div>
              <h2 className="section-heading mb-5">Member Benefits</h2>
              <p className="text-gray-600 leading-relaxed mb-8">
                As a Sycamore member, you're not a customer — you're a co-owner. Everything the
                cooperative earns comes back to you.
              </p>
              <ul className="space-y-3">
                {benefits.map(b => (
                  <li key={b} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
                    <span className="text-gray-700">{b}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-primary-50 border border-primary-100 rounded-2xl p-6">
              <Leaf className="w-7 h-7 text-primary-700 mb-3" />
              <h3 className="font-display font-bold text-gray-900 text-lg mb-3">Referral Accountability</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-3">
                The member who refers you carries a degree of accountability. If a new member
                defaults on a loan within their first 12 months, the referring member is reviewed
                before being permitted to refer again.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed">
                Consistent referrers of reliable, active members are recognised and rewarded.
                This keeps our community strong.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How to join steps */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="section-heading mb-4">The 5-Step Journey</h2>
            <p className="section-sub">From first contact to active membership — a clear, simple process.</p>
          </div>
          <div className="space-y-6 max-w-3xl mx-auto">
            {steps.map(s => (
              <div key={s.num} className="flex gap-5 items-start">
                <div className="w-14 h-14 bg-primary-700 text-white rounded-full flex items-center justify-center font-display font-bold text-sm shrink-0">
                  {s.num}
                </div>
                <div className="pt-2">
                  <h4 className="font-display font-bold text-gray-900 text-lg mb-1">{s.title}</h4>
                  <p className="text-gray-600 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section id="apply" className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="section-heading mb-4">Membership Application</h2>
            <p className="text-gray-600 leading-relaxed">
              Fill in the form below. Once submitted, our team will review your application
              and be in touch via WhatsApp within 2 business days.
            </p>
          </div>

          {status === 'success' ? (
            <div className="bg-primary-50 border border-primary-200 rounded-2xl p-10 text-center">
              <CheckCircle className="w-16 h-16 text-primary-600 mx-auto mb-4" />
              <h3 className="text-2xl font-display font-bold text-gray-900 mb-3">Application Received!</h3>
              <p className="text-gray-600 leading-relaxed max-w-md mx-auto">
                Thank you for applying. Our team will review your application and contact you
                via WhatsApp within 2 business days to schedule your orientation.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="card space-y-6">
              {/* Personal Details */}
              <div>
                <h3 className="font-display font-bold text-gray-900 text-lg mb-4 pb-2 border-b border-gray-100">
                  Personal Details
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Full Name *</label>
                    <input name="full_name" value={form.full_name} onChange={handleChange}
                      required className="input-field" placeholder="As on your NRC" />
                  </div>
                  <div>
                    <label className="label">NRC Number *</label>
                    <input name="nrc_number" value={form.nrc_number} onChange={handleChange}
                      required className="input-field" placeholder="e.g. 123456/78/1" />
                  </div>
                  <div>
                    <label className="label">Phone Number *</label>
                    <input name="phone" value={form.phone} onChange={handleChange}
                      required type="tel" className="input-field" placeholder="+260 XXX XXX XXX" />
                  </div>
                  <div>
                    <label className="label">Email Address</label>
                    <input name="email" value={form.email} onChange={handleChange}
                      type="email" className="input-field" placeholder="Optional" />
                  </div>
                  <div>
                    <label className="label">Gender</label>
                    <select name="gender" value={form.gender} onChange={handleChange} className="input-field">
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Date of Birth</label>
                    <input name="dob" value={form.dob} onChange={handleChange}
                      type="date" className="input-field" />
                  </div>
                  <div>
                    <label className="label">Occupation *</label>
                    <input name="occupation" value={form.occupation} onChange={handleChange}
                      required className="input-field" placeholder="e.g. Farmer, Teacher, Trader" />
                  </div>
                  <div>
                    <label className="label">Monthly Income (ZMW)</label>
                    <input name="monthly_income" value={form.monthly_income} onChange={handleChange}
                      type="number" min="0" className="input-field" placeholder="Optional" />
                  </div>
                  <div>
                    <label className="label">Monthly Savings Commitment (ZMW) *</label>
                    <input name="monthly_commitment" value={form.monthly_commitment} onChange={handleChange}
                      required type="number" min="100" className="input-field" placeholder="Minimum ZMW 100" />
                  </div>
                </div>
              </div>

              {/* Next of Kin */}
              <div>
                <h3 className="font-display font-bold text-gray-900 text-lg mb-4 pb-2 border-b border-gray-100">
                  Next of Kin
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="label">Full Name *</label>
                    <input name="nok_name" value={form.nok_name} onChange={handleChange}
                      required className="input-field" placeholder="Next of kin name" />
                  </div>
                  <div>
                    <label className="label">Phone Number *</label>
                    <input name="nok_phone" value={form.nok_phone} onChange={handleChange}
                      required type="tel" className="input-field" placeholder="+260 XXX XXX XXX" />
                  </div>
                  <div>
                    <label className="label">Relationship *</label>
                    <input name="nok_relationship" value={form.nok_relationship} onChange={handleChange}
                      required className="input-field" placeholder="e.g. Spouse, Parent" />
                  </div>
                </div>
              </div>

              {/* Referral */}
              <div>
                <h3 className="font-display font-bold text-gray-900 text-lg mb-4 pb-2 border-b border-gray-100">
                  Referral
                </h3>
                <div>
                  <label className="label">Referred By (existing member's name) *</label>
                  <input name="referred_by" value={form.referred_by} onChange={handleChange}
                    required className="input-field" placeholder="Full name of the member who invited you" />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Sycamore membership is by invitation only. You must be referred by an active member.
                </p>
              </div>

              {/* Notes */}
              <div>
                <label className="label">Additional Notes</label>
                <textarea name="notes" value={form.notes} onChange={handleChange}
                  rows={3} className="input-field resize-none"
                  placeholder="Anything else you'd like us to know?" />
              </div>

              {/* Error */}
              {status === 'error' && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="btn-primary w-full justify-center py-4 text-base disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? (
                  <><Loader className="w-5 h-5 animate-spin" /> Submitting...</>
                ) : (
                  <>Submit Application <ArrowRight className="w-5 h-5" /></>
                )}
              </button>

              <p className="text-xs text-center text-gray-500">
                By submitting, you agree that your information will be reviewed by Sycamore management.
                We do not share your data with third parties.
              </p>
            </form>
          )}
        </div>
      </section>
    </>
  )
}
