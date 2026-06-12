import { Link } from 'react-router-dom'
import { Leaf, Phone, Mail, MapPin, Share2 } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-primary-950 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-display font-bold text-white text-lg leading-tight">Sycamore</div>
                <div className="text-xs text-primary-300 leading-tight">Agricultural Cooperative</div>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Empowering Zambian farmers and communities through sustainable cooperative savings,
              affordable loans, and shared agricultural investment.
            </p>
            <div className="flex gap-3 mt-5">
              {['Facebook', 'X / Twitter', 'Instagram'].map(s => (
                <a key={s} href="#" aria-label={s} className="w-9 h-9 bg-primary-800 rounded-lg flex items-center justify-center hover:bg-primary-700 transition-colors">
                  <Share2 className="w-4 h-4 text-white" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-display font-bold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {[
                { name: 'Home',        path: '/' },
                { name: 'About Us',    path: '/about' },
                { name: 'Products',    path: '/products' },
                { name: 'Membership',  path: '/membership' },
                { name: 'News',        path: '/news' },
                { name: 'Contact',     path: '/contact' },
              ].map(l => (
                <li key={l.path}>
                  <Link to={l.path} className="hover:text-primary-300 transition-colors">{l.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Products */}
          <div>
            <h4 className="font-display font-bold text-white mb-4">Our Products</h4>
            <ul className="space-y-2 text-sm">
              {[
                'Savings Accounts',
                'Member Loans',
                'Farm Investment',
                'Emergency Fund',
                'Education Support',
                'Benevolent Fund',
              ].map(item => (
                <li key={item}>
                  <Link to="/products" className="hover:text-primary-300 transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-bold text-white mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-primary-400 mt-0.5 shrink-0" />
                <span>Second floor, Woodgate House<br/>Along Cairo Rd, Lusaka<br/>PO Box CA 136, Lusaka</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary-400 shrink-0" />
                <a href="tel:+260976054486" className="hover:text-primary-300 transition-colors">+260 976 054 486</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary-400 shrink-0" />
                <a href="mailto:sycamore.agric@gmail.com" className="hover:text-primary-300 transition-colors">sycamore.agric@gmail.com</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-primary-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Sycamore Agricultural Services Cooperative. All rights reserved.</p>
          <p>Managed by <a href="https://stalwartzm.com" target="_blank" rel="noreferrer" className="text-primary-400 hover:text-primary-300">Stalwart Services Limited</a></p>
        </div>
      </div>
    </footer>
  )
}
