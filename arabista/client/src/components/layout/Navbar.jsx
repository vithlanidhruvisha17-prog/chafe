import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ShoppingBag, Menu as MenuIcon, X, MapPin } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import Container from '../common/Container';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { totalItems, openDrawer } = useCart();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Visual Menu', path: '/menu' },
    { name: 'Signatures', path: '/menu?signature=true' },
    { name: 'Our Story', path: '/story' },
    { name: 'Track Order', path: '/track' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-ivory/95 backdrop-blur-md border-b border-sage/20 transition-all">
      <Container>
        <div className="h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <span className="w-10 h-10 rounded-full bg-forest text-ivory flex items-center justify-center font-serif font-bold text-lg shadow-sm transition-transform group-hover:scale-105">
              A
            </span>
            <div className="flex flex-col">
              <span className="font-serif text-2xl font-bold tracking-tight text-forest leading-none">
                ARABISTA
              </span>
              <span className="text-[10px] font-sans text-coffee tracking-widest uppercase font-semibold mt-1">
                Surat &bull; Gujarat
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors hover:text-coffee ${
                    isActive ? 'text-forest font-semibold border-b-2 border-forest pb-1' : 'text-charcoal/80'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          {/* Actions: Location + Cart + Mobile Toggle */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-pill border border-sage/30 bg-ivory text-xs font-medium text-charcoal/70">
              <MapPin className="w-3.5 h-3.5 text-coffee" />
              <span>Surat, Gujarat</span>
            </div>

            <button
              onClick={openDrawer}
              className="relative p-2.5 rounded-full bg-forest/10 hover:bg-forest/20 text-forest transition-colors"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-coffee text-ivory text-[11px] font-bold flex items-center justify-center shadow-sm animate-in zoom-in">
                  {totalItems}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-full text-forest hover:bg-sage/20 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </Container>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-sage/20 bg-ivory px-6 py-6 shadow-lg animate-in slide-in-from-top-4">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `text-base font-medium py-2 transition-colors ${
                    isActive ? 'text-forest font-semibold' : 'text-charcoal/80'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
