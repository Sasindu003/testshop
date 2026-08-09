import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';
import { getCategories } from '../../api/categories';
import { Instagram, Twitter, Facebook } from 'lucide-react';

const FOOTER_LINKS = [
  {
    heading: 'Shop',
    items: [
      { label: 'All Products', to: '/products' },
      { label: 'AI Stylist',   to: '/ai-stylist' },
    ],
  },
  {
    heading: 'Account',
    items: [
      { label: 'My Orders',  to: '/orders' },
      { label: 'Wishlist',   to: '/wishlist' },
      { label: 'Profile',    to: '/profile' },
    ],
  },
];

const SOCIAL_LINKS = [
  { href: 'https://instagram.com', label: 'Instagram', icon: Instagram },
  { href: 'https://twitter.com',   label: 'Twitter',   icon: Twitter },
  { href: 'https://facebook.com',  label: 'Facebook',  icon: Facebook },
];

export default function PublicLayout() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getCategories()
      .then(({ data }) => setCategories(data.categories || []))
      .catch(() => {}); // non-fatal — nav degrades gracefully
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar categories={categories} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer links={FOOTER_LINKS} socialLinks={SOCIAL_LINKS} />
    </div>
  );
}
