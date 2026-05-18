import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const { login, register } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (isRegister) {
      if (!name.trim()) return setError('Name is required');
      const res = register(name, email, password);
      if (res.success) navigate('/dashboard');
      else setError(res.error);
    } else {
      const res = login(email, password);
      if (res.success) navigate('/dashboard');
      else setError(res.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-[500px] h-[500px] rounded-full opacity-8 animate-float" style={{ background: 'radial-gradient(circle, var(--color-primary), transparent)', top: '-10%', right: '-10%' }} />
        <div className="absolute w-[400px] h-[400px] rounded-full opacity-8 animate-float" style={{ background: 'radial-gradient(circle, var(--color-accent), transparent)', bottom: '-10%', left: '-10%', animationDelay: '3s' }} />
      </div>

      <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5 }}
        className="glass-card w-full max-w-md p-8 relative z-10">
        <div className="text-center mb-8">
          <h1 className={`text-2xl font-bold font-[var(--font-display)] ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {isRegister ? 'Join MechCalc Pro for free' : 'Sign in to your account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div className="relative">
              <User size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)}
                className="input-field pl-10" required />
            </div>
          )}
          <div className="relative">
            <Mail size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
              className="input-field pl-10" required />
          </div>
          <div className="relative">
            <Lock size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            <input type={showPass ? 'text' : 'password'} placeholder="Password" value={password}
              onChange={e => setPassword(e.target.value)} className="input-field pl-10 pr-10" required />
            <button type="button" onClick={() => setShowPass(!showPass)}
              className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {error && (
            <div className="text-xs text-[var(--color-danger)] bg-[var(--color-danger)]/10 px-3 py-2 rounded-lg">{error}</div>
          )}

          <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 py-3">
            {isRegister ? 'Create Account' : 'Sign In'} <ArrowRight size={16} />
          </button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={() => { setIsRegister(!isRegister); setError(''); }}
            className={`text-sm ${isDark ? 'text-gray-400 hover:text-[var(--color-primary)]' : 'text-gray-500 hover:text-[var(--color-primary-dark)]'} transition-colors`}>
            {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
