'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Motorcycle, Settings, Shield, Sparkles, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { getProducts } from '@/lib/api';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    fetchProducts();
    setIsLoaded(true);
  }, []);

  const fetchProducts = async () => {
    try {
      // Will be implemented with actual API call
      // const data = await getProducts();
      // setProducts(data.slice(0, 4));
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const features = [
    {
      icon: Motorcycle,
      title: 'Large Sélection',
      description: 'Plus de 1000 produits des meilleures marques mondiales',
    },
    {
      icon: Shield,
      title: 'Garantie Premium',
      description: 'Tous nos produits sont garantis 2 ans, satisfaction assurée',
    },
    {
      icon: Settings,
      title: 'Support Expert',
      description: 'Équipe technique spécialisée à votre écoute 7j/7',
    },
  ];

  const categories = [
    { name: 'Motos', image: '/moto.jpg', desc: 'Sportives, naked, adventure' },
    { name: 'Scooters', image: '/scooter.jpg', desc: 'Urbains, GT, maxi-scooters' },
    { name: 'Pièces', image: '/pieces.jpg', desc: 'Échappements, freins, moteur' },
    { name: 'Accessoires', image: '/accessoires.jpg', desc: 'Casques, vêtements, équipements' },
  ];

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Hero Section with Video Background */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
            poster="/hero-poster.jpg"
          >
            <source src="/hero-video.mp4" type="video/mp4" />
          </video>
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-dark-900/80 via-dark-900/70 to-dark-900"></div>
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-premium-orange/20 via-transparent to-premium-orange/20 animate-pulse"></div>
        </div>

        {/* Hero Content */}
        <div className={`relative z-10 container mx-auto px-4 text-center transform transition-all duration-1000
                        ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="inline-block mb-6">
            <span className="badge-premium animate-float">
              <Sparkles className="h-3 w-3 mr-2" />
              Nouvelle Collection 2024
            </span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black mb-6 leading-tight">
            <span className="text-white">L'EXCELLENCE</span>
            <br />
            <span className="text-gradient text-shadow">MOTO & SCOOTER</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Découvrez l'univers du deux-roues haut de gamme.
            <br className="hidden md:block" />
            Performance, élégance et passion réunies.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/motos">
              <Button className="btn-premium text-lg px-12 py-4">
                Explorer la collection
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
            </Link>
            <Link href="/admin">
              <Button variant="outline" className="btn-outline text-lg px-12 py-4">
                Espace Admin
              </Button>
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-premium-orange rounded-full mt-2"></div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-dark-800 py-8 border-y border-dark-700">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '1000+', label: 'Produits' },
              { value: '50+', label: 'Marques' },
              { value: '10K+', label: 'Clients satisfaits' },
              { value: '99%', label: 'Satisfaction' },
            ].map((stat, i) => (
              <div key={i} className="space-y-2">
                <p className="text-4xl font-display font-black text-premium-orange">{stat.value}</p>
                <p className="text-gray-400 text-sm uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-gradient-to-b from-dark-900 to-dark-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-display font-bold mb-4">
              Pourquoi Nous Choisir
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              L&apos;excellence au service de votre passion
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="card-premium p-8 group hover:-translate-y-2">
                <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mb-6
                               transform group-hover:rotate-12 transition-transform duration-300 shadow-glow">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-display font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-dark-800">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-5xl font-display font-bold mb-4">
                Produits <span className="text-gradient">Phares</span>
              </h2>
              <p className="text-gray-400 text-lg">Notre sélection des meilleurs équipements</p>
            </div>
            <Link href="/motos" className="hidden md:block">
              <Button variant="outline" className="btn-outline">
                Voir tout
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Placeholder for products - will be replaced with API data */}
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="card-premium overflow-hidden group">
                <div className="h-64 bg-gradient-to-br from-dark-700 to-dark-600 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-900/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="badge-premium">Nouveau</span>
                    <h3 className="text-xl font-bold mt-2 text-white">Produit Premium {i}</h3>
                    <p className="text-gray-300 text-sm mt-1">Haute performance</p>
                    <p className="text-premium-orange text-2xl font-bold mt-2">1,299 €</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-90"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>

        <div className="relative container mx-auto px-4 text-center">
          <h2 className="text-5xl md:text-6xl font-display font-black mb-6 text-white">
            Prêt pour l&apos;Aventure ?
          </h2>
          <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto">
            Rejoignez des milliers de motards passionnés et accédez à des offres exclusives
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/register">
              <Button className="bg-white text-premium-orange hover:bg-gray-100 text-lg px-12 py-4 font-bold">
                Créer un compte
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
            </Link>
            <Link href="/admin">
              <Button variant="outline" className="border-white text-white hover:bg-white/10 text-lg px-12 py-4">
                Espace Administration
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
