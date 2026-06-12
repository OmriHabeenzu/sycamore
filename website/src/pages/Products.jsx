import { Link } from 'react-router-dom'
import { HandCoins, TrendingUp, Sprout, GraduationCap, Umbrella, Heart, ArrowRight, CheckCircle } from 'lucide-react'

const savings = [
  {
    title: 'Regular Savings',
    desc: 'Commit to a fixed monthly amount — starting from as little as ZMW 100. Your savings grow steadily and are available when you need them.',
    features: ['Flexible monthly amounts', 'Competitive interest earnings', 'Accessible with notice', 'Dividend share at year end'],
  },
  {
    title: 'Share Capital',
    desc: 'Purchase ownership shares in the cooperative. Shares represent your equity stake and entitle you to dividends based on cooperative profits.',
    features: ['One-time or periodic purchase', 'Earns annual dividends', 'Strengthens borrowing capacity', 'Redeemable on exit'],
  },
]

const loans = [
  { icon: <HandCoins className="w-6 h-6" />,    title: 'Personal Loan',     rate: 'Low Interest', desc: 'For personal needs — household items, school fees, emergencies. Up to 3× your savings balance.' },
  { icon: <Sprout className="w-6 h-6" />,        title: 'Agricultural Loan', rate: 'Low Interest', desc: 'Aligned with farming seasons. Fund inputs, equipment, or land improvement projects.' },
  { icon: <TrendingUp className="w-6 h-6" />,    title: 'Business Loan',     rate: 'Low Interest', desc: 'Grow your small business or side hustle. Flexible repayment structured around cash flow.' },
  { icon: <GraduationCap className="w-6 h-6" />, title: 'Education Loan',    rate: 'Low Interest', desc: 'Invest in your children\'s future. Covers school fees, uniforms, and learning materials.' },
  { icon: <Umbrella className="w-6 h-6" />,      title: 'Emergency Loan',    rate: 'Flat Rate',    desc: 'Rapid disbursement for genuine emergencies. Reviewed and approved within 24 hours.' },
]

const farmInvestment = [
  'Pooled investment into agricultural ventures selected by the board',
  'Members earn a proportional return based on their share contribution',
  'Investments chosen for sustainability and environmental impact',
  'Annual reporting on all farm investment activities',
  'Focus on crops and practices aligned with Zambia\'s climate',
]

export default function Products() {
  return (
    <>
      {/* Hero */}
      <section className="bg-primary-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-display font-extrabold mb-5">Products &amp; Services</h1>
            <p className="text-lg text-primary-200 leading-relaxed">
              Three pillars designed for the Zambian context — save sustainably, borrow affordably,
              and invest in your agricultural future.
            </p>
          </div>
        </div>
      </section>

      {/* Savings */}
      <section id="savings" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center">
              <HandCoins className="w-6 h-6 text-primary-700" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold text-gray-900">Savings Accounts</h2>
              <p className="text-gray-500 text-sm">Build your financial foundation</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {savings.map(s => (
              <div key={s.title} className="card">
                <h3 className="text-xl font-display font-bold text-gray-900 mb-3">{s.title}</h3>
                <p className="text-gray-600 leading-relaxed mb-5">{s.desc}</p>
                <ul className="space-y-2">
                  {s.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-primary-600 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Loans */}
      <section id="loans" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 bg-earth-50 rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-earth-600" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold text-gray-900">Loan Products</h2>
              <p className="text-gray-500 text-sm">Affordable credit from the collective pool</p>
            </div>
          </div>
          <div className="bg-earth-50 border border-earth-200 rounded-2xl p-5 mb-10 text-sm text-earth-700">
            <strong>Eligibility:</strong> Members must have saved for a minimum qualifying period before loan access.
            Loan amounts are based on your savings balance. Interest earnings return to the cooperative pool as dividends.
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loans.map(l => (
              <div key={l.title} className="card">
                <div className="w-10 h-10 bg-earth-100 rounded-xl flex items-center justify-center text-earth-600 mb-4">
                  {l.icon}
                </div>
                <div className="text-xs font-semibold text-earth-600 uppercase tracking-wider mb-1">{l.rate}</div>
                <h3 className="font-display font-bold text-gray-900 text-lg mb-2">{l.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{l.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Farm Investment */}
      <section id="farm" className="py-20 bg-primary-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <div className="w-12 h-12 bg-primary-700 rounded-2xl flex items-center justify-center mb-6">
                <Sprout className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-display font-bold text-white mb-5">Farm Investment Pool</h2>
              <p className="text-primary-200 leading-relaxed mb-6">
                Beyond savings and loans, Sycamore channels collective resources into
                sustainable agricultural ventures. Members share in the returns — growing
                wealth while contributing to Zambia's food security.
              </p>
              <ul className="space-y-3">
                {farmInvestment.map(f => (
                  <li key={f} className="flex items-start gap-3 text-sm text-primary-200">
                    <CheckCircle className="w-4 h-4 text-earth-400 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-primary-800/40 border border-primary-700 rounded-2xl p-8">
              <Heart className="w-8 h-8 text-earth-400 mb-4" />
              <h3 className="text-xl font-display font-bold text-white mb-3">Benevolent Fund</h3>
              <p className="text-primary-300 leading-relaxed text-sm mb-4">
                In addition to investment, Sycamore maintains a member benevolent fund —
                providing support during bereavements, medical emergencies, and other hardships.
                Because a cooperative looks after its own.
              </p>
              <p className="text-xs text-primary-400">Available to members in good standing.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">Ready to access these products?</h2>
          <p className="text-gray-600 mb-8">You need to become a member first. The process is simple and referral-based.</p>
          <Link to="/membership#apply" className="btn-primary">
            Apply for Membership <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </>
  )
}
