'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { productAPI } from '@/lib/api';

interface CartItem {
  productId: string;
  quantity: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  images: string[];
  brand: string;
  category: string;
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    setLoading(false);
  };

  useEffect(() => {
    if (cart.length > 0) {
      // For now, using mock products since API integration will be next step
      // This will be replaced with actual API call
    }
  }, [cart]);

  const updateQuantity = (productId: string, delta: number) => {
    const newCart = cart.map(item => {
      if (item.productId === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    });
    localStorage.setItem('cart', JSON.stringify(newCart));
    setCart(newCart);
  };

  const removeItem = (productId: string) => {
    const newCart = cart.filter(item => item.productId !== productId);
    localStorage.setItem('cart', JSON.stringify(newCart));
    setCart(newCart);
  };

  const clearCart = () => {
    localStorage.setItem('cart', JSON.stringify([]));
    setCart([]);
  };

  const total = cart.reduce((sum, item) => {
    const product = products[item.productId];
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-premium-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement du panier...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-display font-bold text-white">Panier</h1>
            <p className="text-gray-400 mt-1">{itemCount} article{itemCount > 1 ? 's' : ''}</p>
          </div>
          {cart.length > 0 && (
            <Button variant="ghost" onClick={clearCart}>
              <Trash2 className="h-4 w-4 mr-2" />
              Vider le panier
            </Button>
          )}
        </div>

        {cart.length === 0 ? (
          <Card className="p-12 text-center">
            <ShoppingCart className="h-24 w-24 text-gray-600 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-2">Votre panier est vide</h2>
            <p className="text-gray-400 mb-6">
              Découvrez nos produits et commencez vos achats
            </p>
            <Link href="/">
              <Button variant="premium" size="lg">
                Voir les produits
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map(({ productId, quantity }) => {
                // Mock product data - will be replaced with actual API data
                const product: Product = {
                  id: productId,
                  name: 'Produit Premium',
                  price: 999,
                  stock: 10,
                  images: [],
                  brand: 'Marque',
                  category: 'moto',
                };

                return (
                  <Card key={productId} className="p-6">
                    <div className="flex gap-6">
                      {/* Product Image */}
                      <div className="w-32 h-32 bg-dark-700 rounded-xl overflow-hidden flex-shrink-0">
                        {product.images?.[0] ? (
                          <img
                            src={`http://localhost:3001${product.images[0]}`}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingCart className="h-8 w-8 text-gray-600" />
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <div>
                            <p className="text-xs text-premium-orange uppercase tracking-wider mb-1">
                              {product.brand}
                            </p>
                            <h3 className="text-xl font-bold text-white mb-2">
                              {product.name}
                            </h3>
                            <span className="text-sm text-gray-500 bg-dark-700 px-2 py-1 rounded capitalize">
                              {product.category}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-premium-orange">
                              {(product.price * quantity).toFixed(2)} €
                            </p>
                            <p className="text-sm text-gray-400">
                              {product.price.toFixed(2)} € / unité
                            </p>
                          </div>
                        </div>

                        <div className="flex justify-between items-center mt-6">
                          {/* Quantity Controls */}
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => updateQuantity(productId, -1)}
                              className="w-10 h-10 rounded-lg bg-dark-700 hover:bg-dark-600 flex items-center justify-center transition-colors"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-12 text-center text-lg font-bold">{quantity}</span>
                            <button
                              onClick={() => updateQuantity(productId, 1)}
                              className="w-10 h-10 rounded-lg bg-dark-700 hover:bg-dark-600 flex items-center justify-center transition-colors"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeItem(productId)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24 p-6">
                <h2 className="text-xl font-bold mb-6">Récapitulatif</h2>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-gray-300">
                    <span>Sous-total</span>
                    <span>{total.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Livraison</span>
                    <span className="text-green-400">Gratuite</span>
                  </div>
                  <div className="border-t border-dark-700 pt-4 flex justify-between text-lg font-bold">
                    <span className="text-white">Total</span>
                    <span className="text-premium-orange">{total.toFixed(2)} €</span>
                  </div>
                </div>

                <Button variant="premium" size="lg" className="w-full mb-3">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Commander maintenant
                </Button>

                <Link href="/">
                  <Button variant="ghost" className="w-full">
                    Continuer mes achats
                  </Button>
                </Link>

                {/* Payment Methods */}
                <div className="mt-6 pt-6 border-t border-dark-700">
                  <p className="text-xs text-gray-500 mb-3">Paiements sécurisés</p>
                  <div className="flex space-x-2">
                    {['Visa', 'MC', 'PayPal'].map((method) => (
                      <div key={method} className="px-3 py-2 bg-dark-700 rounded text-xs text-gray-400">
                        {method}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
