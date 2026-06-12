import { Link } from 'react-router-dom'
import { Leaf, Eye, Heart, Users, Sprout, ArrowRight } from 'lucide-react'

const team = [
  { name: 'Board of Directors', role: 'Elected Governance', desc: 'Our elected board ensures democratic oversight and accountability for all cooperative decisions.' },
  { name: 'Management Team',    role: 'Operations',         desc: 'Day-to-day operations managed by Stalwart Services Limited — experienced in finance, agriculture, and technology.' },
  { name: 'Loan Committee',     role: 'Credit Review',      desc: 'A dedicated committee reviews and approves loan applications ensuring fairness and sustainability.' },
]

const milestones = [
  { year: '2023', text: 'Sycamore Agricultural Services Cooperative founded in Lusaka, Zambia.' },
  { year: '2024', text: 'Reached 200 active members. First farm investment pool launched.' },
  { year: '2025', text: 'Launched digital savings management powered by Stalwart Services Limited.' },
  { year: '2026', text: 'Expanding membership nationally with a focus on rural farming communities.' },
]

export default function About() {
  return (
    <>
      {/* Hero */}
      <section className="bg-primary-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-primary-700/50 border border-primary-600/40 rounded-full px-4 py-2 text-sm text-primary-200 mb-6">
              <Leaf className="w-4 h-4" /> Our Story
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-extrabold mb-5">About Sycamore</h1>
            <p className="text-lg text-primary-200 leading-relaxed">
              A farmer-first, community-owned cooperative built on the principles of sustainability,
              transparency, and collective prosperity. Founded in Zambia, grown by its members.
            </p>
          </div>
        </div>
      </section>

      {/* Who we are */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <h2 className="section-heading mb-5">Who We Are</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Sycamore Agricultural Services Cooperative (SAS) is a registered savings and credit
                cooperative based in Zambia. We bring together farmers, professionals, and community
                members who share a commitment to sustainable financial growth.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                Unlike commercial banks, Sycamore is owned entirely by its members. Every deposit
                you make strengthens the collective pool — available to others as affordable loans
                and channelled into shared agricultural investments.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Our administration is managed by <strong>Stalwart Services Limited</strong>, ensuring
                professional management, digital systems, and accountability while the cooperative
                remains member-governed.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-5">
              {[
                { icon: <Users className="w-6 h-6" />,  title: 'Member-Owned',   desc: 'Every member is a shareholder with equal voting rights.' },
                { icon: <Sprout className="w-6 h-6" />, title: 'Agri-Focused',   desc: 'Products designed around Zambia\'s farming realities.' },
                { icon: <Leaf className="w-6 h-6" />,   title: 'Sustainable',    desc: 'Long-term thinking — for people and the environment.' },
                { icon: <Heart className="w-6 h-6" />,  title: 'Community-Led',  desc: 'Referral membership keeps our community high-quality.' },
              ].map(item => (
                <div key={item.title} className="bg-primary-50 rounded-2xl p-5">
                  <div className="w-10 h-10 bg-primary-700 text-white rounded-xl flex items-center justify-center mb-3">
                    {item.icon}
                  </div>
                  <h4 className="font-display font-bold text-gray-900 mb-1">{item.title}</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="card border-l-4 border-primary-600">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                  <Heart className="w-5 h-5 text-primary-700" />
                </div>
                <h3 className="text-xl font-display font-bold text-gray-900">Our Mission</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                To empower Zambian farmers and community members through sustainable cooperative
                savings, affordable credit, and shared agricultural investment — building lasting
                wealth from the ground up.
              </p>
            </div>
            <div className="card border-l-4 border-earth-500">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-earth-50 rounded-xl flex items-center justify-center">
                  <Eye className="w-5 h-5 text-earth-600" />
                </div>
                <h3 className="text-xl font-display font-bold text-gray-900">Our Vision</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                A Zambia where every farmer has access to dignified financial services — not charity,
                but cooperative ownership. A nation where rural communities thrive through shared
                prosperity and renewable agricultural practices.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Milestones */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="section-heading mb-4">Our Journey</h2>
            <p className="section-sub">From a small savings group to a growing national cooperative.</p>
          </div>
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-primary-100" />
            <div className="space-y-8">
              {milestones.map(m => (
                <div key={m.year} className="flex gap-6 items-start">
                  <div className="w-16 h-16 bg-primary-700 text-white rounded-full flex items-center justify-center font-display font-bold text-sm shrink-0 relative z-10">
                    {m.year}
                  </div>
                  <div className="pt-3">
                    <p className="text-gray-700 leading-relaxed">{m.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Governance */}
      <section className="py-20 bg-primary-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="section-heading text-white mb-4">How We're Governed</h2>
            <p className="text-primary-300 text-lg max-w-2xl mx-auto">
              Sycamore operates under Zambia's Cooperatives Act. Every member has an equal vote.
              Leadership is elected by members, not appointed by investors.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {team.map(t => (
              <div key={t.name} className="bg-primary-800/40 border border-primary-700 rounded-2xl p-6">
                <div className="text-earth-400 text-sm font-semibold uppercase tracking-wider mb-2">{t.role}</div>
                <h3 className="font-display font-bold text-white text-lg mb-3">{t.name}</h3>
                <p className="text-primary-300 text-sm leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">Want to be part of this?</h2>
          <p className="text-gray-600 mb-8">Join Sycamore through a referral from an existing member and start your cooperative journey.</p>
          <Link to="/membership" className="btn-primary">
            Learn How to Join <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </>
  )
}
