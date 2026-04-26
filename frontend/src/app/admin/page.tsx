'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';
import {
  Upload, ImagePlus, Trash2, Edit, Save, X, Plus, Minus,
  Shield, LogOut, Package, DollarSign, Box, Tag
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { productAPI, uploadAPI } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  brand: string;
  model: string;
  year: number;
  images: string[];
  created_at: string;
}

export default function AdminPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'moto',
    price: '',
    stock: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    images: [] as string[],
  });

  useEffect(() => {
    checkAuth();
    fetchProducts();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const user = JSON.parse(userData);
    if (user.role !== 'admin') {
      router.push('/');
      return;
    }

    setUser(user);
  };

  const fetchProducts = async () => {
    try {
      const response = await productAPI.getAll();
      // Map images array from response
      const productsWithImages = response.data.map((p: any) => ({
        ...p,
        images: p.images || [],
      }));
      setProducts(productsWithImages);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);
    try {
      const uploadedUrls: string[] = [];

      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch(`${API_URL}/upload/image`, {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        uploadedUrls.push(data.url);
      }

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls],
      }));
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Erreur lors de l\'upload des images');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const productData = {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      brand: formData.brand,
      model: formData.model,
      year: parseInt(formData.year.toString()),
      images: formData.images,
    };

    try {
      if (editingProduct) {
        await productAPI.update(editingProduct.id, productData);
      } else {
        await productAPI.create(productData);
      }

      await fetchProducts();
      resetForm();
      alert(editingProduct ? 'Produit modifié' : 'Produit créé');
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price.toString(),
      stock: product.stock.toString(),
      brand: product.brand,
      model: product.model,
      year: product.year,
      images: product.images || [],
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce produit ?')) return;

    try {
      await productAPI.delete(id);
      await fetchProducts();
      alert('Produit supprimé');
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'moto',
      price: '',
      stock: '',
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      images: [],
    });
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
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
    <div className="min-h-screen bg-dark-900">
      {/* Admin Header */}
      <div className="bg-dark-800 border-b border-dark-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl text-white">Administration</h1>
              <p className="text-xs text-gray-400">Gestion des produits</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 text-sm">
              <span className="text-gray-400">Connecté en tant que</span>
              <span className="text-premium-orange font-semibold">{user?.email}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { icon: Package, label: 'Total Produits', value: products.length, color: 'text-blue-400' },
            { icon: Box, label: 'En Stock', value: products.reduce((sum, p) => sum + p.stock, 0), color: 'text-green-400' },
            { icon: Tag, label: 'Catégories', value: new Set(products.map(p => p.category)).size, color: 'text-purple-400' },
            { icon: DollarSign, label: 'Valeur Totale', value: products.reduce((sum, p) => sum + (p.price * p.stock), 0).toFixed(0) + ' €', color: 'text-premium-orange' },
          ].map((stat, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{stat.label}</p>
                  <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                </div>
                <div className="w-12 h-12 bg-dark-700 rounded-lg flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-gray-400" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Add Product Button */}
        {!showForm && (
          <div className="mb-8 flex justify-end">
            <Button onClick={() => setShowForm(true)} variant="premium" size="lg">
              <Plus className="h-5 w-5 mr-2" />
              Nouveau Produit
            </Button>
          </div>
        )}

        {/* Product Form */}
        {showForm && (
          <Card className="mb-8 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-display font-bold">
                {editingProduct ? 'Modifier le Produit' : 'Nouveau Produit'}
              </h2>
              <Button variant="ghost" size="sm" onClick={resetForm}>
                <X className="h-5 w-5" />
              </Button>
            </div>

              <form onSubmit={handleSubmit} className="space-y-6 admin-product-form">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Info */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nom du produit *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input-premium"
                      style={{ color: 'black' }}
                      placeholder="Ex: Casque Integral Racing Pro"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Catégorie *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="input-premium"
                      style={{ color: 'black' }}
                    >
                      <option value="moto">Moto</option>
                      <option value="scooter">Scooter</option>
                      <option value="pieces">Pièces</option>
                       <option value="voiture">Voiture</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Prix (€) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="input-premium"
                      style={{ color: 'black' }}
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Stock *
                    </label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="input-premium"
                      style={{ color: 'black' }}
                      placeholder="0"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Marque
                    </label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      className="input-premium"
                      style={{ color: 'black' }}
                      placeholder="Ex: Yamaha, Honda, Shoei..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Modèle
                    </label>
                    <input
                      type="text"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      className="input-premium"
                      style={{ color: 'black' }}
                      placeholder="Ex: YZF-R1, X-SPR Pro..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Année
                    </label>
                    <input
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                      className="input-premium"
                      style={{ color: 'black' }}
                    />
                  </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="input-premium resize-none"
                  style={{ color: 'black' }}
                  placeholder="Description détaillée du produit..."
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Images du produit
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-dark-600 rounded-xl p-8 text-center
                           hover:border-premium-orange hover:bg-premium-orange/5 transition-all cursor-pointer"
                >
                  {uploading ? (
                    <div className="flex items-center justify-center space-x-3">
                      <div className="w-6 h-6 border-2 border-premium-orange border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-gray-400">Upload en cours...</span>
                    </div>
                  ) : (
                    <>
                      <ImagePlus className="h-12 w-12 text-gray-500 mx-auto mb-3" />
                      <p className="text-gray-400">
                        Cliquez pour ajouter des images ou glissez-déposez
                      </p>
                      <p className="text-xs text-gray-500 mt-2">PNG, JPG, WEBP (max 5MB each)</p>
                    </>
                  )}
                </div>

                {/* Image Preview */}
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    {formData.images.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={`${API_URL.replace('/api', '')}${img}`}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-dark-600"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full
                                   opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <Button type="submit" variant="premium" disabled={uploading}>
                  <Save className="h-5 w-5 mr-2" />
                  {editingProduct ? 'Mettre à jour' : 'Créer le Produit'}
                </Button>
                <Button type="button" variant="ghost" onClick={resetForm}>
                  Annuler
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Products Grid */}
        <div>
          <h2 className="text-2xl font-display font-bold mb-6 flex items-center">
            <Package className="h-6 w-6 mr-3 text-premium-orange" />
            Produits ({products.length})
          </h2>

          {products.length === 0 ? (
            <Card className="p-12 text-center">
              <Package className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Aucun produit</h3>
              <p className="text-gray-400 mb-6">Commencez par ajouter votre premier produit</p>
              <Button onClick={() => setShowForm(true)} variant="premium">
                <Plus className="h-5 w-5 mr-2" />
                Ajouter un produit
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card key={product.id} hover className="overflow-hidden">
                  {/* Product Image */}
                  <div className="h-48 bg-gradient-to-br from-dark-700 to-dark-600 relative">
                    {product.images?.length > 0 ? (
                      <img
                        src={`${API_URL.replace('/api', '')}${product.images[0]}`}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImagePlus className="h-12 w-12 text-gray-600" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <span className="px-3 py-1 bg-dark-900/80 backdrop-blur text-premium-orange text-xs font-semibold rounded-full capitalize">
                        {product.category}
                      </span>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-6">
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1">{product.brand || 'Marque'}</p>
                      <h3 className="text-lg font-bold text-white line-clamp-2 h-14">
                        {product.name}
                      </h3>
                    </div>

                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {product.description || 'Aucune description'}
                    </p>

                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <p className="text-2xl font-bold text-premium-orange">
                          {product.price.toFixed(2)} €
                        </p>
                        <p className={`text-sm ${product.stock > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {product.stock > 0 ? `Stock: ${product.stock}` : 'Rupture de stock'}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(product)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Modifier
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(product.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
