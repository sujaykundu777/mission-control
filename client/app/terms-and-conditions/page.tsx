import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { Paragraph } from '@/components/ui/paragraph';
import { Link, useRouter } from 'next/router';

export default function TermsAndConditionsPage() {
  const router = useRouter();

  return (
    <Box className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-3xl w-full space-y-6 bg-white rounded-xl p-8 shadow-lg">
        <Heading as="h1" size="xl" className="text-center text-gray-900">
          Terms and Conditions
        </Heading>
        <Paragraph className="text-center text-gray-600">
          These terms govern your use of the Contact Management App. By accessing or using the app, you agree to these terms.
        </Paragraph>

        <div className="space-y-4">
          <Box as="section" className="p-4 bg-gray-100 rounded-lg">
            <Heading as="h2" className="text-lg font-semibold text-gray-800">
              Use of Service
            </Heading>
            <Paragraph className="text-gray-700">
              You may use the app solely for personal and business contact management purposes. You agree not to misuse the service or violate any laws.
            </Paragraph>
          </Box>

          <Box as="section" className="p-4 bg-gray-100 rounded-lg">
            <Heading as="h2" className="text-lg font-semibold text-gray-800">
              User Content
            </HEAD>
            <Paragraph className="text-gray-700">
              You retain ownership of your contact data. By submitting content, you grant us a non-exclusive license to display and store it within the app.
            </Paragraph>
          </Box>

          <Box as="section" className="p-4 bg-gray-100 rounded-lg">
            <Heading as="h2" className="text-lg font-semibold text-gray-800">
              Termination
            </HEAD>
            <Paragraph className="text-gray-700">
              We may terminate or suspend access to the app at our discretion for violation of these terms or unlawful use.
            </Paragraph>
          </Box>

          <Box as="section" className="p-4 bg-gray-100 rounded-lg">
            <Heading as="h2" className="text-lg font-semibold text-gray-800">
              Governing Law
            </HEAD>
            <Paragraph className="text-gray-700">
              These terms are governed by the laws of the State of California, without regard to conflict of law principles.
            </Paragraph>
          </Box>

          <Box className="flex justify-center">
            <Link href="/dashboard" className="text-sm font-medium text-primary-600 hover:text-primary-500">
              Back to Dashboard
            </Link>
          </Box>
        </div>
      </div>
    </Box>
  )
}