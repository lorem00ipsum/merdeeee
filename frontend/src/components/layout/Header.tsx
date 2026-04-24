'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Menu, X, ShoppingCart, User, LogOut, Shield,
  Search, ChevronDown, Upload, ImagePlus, Trash2,
  Edit, Save, XCircle, Plus, Minus, ArrowRight
} from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
      setIsAdmin(JSON.parse(userData).role === 'admin');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAdmin(false);
    router.push('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-dark border-b border-dark-700/50">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center
                         transform group-hover:rotate-12 transition-transform duration-300 shadow-glow">
            <span className="text-white font-bold text-2xl">M</span>
          </div>
          <div className="hidden sm:block">
            <span className="font-display font-black text-2xl text-white block leading-none">
              MotoScoot
            </span>
            <span className="font-mono text-xs text-premium-orange tracking-widest uppercase">
              Premium
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-8">
          <Link href="/motos" className="text-gray-300 hover:text-premium-orange transition-colors font-medium">
            Motos
          </Link>
          <Link href="/scooters" className="text-gray-300 hover:text-premium-orange transition-colors font-medium">
            Scooters
          </Link>
          <Link href="/pieces" className="text-gray-300 hover:text-premium-orange transition-colors font-medium">
            Pièces
          </Link>
          <Link href="/accessoires" className="text-gray-300 hover:text-premium-orange transition-colors font-medium">
            Accessoires
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center space-x-4">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
          >
            <Search className="h-5 w-5 text-gray-400" />
          </button>

          <Link href="/panier" className="relative p-2 hover:bg-dark-700 rounded-lg transition-colors">
            <ShoppingCart className="h-5 w-5 text-gray-400" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-premium-orange text-xs rounded-full flex items-center justify-center">
              0
            </span>
          </Link>

          {user ? (
            <div className="flex items-center space-x-2">
              {isAdmin && (
                <Link href="/admin">
                  <button className="px-4 py-2 bg-premium-orange/20 text-premium-orange rounded-lg
                                    hover:bg-premium-orange/30 transition-colors text-sm font-semibold border border-premium-orange/30">
                    <Shield className="h-4 w-4 inline mr-2" />
                    Admin
                  </button>
                </Link>
              )}
              <Link href="/compte">
                <button className="px-4 py-2 glass rounded-lg hover:border-premium-orange/30 transition-colors text-sm">
                  {user.email}
                </button>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
              >
                <LogOut className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link href="/login">
                <button className="px-4 py-2 glass rounded-lg hover:border-premium-orange/30 transition-colors">
                  Connexion
                </button>
              </Link>
              <Link href="/register">
                <button className="px-6 py-2 gradient-primary rounded-lg font-semibold hover:shadow-glow transition-all">
                  Inscription
                </button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden p-2 hover:bg-dark-700 rounded-lg"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Search Bar */}
      {searchOpen && (
        <div className="absolute top-full left-0 right-0 p-4 bg-dark-900/95 backdrop-blur-xl border-b border-dark-700">
          <div className="container mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-500" />
              <input
                type="text"
                placeholder="Rechercher un produit..."
                className="w-full pl-12 pr-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-white
                         focus:outline-none focus:border-premium-orange focus:ring-2 focus:ring-premium-orange/20"
                autoFocus
              />
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-dark-900/95 backdrop-blur-xl border-b border-dark-700">
          <div className="container mx-auto px-4 py-6 space-y-4">
            <Link href="/motos" className="block text-gray-300 hover:text-premium-orange py-2">
              Motos
            </Link>
            <Link href="/scooters" className="block text-gray-300 hover:text-premium-orange py-2">
              Scooters
            </Link>
            <Link href="/pieces" className="block text-gray-300 hover:text-premium-orange py-2">
              Pièces
            </Link>
            <Link href="/accessoires" className="block text-gray-300 hover:text-premium-orange py-2">
              Accessoires
            </Link>
            <div className="pt-4 border-t border-dark-700 space-y-2">
              <Link href="/panier" className="flex items-center text-gray-300 py-2">
                <ShoppingCart className="h-5 w-5 mr-3" />
                Panier
              </Link>
              {user ? (
                <>
                  {isAdmin && (
                    <Link href="/admin" className="flex items-center text-premium-orange py-2">
                      <Shield className="h-5 w-5 mr-3" />
                      Administration
                    </Link>
                  )}
                  <Link href="/compte" className="flex items-center text-gray-300 py-2">
                    <User className="h-5 w-5 mr-3" />
                    Mon compte
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center text-gray-300 py-2 w-full"
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="block text-premium-orange py-2 font-semibold">
                    Connexion
                  </Link>
                  <Link href="/register" className="block text-premium-orange py-2 font-semibold">
                    Inscription
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
