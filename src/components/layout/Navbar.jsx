import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Sun, Moon, Menu, X, LogOut, User, Calculator } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { isDark, toggle } = useTheme();
  const { user, logout, isLoggedIn } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const links = [
    { to: '/', label: 'Home' },
    { to: '/dashboard', label: 'Calculators' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass" style={{ backdropFilter: 'blur(20px)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center group-hover:shadow-lg group-hover:shadow-[var(--color-primary)]/20 transition-all duration-300">
              <Calculator size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold font-[var(--font-display)] tracking-tight">
              <span className="glow-text">Mech</span>
              <span className={isDark ? 'text-white' : 'text-gray-900'}>Calc</span>
              <span className="text-[var(--color-accent)] text-sm ml-0.5 font-semibold">PRO</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300
                  ${isActive(link.to)
                    ? 'text-[var(--color-primary)] bg-[var(--color-primary)]/10'
                    : isDark ? 'text-gray-300 hover:text-white hover:bg-white/5' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggle}
              className={`p-2 rounded-xl transition-all duration-300 ${isDark ? 'hover:bg-white/10 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

             <a
              href="https://docs.google.com/spreadsheets/d/1zn2scuRsu1p-57HoxPsTVWcju_uMjGF3/edit?usp=drivesdk&ouid=112065794432412324846&rtpof=true&sd=true"
              target="_blank"
              rel="noopener noreferrer"
              className={`p-2 rounded-xl transition-all duration-300 ${isDark ? 'hover:bg-white/10 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
              aria-label="Go to Google"
            >
              <Calculator size={18} />
            </a>

            {/* Auth */}
            {isLoggedIn ? (
              <div className="hidden md:flex items-center gap-2">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm ${isDark ? 'bg-white/5 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                  <User size={14} />
                  <span className="font-medium">{user.name}</span>
                </div>
                <button onClick={logout} className={`p-2 rounded-xl transition-all ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="hidden md:block btn-primary text-sm py-2 px-5">
                Login
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`md:hidden p-2 rounded-xl transition-all ${isDark ? 'hover:bg-white/10 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-white/5"
          >
            <div className="px-4 py-4 space-y-2">
              {links.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all
                    ${isActive(link.to)
                      ? 'text-[var(--color-primary)] bg-[var(--color-primary)]/10'
                      : isDark ? 'text-gray-300 hover:bg-white/5' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  {link.label}
                </Link>
              ))}
              {isLoggedIn ? (
                <button
                  onClick={() => { logout(); setMobileOpen(false); }}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium ${isDark ? 'text-gray-300 hover:bg-white/5' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  Logout ({user.name})
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block btn-primary text-center text-sm py-3"
                >
                  Login
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
