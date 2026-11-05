import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import api from '../services/api';

const CartContext = createContext();

const CART_STORAGE_KEY = 'arabista_cart';
const TABLE_STORAGE_KEY = 'arabista_table';

export function CartProvider({ children }) {
  // Load saved items from localStorage
  const [items, setItems] = useState(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Table number storage (persists from QR scan ?table=X)
  const [tableNumber, setTableNumberState] = useState(() => {
    try {
      // Check current URL search params first
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const urlTable = params.get('table');
        if (urlTable) {
          localStorage.setItem(TABLE_STORAGE_KEY, urlTable.trim());
          return urlTable.trim();
        }
      }
      return localStorage.getItem(TABLE_STORAGE_KEY) || '';
    } catch {
      return '';
    }
  });

  // Cart Drawer open/close state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Sync cart items to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.error('Failed to sync cart to localStorage:', err);
    }
  }, [items]);

  // Sync tableNumber to localStorage
  const setTableNumber = (num) => {
    const cleanNum = num ? String(num).trim() : '';
    setTableNumberState(cleanNum);
    try {
      if (cleanNum) {
        localStorage.setItem(TABLE_STORAGE_KEY, cleanNum);
      } else {
        localStorage.removeItem(TABLE_STORAGE_KEY);
      }
    } catch (err) {
      console.error('Failed to sync table to localStorage:', err);
    }
  };

  // Add item to cart with optional initial quantity and kitchen note
  const addItem = (item, quantity = 1, notes = '') => {
    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((i) => i.id === item.id);
      if (existingIndex > -1) {
        const next = [...prevItems];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity,
          // Preserve existing notes if none provided in add call
          notes: notes || next[existingIndex].notes || '',
          isAvailable: item.isAvailable !== false,
        };
        return next;
      }
      return [
        ...prevItems,
        {
          id: item.id,
          name: item.name,
          price: Number(item.price),
          description: item.description || '',
          imageUrl: item.imageUrl || null,
          isAvailable: item.isAvailable !== false,
          isSignature: Boolean(item.isSignature),
          subCategory: item.subCategory || null,
          quantity: Math.max(1, quantity),
          notes: notes || '',
        },
      ];
    });
  };

  // Remove specific item from cart
  const removeItem = (itemId) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  // Update item quantity
  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => {
        if (i.id === itemId) {
          // If item is marked unavailable, prevent increasing quantity
          if (!i.isAvailable && quantity > i.quantity) {
            return i;
          }
          return { ...i, quantity };
        }
        return i;
      })
    );
  };

  // Update specific item's kitchen note / special request
  const updateItemNotes = (itemId, notes) => {
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, notes: notes || '' } : i))
    );
  };

  // Clear all items from cart
  const clearCart = () => {
    setItems([]);
  };

  // Remove all items that are unavailable
  const removeUnavailableItems = () => {
    setItems((prev) => prev.filter((i) => i.isAvailable !== false));
  };

  // Check if any items in the cart are currently unavailable
  const hasUnavailableItems = useMemo(() => {
    return items.some((i) => i.isAvailable === false);
  }, [items]);

  // Total quantity of all items
  const totalItems = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  // Calculated subtotal based on verified prices
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  // Drawer helper actions
  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);
  const toggleDrawer = () => setIsDrawerOpen((prev) => !prev);

  // Verify availability against API
  const refreshAvailability = async () => {
    if (items.length === 0) return;
    try {
      const res = await api.get('/menu-items');
      const allMenuItems = res.data || [];
      const itemMap = new Map(allMenuItems.map((m) => [m.id, m]));

      setItems((prev) =>
        prev.map((item) => {
          const fresh = itemMap.get(item.id);
          if (fresh) {
            return {
              ...item,
              price: fresh.price,
              isAvailable: fresh.isAvailable,
              name: fresh.name,
            };
          }
          return item;
        })
      );
    } catch {
      // Keep local state on error
    }
  };

  const value = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    updateItemNotes,
    clearCart,
    removeUnavailableItems,
    hasUnavailableItems,
    totalItems,
    subtotal,
    tableNumber,
    setTableNumber,
    isDrawerOpen,
    openDrawer,
    closeDrawer,
    toggleDrawer,
    refreshAvailability,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
