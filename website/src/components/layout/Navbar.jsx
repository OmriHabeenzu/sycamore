import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Leaf } from 'lucide-react'

const navLinks = [
  { name: 'Home',        path: '/' },
  { name: 'About',       path: '/about' },
  { name: 'Products',    path: '/products' },
  { name: 'Membership',  path: '/membership' },
  { name: 'News',        path: '/news' },
  { name: 'Contact',     path: '/contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary-700 rounded-xl flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-display font-bold text-lg text-primary-800 leading-tight">Sycamore</div>
              <div className="text-xs text-primary-600 leading-tight">Cooperative</div>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map(l => (
              <Link
                key={l.path}
                to={l.path}
                className={`font-medium transition-colors text-sm ${
                  pathname === l.path
                    ? 'text-primary-700'
                    : 'text-gray-600 hover:text-primary-700'
                }`}
              >
                {l.name}
              </Link>
            ))}
            <Link to="/membership#apply" className="btn-primary text-sm">
              Join Now
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            aria-label="Toggle menu"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="lg:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col gap-2">
              {navLinks.map(l => (
                <Link
                  key={l.path}
                  to={l.path}
                  onClick={() => setOpen(false)}
                  className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                    pathname === l.path
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {l.name}
                </Link>
              ))}
              <Link
                to="/membership#apply"
                onClick={() => setOpen(false)}
                className="btn-primary text-sm text-center mt-2"
              >
                Join Now
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
