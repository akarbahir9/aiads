import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { Loader2, Bot } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const authSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type AuthFormData = z.infer<typeof authSchema>;

const AuthPage = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/app';

  const { register, handleSubmit, formState: { errors } } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
  });

  const onSubmit = async (formData: AuthFormData) => {
    setIsSubmitting(true);
    if (isLoginView) {
      // Handle Login
      const { error } = await supabase.auth.signInWithPassword(formData);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Login successful!');
        navigate(from, { replace: true });
      }
    } else {
      // Handle Sign Up
      const { error } = await supabase.auth.signUp(formData);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Confirmation email sent! Please check your inbox to verify your account.');
      }
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
        <Link to="/" className="flex items-center space-x-2 mb-8">
            <Bot className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-text-primary">AgencyBrain</span>
        </Link>
      <div className="w-full max-w-md bg-surface p-8 rounded-lg border border-border-color shadow-lg">
        <h2 className="text-2xl font-bold text-center text-text-primary mb-2">
          {isLoginView ? 'Welcome Back' : 'Create an Account'}
        </h2>
        <p className="text-center text-text-secondary mb-8">
            {isLoginView ? 'Sign in to continue to AgencyBrain.' : 'Get started with your AI creative studio.'}
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1">Email Address</label>
            <input {...register('email')} id="email" type="email" className="w-full bg-background border border-border-color rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-primary" />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-1">Password</label>
            <input {...register('password')} id="password" type="password" className="w-full bg-background border border-border-color rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-primary" />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>
          <div>
            <button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-colors duration-300 disabled:bg-secondary">
              {isSubmitting && <Loader2 className="h-5 w-5 mr-2 animate-spin" />}
              {isLoginView ? 'Sign In' : 'Sign Up'}
            </button>
          </div>
        </form>
        <p className="text-center text-sm text-text-secondary mt-6">
          {isLoginView ? "Don't have an account?" : 'Already have an account?'}
          <button onClick={() => setIsLoginView(!isLoginView)} className="font-medium text-primary hover:underline ml-1">
            {isLoginView ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
