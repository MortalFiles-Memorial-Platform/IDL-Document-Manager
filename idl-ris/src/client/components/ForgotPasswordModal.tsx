import { useState, type FormEvent } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { X } from 'lucide-react';
import { api } from '../lib/api';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (email: string) => Promise<void>;
}

export default function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleEmailSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setValidationErrors({});
    setLoading(true);

    try {
      // Verify email exists in the system
      const response = await api.post('/auth/verify-email', { email });
      if (response.data.exists) {
        setStep('reset');
      } else {
        setError('Email not found in the system.');
      }
    } catch (err) {
      setError('Failed to verify email. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = () => {
    const errors: Record<string, string> = {};

    if (!newPassword.trim()) {
      errors.newPassword = 'Password is required.';
    } else if (newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters.';
    }

    if (!confirmPassword.trim()) {
      errors.confirmPassword = 'Please confirm your password.';
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordReset = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!validatePassword()) {
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/reset-password', {
        email,
        newPassword
      });

      setSuccess(true);
      setTimeout(() => {
        setEmail('');
        setNewPassword('');
        setConfirmPassword('');
        setStep('email');
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      setError('Failed to reset password. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-10 shadow-lg">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-semibold text-slate-900">Reset Password</h2>

        {success ? (
          <div className="mt-6 rounded-2xl bg-green-50 p-4 text-center space-y-2">
            <p className="text-sm font-medium text-green-700">✓ Password Reset Successfully!</p>
            <p className="text-xs text-green-600">You can now login with your new password.</p>
          </div>
        ) : step === 'email' ? (
          <>
            <p className="mt-2 text-sm text-slate-500">Enter your email address to reset your password.</p>
            <form onSubmit={handleEmailSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Email Address</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  disabled={loading}
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-slate-200 text-slate-700 hover:bg-slate-300"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Verifying...' : 'Continue'}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <>
            <p className="mt-2 text-sm text-slate-500">Enter your new password for {email}</p>
            <form onSubmit={handlePasswordReset} className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">New Password</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  disabled={loading}
                />
                {validationErrors.newPassword && (
                  <p className="mt-1 text-xs text-red-600">{validationErrors.newPassword}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Confirm Password</label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  disabled={loading}
                />
                {validationErrors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600">{validationErrors.confirmPassword}</p>
                )}
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={() => {
                    setStep('email');
                    setError('');
                    setValidationErrors({});
                  }}
                  className="flex-1 bg-slate-200 text-slate-700 hover:bg-slate-300"
                  disabled={loading}
                >
                  Back
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Resetting...' : 'Reset Password'}
                </Button>
              </div>
            </form>
          </>
        )}

        <div className="mt-6 rounded-2xl bg-blue-50 p-3">
          <p className="text-xs text-blue-700">
            <strong>ℹ️ No Email Required:</strong> Reset your password directly by entering your email and new password. Changes take effect immediately.
          </p>
        </div>
      </div>
    </div>
  );
}
