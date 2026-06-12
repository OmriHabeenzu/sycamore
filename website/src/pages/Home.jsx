import { Link } from 'react-router-dom'
import {
  ArrowRight, Sprout, HandCoins, TrendingUp, Users, ShieldCheck,
  Leaf, CheckCircle, ChevronRight
} from 'lucide-react'

const stats = [
  { value: '500+', label: 'Active Members' },
  { value: 'ZMW 2M+', label: 'Savings Pool' },
  { value: '98%', label: 'Repayment Rate' },
  { value: '3+', label: 'Years Running' },
]

const products = [
  {
    icon: <HandCoins className="w-8 h-8" />,
    title: 'Member Savings',
    desc: 'Regular savings plans that grow your wealth steadily. Your money is safe, accessible, and earns competitive returns.',
    color: 'primary',
    link: '/products#savings',
  },
  {
    icon: <TrendingUp className="w-8 h-8" />,
    title: 'Affordable Loans',
    desc: 'Low-interest loans funded by the collective savings pool. Borrow for any need — personal, business, or agricultural.',
    color: 'earth',
    link: '/products#loans',
  },
  {
    icon: <Sprout className="w-8 h-8" />,
    title: 'Farm Investment',
    desc: 'Pooled agricultural investments that generate returns for all members. Grow together, harvest together.',
    color: 'primary',
    link: '/products#farm',
  },
]

const steps = [
  { num: '01', title: 'Get Invited', desc: 'All new members join through a referral from an existing member — keeping our community trusted.' },
  { num: '02', title: 'Attend Orientation', desc: 'A short 15–20 minute session explains how savings, loans, and farm investments work.' },
  { num: '03', title: 'Apply Online', desc: 'Fill in your membership application with your personal details and savings commitment.' },
  { num: '04', title: 'Sign Agreement', desc: 'Review and sign the Sycamore Member Agreement. Your profile is created in our system.' },
  { num: '05', title: 'Make First Contribution', desc: 'Your membership activates the moment you make your first savings contribution.' },
]

const values = [
  { icon: <Leaf className="w-5 h-5" />, text: 'Sustainability-first approach to cooperative finance' },
  { icon: <ShieldCheck className="w-5 h-5" />, text: 'Transparent governance — one member, one vote' },
  { icon: <Users className="w-5 h-5" />, text: 'Community-owned, community-governed' },
  { icon: <Sprout className="w-5 h-5" />, text: 'Agricultural roots with renewable practices' },
]

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary-950 via-primary-800 to-primary-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-earth-400 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary-400 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-24 md:py-36">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-primary-700/50 border border-primary-500/40 rounded-full px-4 py-2 text-sm text-primary-200 mb-6">
              <Leaf className="w-4 h-4 text-primary-300" />
              Renewable &amp; Sustainable Cooperative Finance
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-extrabold leading-tight mb-6">
              Growing Wealth.<br />
              <span className="text-earth-300">Sustaining Zambia.</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-100 mb-10 leading-relaxed max-w-2xl">
              Sycamore is a member-owned cooperative where Zambian farmers and professionals
              save together, borrow affordably, and invest in shared agricultural opportunities.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/membership#apply" className="btn-earth">
                Become a Member <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/products" className="btn-outline border-white text-white hover:bg-white/10">
                Our Products <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map(s => (
              <div key={s.label} className="text-center">
                <div className="text-3xl md:text-4xl font-display font-extrabold text-primary-700">{s.value}</div>
                <div className="text-sm text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="section-heading mb-4">What We Offer</h2>
            <p className="section-sub">
              Three pillars of sustainable cooperative finance — built for the Zambian context.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {products.map(p => (
              <div key={p.title} className="card group">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 ${
                  p.color === 'earth'
                    ? 'bg-earth-50 text-earth-600'
                    : 'bg-primary-50 text-primary-700'
                }`}>
                  {p.icon}
                </div>
                <h3 className="text-xl font-display font-bold text-gray-900 mb-3">{p.title}</h3>
                <p className="text-gray-600 leading-relaxed mb-5">{p.desc}</p>
                <Link
                  to={p.link}
                  className={`inline-flex items-center gap-1 text-sm font-semibold ${
                    p.color === 'earth' ? 'text-earth-600 hover:text-earth-700' : 'text-primary-700 hover:text-primary-800'
                  } transition-colors`}
                >
                  Learn more <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="section-heading mb-4">How to Join</h2>
            <p className="section-sub">
              Membership is by invitation — a five-step journey from prospect to active member.
            </p>
          </div>
          <div className="grid md:grid-cols-5 gap-6">
            {steps.map((s, i) => (
              <div key={s.num} className="relative text-center">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-primary-100 z-0" />
                )}
                <div className="relative z-10 w-16 h-16 bg-primary-700 text-white rounded-full flex items-center justify-center font-display font-bold text-lg mx-auto mb-4">
                  {s.num}
                </div>
                <h4 className="font-display font-bold text-gray-900 mb-2">{s.title}</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/membership#apply" className="btn-primary">
              Apply for Membership <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Values / Why Sycamore */}
      <section className="py-20 bg-primary-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <h2 className="section-heading text-white mb-5">
                Built on Renewable Values
              </h2>
              <p className="text-primary-200 text-lg leading-relaxed mb-8">
                Sycamore is more than a savings group — it's a movement towards sustainable,
                community-driven prosperity. Every decision we make is rooted in long-term
                thinking for people and the planet.
              </p>
              <ul className="space-y-4">
                {values.map(v => (
                  <li key={v.text} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary-700 rounded-lg flex items-center justify-center shrink-0 text-primary-200">
                      {v.icon}
                    </div>
                    <span className="text-primary-100 leading-relaxed">{v.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-5">
              {[
                { title: 'Member-Owned', desc: 'Every member is a co-owner. Profits return to you as dividends.' },
                { title: 'Low Interest', desc: 'Loans at rates far below commercial banks — because we lend to ourselves.' },
                { title: 'Agricultural Focus', desc: 'We understand Zambian farming seasons and cash flow cycles.' },
                { title: 'Digital-Friendly', desc: 'Manage your account via WhatsApp. No branch visits required.' },
              ].map(item => (
                <div key={item.title} className="bg-primary-800/50 border border-primary-700 rounded-2xl p-5">
                  <CheckCircle className="w-6 h-6 text-earth-400 mb-3" />
                  <h4 className="font-display font-bold text-white mb-1">{item.title}</h4>
                  <p className="text-sm text-primary-300 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 bg-earth-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-extrabold text-white mb-4">
            Ready to Start Growing?
          </h2>
          <p className="text-earth-100 text-lg mb-8">
            Join Sycamore today — save regularly, borrow affordably, and invest in Zambia's agricultural future.
          </p>
          <Link to="/membership#apply" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-earth-600 font-bold rounded-xl hover:bg-earth-50 transition-colors shadow-lg text-lg">
            Apply to Join <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </>
  )
}
