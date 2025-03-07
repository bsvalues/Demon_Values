import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signIn } from '../../lib/auth';
import { Loader, LogIn, AlertCircle } from 'lucide-react';

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type SignInForm = z.infer<typeof signInSchema>;

export default function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/dashboard';
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInForm) => {
    try {
      setError(null);
      await signIn(data.email, data.password);
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Sign in error:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Welcome back</h2>
          <p className="mt-2 text-gray-400">Sign in to your account</p>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center space-x-2 text-red-500">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
              Email address
            </label>
            <input
              id="email"
              type="email"
              {...register('email')}
              className="mt-1 block w-full rounded-lg bg-black/40 border border-demon-red/30 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-demon-red/50"
              placeholder="you@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              {...register('password')}
              className="mt-1 block w-full rounded-lg bg-black/40 border border-demon-red/30 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-demon-red/50"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center px-4 py-2 rounded-lg bg-demon-red hover:bg-demon-red-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <Loader className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <LogIn className="h-5 w-5 mr-2" />
                Sign in
              </>
            )}
          </button>

          <p className="text-center text-sm text-gray-400">
            Don't have an account?{' '}
            <Link to="/signup" className="text-demon-red hover:text-demon-red-light">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}