'use client';

import Link from 'next/link';
import { Motorcycle, Settings, Shield, Sparkles, ArrowRight, Star } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-dark-800 border-t border-dark-700">
      <div className="container mx-auto px-4 py-16">
        {/* Main Footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-glow">
                <span className="text-white font-bold text-2xl">M</span>
              </div>
              <div>
                <span className="font-display font-black text-2xl text-white block">MotoScoot</span>
                <span className="font-mono text-xs text-premium-orange tracking-widest uppercase">Premium</span>
              </div>
            </div>
            <p className="text-gray-400 leading-relaxed">
              L&apos;excellence moto et scooter au service des passionnés. Qualité premium, service exceptionnel.
            </p>
            <div className="flex space-x-4">
              {['twitter', 'instagram', 'facebook', 'youtube'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-10 h-10 rounded-lg bg-dark-700 hover:bg-premium-orange transition-all duration-300 flex items-center justify-center group"
                >
                  <span className="text-gray-400 group-hover:text-white text-sm font-bold capitalize">
                    {social[0]}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="font-display font-bold text-lg mb-6 text-white">Produits</h3>
            <ul className="space-y-3">
              {['Motos', 'Scooters', 'Pièces détachées', 'Accessoires', 'Nouveautés', 'Promotions'].map((item) => (
                <li key={item}>
                  <Link href="/" className="text-gray-400 hover:text-premium-orange transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-display font-bold text-lg mb-6 text-white">Services</h3>
            <ul className="space-y-3">
              {['Livraison express', 'Garantie 2 ans', 'Retours 30 jours', 'Support 24/7',
                'Installation professionnelle', 'Conseils experts'].map((item) => (
                <li key={item} className="text-gray-400">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display font-bold text-lg mb-6 text-white">Contact</h3>
            <div className="space-y-4">
              <div>
                <p className="text-premium-orange text-sm font-semibold mb-1">ADRESSE</p>
                <p className="text-gray-400">123 Avenue des Champs-Élysées<br />75008 Paris, France</p>
              </div>
              <div>
                <p className="text-premium-orange text-sm font-semibold mb-1">TÉLÉPHONE</p>
                <p className="text-gray-400">+33 1 23 45 67 89</p>
              </div>
              <div>
                <p className="text-premium-orange text-sm font-semibold mb-1">EMAIL</p>
                <p className="text-gray-400">contact@motopremium.fr</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-dark-700 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            © 2024 MotoScoot Premium. Tous droits réservés.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/mentions" className="text-gray-500 hover:text-premium-orange text-sm">Mentions légales</Link>
            <Link href="/confidentialite" className="text-gray-500 hover:text-premium-orange text-sm">Confidentialité</Link>
            <Link href="/cgv" className="text-gray-500 hover:text-premium-orange text-sm">CGV</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
