'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Calendar, LogOut, ShoppingBag, Settings, Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    setUser(JSON.parse(userData));
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-premium-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold mb-2">Mon Compte</h1>
          <p className="text-gray-400">Gérez vos informations personnelles</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="md:col-span-1">
            <Card className="p-6">
              <div className="text-center">
                <div className="w-24 h-24 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-glow">
                  <User className="h-12 w-12 text-white" />
                </div>
                <h2 className="text-xl font-bold mb-1">{user?.email}</h2>
                <div className="flex items-center justify-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    user?.role === 'admin' ? 'bg-premium-orange/20 text-premium-orange' : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {user?.role === 'admin' ? 'Administrateur' : 'Client'}
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center text-sm text-gray-400">
                  <Mail className="h-4 w-4 mr-3 text-gray-500" />
                  {user?.email}
                </div>
                <div className="flex items-center text-sm text-gray-400">
                  <Calendar className="h-4 w-4 mr-3 text-gray-500" />
                  Membre depuis {new Date(user?.created_at || Date.now()).toLocaleDateString('fr-FR')}
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {user?.role === 'admin' && (
                  <Link href="/admin">
                    <Button variant="outline" className="w-full">
                      <Shield className="h-4 w-4 mr-2" />
                      Administration
                    </Button>
                  </Link>
                )}
                <Button variant="ghost" className="w-full" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Déconnexion
                </Button>
              </div>
            </Card>
          </div>

          {/* Account Info */}
          <div className="md:col-span-2 space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-6 flex items-center">
                <Settings className="h-5 w-5 mr-3 text-premium-orange" />
                Informations du compte
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                  <p className="text-white text-lg">{user?.email}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Rôle</label>
                  <p className="text-white text-lg capitalize">
                    {user?.role === 'admin' ? 'Administrateur' : 'Client'}
                  </p>
                </div>
              </div>
            </Card>

            {/* Recent Orders Placeholder */}
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-6 flex items-center">
                <ShoppingBag className="h-5 w-5 mr-3 text-premium-orange" />
                Commandes récentes
              </h3>
              <div className="text-center py-12">
                <ShoppingBag className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Aucune commande pour le moment</p>
                <Link href="/">
                  <Button variant="premium" className="mt-6">
                    Découvrir nos produits
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
