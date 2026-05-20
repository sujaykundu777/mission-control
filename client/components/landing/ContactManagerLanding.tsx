import { useState } from 'react';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { Heading, Paragraph } from '@/components/ui/heading';
import { Divider } from '@/components/ui/divider';
import { Box } from '@/components/ui/box';

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
    <Box className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full space-y-6 bg-white rounded-xl p-8 shadow-lg">
        <Heading as="h1" size="xl" className="text-center text-gray-900">
          Contact Management App
        </Heading>
        <Paragraph className="text-center text-gray-600">
          Simplify how you connect with your contacts. Sign in to get started.
        </Paragraph>

        <div className="space-y-4">
          <Box as="form" onSubmit={handleSubmit} className="w-full">
            <div className="flex flex-col">
              <Box className=" flex items-baseline">
                <Heading as="label" className="font-medium text-gray-700 sr-only">
                  Email address
                </Heading>
                <Box className="mt-1">
                  <input
                    type="email"
                    name="email"
                    required
                    unique="true"
                    className="border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 px-3 py-2 bg-white w-full"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Box>
              </Box>

              <Box className="flex flex-col">
                <Box className=" flex items-baseline">
                  <Heading as="label" className="font-medium text-gray-700 sr-only">
                    Password
                  </Heading>
                  <Box className="mt-1">
                    <input
                      type="password"
                      name="password"
                      required
                      minLength={6}
                      unique="true"
                      className="border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 px-3 py-2 bg-white w-full"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </Box>
                </Box>

                <Divider />

                <Box className="flex items-center justify-between">
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
                </Box>
              </Box>
            </Box>
          </Box>
        </div>
      </div>
    </Box>
  )
}