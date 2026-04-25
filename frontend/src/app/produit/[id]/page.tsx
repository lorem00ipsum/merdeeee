'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ShoppingCart, Plus, Minus, ChevronRight, Check, Truck, Shield, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { productAPI } from '@/lib/api';

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const response = await productAPI.getById(productId);
      setProduct(response.data);
      // Fetch related products
      const allResponse = await productAPI.getAll();
      const related = allResponse.data
        .filter((p: any) => p.id !== productId && p.category === response.data.category)
        .slice(0, 4);
      setRelatedProducts(related);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find((item: any) => item.productId === productId);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({ productId, quantity });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`${quantity} article(s) ajouté(s) au panier !`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-premium-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement du produit...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Produit non trouvé</h2>
          <Link href="/">
            <Button variant="premium">Retour à l'accueil</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 py-12">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link href="/" className="text-premium-orange hover:underline flex items-center text-sm">
            <ChevronRight className="h-4 w-4 mr-1 rotate-180" />
            Retour au catalogue
          </Link>
        </div>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {/* Images */}
          <div className="space-y-4">
            <div className="bg-dark-800 rounded-2xl overflow-hidden aspect-square relative">
              {product.images?.length > 0 ? (
                <img
                  src={`http://localhost:3001${product.images[0]}`}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-dark-700 to-dark-600">
                  <ShoppingCart className="h-24 w-24 text-gray-600" />
                </div>
              )}
            </div>

            {product.images?.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.slice(1, 5).map((img: string, index: number) => (
                  <div key={index} className="aspect-square bg-dark-800 rounded-xl overflow-hidden cursor-pointer hover:border-2 hover:border-premium-orange transition-all">
                    <img
                      src={`http://localhost:3001${img}`}
                      alt={`${product.name} ${index + 2}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            {/* Category & Brand */}
            <div className="mb-4">
              <span className="px-3 py-1 bg-premium-orange/20 text-premium-orange text-xs font-semibold rounded-full uppercase tracking-wider">
                {product.category}
              </span>
              <p className="text-gray-500 text-sm mt-2">
                {product.brand} {product.model && `• ${product.model}`} {product.year && `• ${product.year}`}
              </p>
            </div>

            {/* Title */}
            <h1 className="text-4xl font-display font-bold text-white mb-6">
              {product.name}
            </h1>

            {/* Description */}
            <p className="text-gray-300 leading-relaxed mb-8 text-lg">
              {product.description || 'Produit premium de haute qualité.'}
            </p>

            {/* Price & Stock */}
            <div className="bg-dark-800/50 backdrop-blur border border-dark-700 rounded-2xl p-6 mb-8">
              <div className="flex items-baseline justify-between mb-4">
                <span className="text-4xl font-bold text-premium-orange">
                  {product.price.toFixed(2)} €
                </span>
                <span className={`text-lg font-medium ${product.stock > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {product.stock > 0 ? `${product.stock} en stock` : 'Rupture de stock'}
                </span>
              </div>

              {product.stock > 0 && (
                <div className="flex items-center space-x-6">
                  {/* Quantity */}
                  <div className="flex items-center border border-dark-600 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-12 h-12 bg-dark-700 hover:bg-dark-600 flex items-center justify-center transition-colors"
                    >
                      <Minus className="h-5 w-5" />
                    </button>
                    <span className="w-16 text-center text-lg font-bold">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="w-12 h-12 bg-dark-700 hover:bg-dark-600 flex items-center justify-center transition-colors"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Add to Cart */}
                  <Button
                    variant="premium"
                    size="lg"
                    onClick={addToCart}
                    className="flex-1"
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Ajouter au panier
                  </Button>
                </div>
              )}
            </div>

            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-dark-800 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Truck className="h-6 w-6 text-premium-orange" />
                </div>
                <div>
                  <h4 className="font-bold text-white">Livraison Gratuite</h4>
                  <p className="text-gray-400 text-sm">À partir de 500€ d'achat</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-dark-800 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="h-6 w-6 text-premium-orange" />
                </div>
                <div>
                  <h4 className="font-bold text-white">Garantie 2 Ans</h4>
                  <p className="text-gray-400 text-sm">Sur tous nos produits</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-dark-800 rounded-xl flex items-center justify-center flex-shrink-0">
                  <RotateCcw className="h-6 w-6 text-premium-orange" />
                </div>
                <div>
                  <h4 className="font-bold text-white">Retours 30 Jours</h4>
                  <p className="text-gray-400 text-sm">Satisfait ou remboursé</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-3xl font-display font-bold mb-8">Produits Similaires</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct: any) => (
                <Link key={relatedProduct.id} href={`/produit/${relatedProduct.id}`}>
                  <Card hover className="overflow-hidden h-full">
                    <div className="h-48 bg-gradient-to-br from-dark-700 to-dark-600 relative">
                      {relatedProduct.images?.length > 0 ? (
                        <img
                          src={`http://localhost:3001${relatedProduct.images[0]}`}
                          alt={relatedProduct.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingCart className="h-12 w-12 text-gray-600" />
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="font-bold text-white line-clamp-2 mb-2">
                        {relatedProduct.name}
                      </h3>
                      <p className="text-premium-orange font-bold text-xl">
                        {relatedProduct.price.toFixed(2)} €
                      </p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
