'use client'
import React, {useState} from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
// import { Card, Separator, Label } from '@/components/ui';
import { Card, CardHeader } from '../ui/card';
import { Label } from '../ui/label';

export default function ContactManagerLanding() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Add actual sign-in logic
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 px-4">
      <Card className="bg-white/90 shadow-lg rounded-xl p-6 w-full max-w-md">
        <CardHeader>
          Contact Management App
          <p className="text-center text-gray-600 py-3">
            Simplify how you connect with your contacts. Sign in to get started.
          </p>
        </CardHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="flex flex-col">
            <Label className="font-medium text-gray-700 sr-only">
              Email address
            </Label>
            <div className="mt-1">
              <input
                type="email"
                name="email"
                required
                className="border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 px-3 py-2 bg-white w-full"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col">
            <Label className="font-medium text-gray-700 sr-only">
              Password
            </Label>
            <div className="mt-1">
              <input
                type="password"
                name="password"
                required
                minLength={6}
                className="border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 px-3 py-2 bg-white w-full"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Button
              type="submit"
              className="w-full bg-primary-600 hover:bg-primary-700 text-white"
            >
              Sign In
            </Button>
            <Button
              type="button"
              onClick={() => router.push('/register')}
              className="text-sm font-medium text-primary-600 hover:text-primary-500"
            >
              Create Account
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}