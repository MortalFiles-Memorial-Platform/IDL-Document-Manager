import { useState, type FormEvent } from 'react';
import { api } from '../lib/api';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import type { UserProfile } from '../types';

interface AuthPageProps {
  onLogin: (profile: UserProfile, token: string) => void;
}

export default function AuthPage({ onLogin }: AuthPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!email.trim()) {
      errors.email = 'Email is required.';
    } else if (email !== 'admin' && email !== 'interiorductltd@gmail.com' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Enter a valid email address.';
    }
    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 5) {
      errors.password = 'Password must be at least 5 characters.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setFieldErrors({});

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      onLogin(response.data.user, response.data.token);
    } catch (err) {
      setError('Login failed. Verify email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-xl items-center justify-center px-4 py-16">
      <div className="w-full rounded-3xl border border-slate-200 bg-white p-10 shadow-lg shadow-slate-200/70">
        <div className="mb-6 flex justify-center">
          <img src="/logo.png" alt="Interior Duct Ltd" className="h-16 w-16" />
        </div>
        <h1 className="text-3xl font-semibold text-slate-900">Interior Duct Ltd Login</h1>
        <p className="mt-2 text-sm text-slate-500">Access the IDL-RIS business document manager and stay compliant with Nigerian financial workflows.</p>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
            <Input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="interiorductltd@gmail.com"
              type="text"
              required
              className={fieldErrors.email ? 'border-rose-500' : ''}
            />
            {fieldErrors.email && <p className="mt-2 text-xs text-rose-600">{fieldErrors.email}</p>}
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
            <Input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              type="password"
              required
              className={fieldErrors.password ? 'border-rose-500' : ''}
            />
            {fieldErrors.password && <p className="mt-2 text-xs text-rose-600">{fieldErrors.password}</p>}
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</Button>
        </form>
      </div>
    </div>
  );
}
