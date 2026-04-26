'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { productAPI } from '@/lib/api';

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  brand: string;
  images: string[];
}

export default function MotosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productAPI.getAll();
      const motos = response.data.filter((p: any) => p.category === 'moto');
      setProducts(motos);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (productId: string) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find((item: any) => item.productId === productId);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ productId, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Produit ajouté au panier !');
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
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-display font-bold mb-4">Motos</h1>
          <p className="text-gray-400 text-lg max-w-2xl">
            Découvrez notre sélection de motos haute performance, des sportives aux adventure
          </p>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product.id} hover className="overflow-hidden group">
                <div className="h-64 bg-gradient-to-br from-dark-700 to-dark-600 relative">
                  {product.images?.length > 0 ? (
                    <img
                      src={`http://localhost:3001${product.images[0]}`}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingCart className="h-16 w-16 text-gray-600" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-dark-900/80 backdrop-blur text-premium-orange text-xs font-semibold rounded-full">
                      {product.category}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-3xl font-bold text-white">{product.price.toFixed(2)} €</p>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{product.brand}</p>
                  <h3 className="text-lg font-bold text-white line-clamp-2 mb-4 h-14">
                    {product.name}
                  </h3>
                  <Button
                    className="w-full"
                    disabled={product.stock === 0}
                    onClick={() => addToCart(product.id)}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Ajouter au panier
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <ShoppingCart className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Aucune moto disponible</h3>
            <p className="text-gray-400 mb-6">Les motos arrivent bientôt...</p>
            <Link href="/">
              <Button variant="outline">Voir toutes les catégories</Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}
