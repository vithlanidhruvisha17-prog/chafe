import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import CartDrawer from './components/cart/CartDrawer';

// Layouts
import MainLayout from './components/layout/MainLayout';
import MenuLayout from './components/layout/MenuLayout';
import AdminLayout from './components/layout/AdminLayout';
import AdminProtectedRoute from './components/admin/AdminProtectedRoute';

// Public Website Pages
import HomePage from './pages/HomePage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import StoryPage from './pages/StoryPage';
import NotFoundPage from './pages/NotFoundPage';

// Visual Menu Flow Pages
import MenuPage from './pages/MenuPage';
import CategorySubCategoriesPage from './pages/CategorySubCategoriesPage';
import SubCategoryItemsPage from './pages/SubCategoryItemsPage';
import MenuItemDetailPage from './pages/MenuItemDetailPage';

// Admin Pages
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminMenuPage from './pages/admin/AdminMenuPage';
import AdminBannersPage from './pages/admin/AdminBannersPage';
import AdminGalleryPage from './pages/admin/AdminGalleryPage';

export default function App() {
  return (
    <ToastProvider>
      <CartProvider>
        <CartDrawer />
        <Routes>
          {/* Main Website Flow */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/track" element={<OrderTrackingPage />} />
            <Route path="/track/:orderNumber" element={<OrderTrackingPage />} />
            <Route path="/story" element={<StoryPage />} />
          </Route>

          {/* Visual Menu Flow (Icon Sidebar + Top Bar with Back Button) */}
          <Route element={<MenuLayout />}>
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/menu/category/:slug" element={<CategorySubCategoriesPage />} />
            <Route path="/menu/sub/:slug" element={<SubCategoryItemsPage />} />
            <Route path="/menu/item/:id" element={<MenuItemDetailPage />} />
            <Route path="/menu/:id" element={<MenuItemDetailPage />} />
          </Route>

          {/* Admin Auth Route (Public) */}
          <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Protected Staff & Operations Portal */}
          <Route element={<AdminProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="/admin/orders" element={<AdminOrdersPage />} />
              <Route path="/admin/menu" element={<AdminMenuPage />} />
              <Route path="/admin/banners" element={<AdminBannersPage />} />
              <Route path="/admin/gallery" element={<AdminGalleryPage />} />
            </Route>
          </Route>

          {/* 404 Fallback */}
          <Route element={<MainLayout />}>
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </CartProvider>
    </ToastProvider>
  );
}
