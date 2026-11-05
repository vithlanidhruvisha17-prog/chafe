import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Container from '../../components/common/Container';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import { Lock, Mail, ArrowRight, Coffee, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    const token = localStorage.getItem('arabista_admin_token');
    if (token) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/auth/login', {
        email: email.trim(),
        password,
      });

      const data = res.data || res;
      localStorage.setItem('arabista_admin_token', data.token);
      localStorage.setItem('arabista_admin_user', JSON.stringify(data.admin));

      toast.success('Signed in to Arabista operations portal');
      const origin = location.state?.from?.pathname || '/admin/dashboard';
      navigate(origin, { replace: true });
    } catch (err) {
      const msg = err.message || 'Invalid staff credentials. Please check and retry.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory text-charcoal flex flex-col justify-center items-center py-12 px-4 selection:bg-coffee selection:text-ivory">
      <Container className="max-w-md w-full">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-3 group">
            <span className="w-12 h-12 rounded-full bg-forest text-ivory flex items-center justify-center font-serif font-bold text-xl shadow-soft group-hover:scale-105 transition-transform">
              A
            </span>
            <span className="font-serif text-3xl font-bold tracking-tight text-forest">
              ARABISTA
            </span>
          </Link>
          <p className="text-xs font-semibold uppercase tracking-widest text-coffee">
            Kitchen &amp; Operations Portal
          </p>
          <p className="text-xs text-charcoal/60 mt-1 font-sans">
            Authorized staff access &bull; Surat, Gujarat
          </p>
        </div>

        <Card className="p-8 sm:p-10 bg-ivory border-sage/40 shadow-soft">
          {errorMsg && (
            <div className="mb-6 p-3.5 rounded-2xl bg-coffee/15 border border-coffee/30 flex items-start gap-2.5 text-xs text-charcoal">
              <AlertCircle className="w-4 h-4 text-coffee shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/80">
                Staff Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-charcoal/40 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@arabista.in"
                  required
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-sage/40 bg-ivory text-charcoal text-sm placeholder:text-charcoal/40 focus:outline-none focus:border-forest"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/80">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-charcoal/40 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-sage/40 bg-ivory text-charcoal text-sm placeholder:text-charcoal/40 focus:outline-none focus:border-forest"
                />
              </div>
            </div>

            {/* Submit CTA */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              loading={loading}
            >
              Sign In to Station
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>

          {/* Seed Credentials Quick Fill Helper */}
          <div className="mt-8 pt-5 border-t border-sage/20 text-center">
            <span className="text-[11px] text-charcoal/60 block mb-1.5">
              Default Seeded Administrator:
            </span>
            <button
              type="button"
              onClick={() => {
                setEmail('admin@arabista.in');
                setPassword('Admin@Arabista2026!');
              }}
              className="text-xs font-semibold text-coffee hover:underline"
            >
              Auto-fill default admin credentials
            </button>
          </div>
        </Card>

        {/* Return to Public Website */}
        <div className="mt-8 text-center">
          <Link
            to="/"
            className="text-xs font-semibold text-forest hover:text-coffee transition-colors"
          >
            &larr; Return to Public Café Website
          </Link>
        </div>
      </Container>
    </div>
  );
}
