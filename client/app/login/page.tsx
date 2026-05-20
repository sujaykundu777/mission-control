import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form } from '@/components/ui/form';
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Add sign-in logic
    router.push('/dashboard');
  };

  return (
    <Box className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full space-y-6 bg-white rounded-xl p-8 shadow-lg">
        <Heading as="h1" size="xl" className="text-center text-gray-900">
          Sign In
        </Heading>
        <Paragraph className="text-center text-gray-600">
          Welcome back! Please sign in to continue.
        </Paragraph>

        <div className="space-y-4">
          <Box as="form" onSubmit={handleSubmit} className="w-full">
            <div className="flex flex-col">
              <Box className=" flex items-baseline">
                <Heading as="label" className="font-medium text-gray-700 sr-only">
                  Email address
                </Heading>
                <Box className="mt-1">
                  <Input
                    type="email"
                    name="email"
                    required
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
                    <Input
                      type="password"
                      name="password"
                      minLength={6}
                      required
                      className="border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 px-3 py-2 bg-white w-full"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </Box>
                </Box>

                <Box className="flex items-center justify-between mt-4">
                  <Button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white">
                    Sign In
                  </Button>
                </Box>

                <Box className="text-center">
                  <Button
                    as="a"
                    href="/register"
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