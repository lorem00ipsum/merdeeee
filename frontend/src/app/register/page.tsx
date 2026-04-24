'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Check, Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { authAPI } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const passwordRequirements = [
    { label: '8 caractères minimum', met: formData.password.length >= 8 },
    { label: 'Une lettre majuscule', met: /[A-Z]/.test(formData.password) },
    { label: 'Une lettre minuscule', met: /[a-z]/.test(formData.password) },
    { label: 'Un chiffre', met: /[0-9]/.test(formData.password) },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (!passwordRequirements.every(req => req.met)) {
      setError('Le mot de passe ne respecte pas toutes les exigences');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.register(formData.email, formData.password);
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      router.push('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,85,0,0.3) 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="bg-dark-800/90 backdrop-blur-xl border border-dark-700 rounded-2xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow">
              <span className="text-white font-bold text-3xl">M</span>
            </div>
            <h1 className="text-3xl font-display font-bold text-white mb-2">Créer un compte</h1>
            <p className="text-gray-400">Rejoignez MotoScoot Premium</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-500" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-premium pl-12"
                  placeholder="votre@email.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-premium pl-12 pr-12"
                  placeholder="Mot de passe sécurisé"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {/* Password Requirements */}
              {formData.password && (
                <div className="mt-3 space-y-2">
                  {passwordRequirements.map((req, i) => (
                    <div key={i} className="flex items-center text-sm">
                      <Check
                        className={`h-4 w-4 mr-2 ${req.met ? 'text-green-400' : 'text-gray-600'}`}
                      />
                      <span className={req.met ? 'text-green-300' : 'text-gray-500'}>
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input-premium pl-12"
                  placeholder="Confirmez votre mot de passe"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="premium"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Création...' : (
                <>
                  Créer mon compte
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-dark-700 text-center">
            <p className="text-gray-400 text-sm">
              Déjà un compte ?{' '}
              <Link href="/login" className="text-premium-orange hover:underline font-medium">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
