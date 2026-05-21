import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import { Paragraph } from "@/components/ui/paragraph";
import { Link } from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <Box className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-3xl space-y-6 rounded-xl bg-white p-8 shadow-lg">
        <Heading as="h1" size="xl" className="text-center text-gray-900">
          Privacy Policy
        </Heading>
        <Paragraph className="text-center text-gray-600">
          Your privacy is important to us. This page explains how we handle personal information.
        </Paragraph>

        <div className="space-y-4">
          <Box as="section" className="rounded-lg bg-gray-100 p-4">
            <Heading as="h2" className="text-lg font-semibold text-gray-800">
              Information We Collect
            </Heading>
            <Paragraph className="text-gray-700">
              We collect contact information you provide, including name, email address, and phone
              number, solely to enable communication within the app.
            </Paragraph>
          </Box>

          <Box as="section" className="rounded-lg bg-gray-100 p-4">
            <Heading as="h2" className="text-lg font-semibold text-gray-800">
              Data Usage
            </Heading>
            <Paragraph className="text-gray-700">
              Your data is used exclusively to provide and improve our services. We do not sell or
              rent your personal information to third parties.
            </Paragraph>
          </Box>

          <Box as="section" className="rounded-lg bg-gray-100 p-4">
            <Heading as="h2" className="text-lg font-semibold text-gray-800">
              Security
            </Heading>
            <Paragraph className="text-gray-700">
              We implement reasonable administrative, technical, and physical safeguards to protect
              your data.
            </Paragraph>
          </Box>

          <Box as="section" className="rounded-lg bg-gray-100 p-4">
            <Heading as="h2" className="text-lg font-semibold text-gray-800">
              Your Rights
            </Heading>
            <Paragraph className="text-gray-700">
              You may access, update, or request deletion of your personal data at any time through
              your account settings.
            </Paragraph>
          </Box>

          <Box className="flex justify-center">
            <Link
              href="/dashboard"
              className="text-primary-600 hover:text-primary-500 text-sm font-medium"
            >
              Back to Dashboard
            </Link>
          </Box>
        </div>
      </div>
    </Box>
  );
}
