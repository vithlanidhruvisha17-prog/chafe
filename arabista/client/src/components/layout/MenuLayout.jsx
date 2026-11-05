import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Coffee,
  UtensilsCrossed,
  Salad,
  Cake,
  Home,
  ShoppingBag,
  Compass,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';

export default function MenuLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { totalItems, openDrawer } = useCart();

  const currentPath = location.pathname;

  const categories = [
    { id: 'all', name: 'All Menu', icon: Compass, link: '/menu', match: ['/menu'] },
    { id: 'the-pour', name: 'The Pour', icon: Coffee, link: '/menu/category/the-pour', match: ['the-pour'] },
    { id: 'food', name: 'Food', icon: UtensilsCrossed, link: '/menu/category/food', match: ['/food', 'food'] },
    { id: 'pastas', name: 'Pasta Lab', icon: UtensilsCrossed, link: '/menu/category/pastas', match: ['pastas'] },
    { id: 'dessert', name: 'Desserts', icon: Cake, link: '/menu/category/dessert', match: ['dessert'] },
    { id: 'salad', name: 'Salads', icon: Salad, link: '/menu/category/salad', match: ['salad'] },
  ];

  return (
    <div className="min-h-screen bg-ivory text-charcoal flex flex-col md:flex-row selection:bg-coffee selection:text-ivory">
      {/* Left Icon Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col items-center justify-between w-20 py-6 border-r border-sage/25 bg-ivory/95 sticky top-0 h-screen z-30 shrink-0">
        {/* Brand Stamp */}
        <Link
          to="/"
          className="w-12 h-12 rounded-full bg-forest text-ivory flex items-center justify-center font-serif font-bold text-xl shadow-soft hover:scale-105 transition-transform"
          title="Return to Arabista Home"
        >
          A
        </Link>

        {/* Category Icons */}
        <nav className="flex flex-col items-center gap-3.5 my-auto">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive =
              cat.id === 'all'
                ? currentPath === '/menu'
                : cat.match.some((m) => currentPath.includes(m));

            return (
              <Link
                key={cat.id}
                to={cat.link}
                title={cat.name}
                className={`p-3 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 relative group ${
                  isActive
                    ? 'bg-forest text-ivory shadow-soft'
                    : 'text-charcoal/70 hover:bg-sage/20 hover:text-forest'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[9px] font-medium mt-1 tracking-tight">
                  {cat.name.split(' ')[0]}
                </span>
                {/* Tooltip */}
                <span className="absolute left-full ml-3 px-3 py-1.5 rounded-pill bg-charcoal text-ivory text-xs font-medium opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-md">
                  {cat.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={openDrawer}
            title="View Cart Drawer"
            className="relative p-3 rounded-full bg-coffee/15 text-coffee hover:bg-coffee hover:text-ivory transition-colors"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-forest text-ivory text-[10px] font-bold flex items-center justify-center shadow-sm">
                {totalItems}
              </span>
            )}
          </button>

          <Link
            to="/"
            title="Return to Website Home"
            className="p-2.5 rounded-full text-charcoal/60 hover:text-forest hover:bg-sage/20 transition-colors"
          >
            <Home className="w-5 h-5" />
          </Link>
        </div>
      </aside>

      {/* Main Visual Menu Pane */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar with Back Button + Logo */}
        <header className="sticky top-0 z-20 bg-ivory/95 backdrop-blur-md border-b border-sage/20 px-4 md:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (window.history.length > 2) {
                  navigate(-1);
                } else {
                  navigate('/menu');
                }
              }}
              className="p-2.5 rounded-full border border-sage/30 hover:bg-sage/20 text-forest transition-colors flex items-center justify-center"
              aria-label="Go back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <Link to="/" className="flex items-center gap-2.5">
              <span className="font-serif text-2xl font-bold tracking-tight text-forest">
                ARABISTA
              </span>
              <span className="hidden sm:inline-block text-[11px] font-medium text-coffee tracking-widest uppercase border-l border-sage/40 pl-2.5">
                Surat &bull; Gujarat
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={openDrawer}
              className="flex items-center gap-2 px-4 py-2 rounded-pill bg-forest text-ivory text-xs font-medium shadow-soft hover:bg-forest/90 transition-all active:scale-95"
            >
              <ShoppingBag className="w-4 h-4 text-coffee" />
              <span>Cart ({totalItems})</span>
            </button>
          </div>
        </header>

        {/* Content View */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-ivory/95 backdrop-blur-md border-t border-sage/30 px-2 py-2 flex items-center justify-around shadow-lg">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive =
            cat.id === 'all'
              ? currentPath === '/menu'
              : cat.match.some((m) => currentPath.includes(m));

          return (
            <Link
              key={cat.id}
              to={cat.link}
              className={`p-1.5 rounded-xl flex flex-col items-center justify-center transition-colors ${
                isActive ? 'text-forest font-bold' : 'text-charcoal/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[9px] mt-0.5">{cat.name.split(' ')[0]}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
