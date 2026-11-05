import React, { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  Image,
  Layers,
  LogOut,
  ExternalLink,
  Menu as MenuIcon,
  X,
  User,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function AdminLayout() {
  const navigate = useNavigate();
  const toast = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const adminUser = (() => {
    try {
      const stored = localStorage.getItem('arabista_admin_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })();

  const handleLogout = () => {
    localStorage.removeItem('arabista_admin_token');
    localStorage.removeItem('arabista_admin_user');
    toast.info('Logged out of staff portal');
    navigate('/admin/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Live Orders', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Menu Catalog', path: '/admin/menu', icon: UtensilsCrossed },
    { name: 'Hero Banners', path: '/admin/banners', icon: Layers },
    { name: 'Café Gallery', path: '/admin/gallery', icon: Image },
  ];

  return (
    <div className="min-h-screen bg-ivory text-charcoal flex flex-col selection:bg-coffee selection:text-ivory">
      {/* Top Admin Navigation Header */}
      <header className="sticky top-0 z-40 bg-ivory/95 backdrop-blur-md border-b border-sage/25 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Brand Logo & Station Badge */}
          <div className="flex items-center gap-3">
            <Link to="/admin/dashboard" className="flex items-center gap-2.5 group">
              <span className="w-10 h-10 rounded-full bg-forest text-ivory flex items-center justify-center font-serif font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
                A
              </span>
              <div className="flex flex-col">
                <span className="font-serif text-xl font-bold tracking-tight text-forest leading-none">
                  ARABISTA
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-coffee mt-0.5">
                  Kitchen &amp; Operations
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3.5 py-2 rounded-pill text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                      isActive
                        ? 'bg-forest text-ivory shadow-soft'
                        : 'text-charcoal/75 hover:bg-sage/20 hover:text-forest'
                    }`
                  }
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.name}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Right Actions: Public Site Link, User Info, Logout */}
          <div className="flex items-center gap-3">
            <Link
              to="/"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill border border-sage/40 bg-ivory hover:bg-sage/20 text-xs font-medium text-forest transition-colors"
              title="Open public website in a new tab"
            >
              <span>View Café Site</span>
              <ExternalLink className="w-3 h-3 text-coffee" />
            </Link>

            {adminUser && (
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-sage/20 text-xs font-medium text-forest">
                <User className="w-3.5 h-3.5 text-coffee" />
                <span className="max-w-[130px] truncate">{adminUser.email}</span>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="p-2 rounded-full border border-sage/40 hover:bg-coffee hover:text-ivory text-forest transition-all"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-full text-forest hover:bg-sage/20 transition-colors"
              aria-label="Toggle admin navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-sage/20 bg-ivory px-4 py-4 space-y-2 shadow-lg animate-in slide-in-from-top-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      isActive
                        ? 'bg-forest text-ivory'
                        : 'text-charcoal/80 hover:bg-sage/20 hover:text-forest'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 text-coffee" />
                  <span>{link.name}</span>
                </NavLink>
              );
            })}

            <div className="pt-3 border-t border-sage/20 flex items-center justify-between px-2">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs font-semibold text-coffee hover:underline flex items-center gap-1"
              >
                <span>View Public Site</span>
                <ExternalLink className="w-3 h-3" />
              </Link>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="text-xs font-semibold text-forest hover:text-coffee"
              >
                Log Out
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Admin Content Pane */}
      <main className="flex-1 pb-16">
        <Outlet />
      </main>
    </div>
  );
}
