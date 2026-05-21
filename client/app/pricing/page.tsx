import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import { Paragraph } from "@/components/ui/paragraph";
import { Button } from "@/components/ui/button";
import { Link } from "next/link";

export default function PricingPage() {
  return (
    <Box className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-2xl space-y-6 rounded-xl bg-white p-8 shadow-lg">
        <Heading as="h1" size="xl" className="text-center text-gray-900">
          Pricing Plans
        </Heading>
        <Paragraph className="text-center text-gray-600">
          Choose the plan that fits your needs. All plans include full access to Contact Management
          features.
        </Paragraph>

        <div className="space-y-6">
          {/* Basic Plan */}
          <Box className="rounded-lg border border-gray-300 bg-gray-50 p-4">
            <Box className="flex h-full flex-col items-start justify-between">
              <Heading as="h2" className="text-lg font-semibold text-gray-800">
                Basic Plan
              </Heading>
              <Paragraph className="text-primary-600 text-xl font-bold">$9.99/month</Paragraph>
              <List className="mt-2 list-disc space-y-1 pl-5 text-left text-gray-700">
                <li>Up to 50 contacts</li>
                <li>Email support</li>
                <li>Basic analytics</li>
              </List>
              <Box className="mt-4 flex items-center justify-center">
                <Button
                  href="/login"
                  className="bg-primary-600 hover:bg-primary-700 px-5 py-2 text-white"
                >
                  Sign In to Start
                </Button>
              </Box>
            </Box>
          </Box>

          {/* Pro Plan */}
          <Box className="rounded-lg border border-gray-300 bg-gray-50 p-4">
            <Box className="flex h-full flex-col items-start justify-between">
              <Heading as="h2" className="text-lg font-semibold text-gray-800">
                Pro Plan
              </Heading>
              <Paragraph className="text-primary-600 text-xl font-bold">$19.99/month</Paragraph>
              <List className="mt-2 list-disc space-y-1 pl-5 text-left text-gray-700">
                <li>Unlimited contacts</li>
                <li> priority support </li>
                <li> Advanced analytics </li>
                <li> Integrations </li>
              </List>
              <Box className="mt-4 flex items-center justify-center">
                <Button
                  href="/login"
                  className="bg-primary-600 hover:bg-primary-700 px-5 py-2 text-white"
                >
                  Sign In to Start
                </Button>
              </Box>
            </Box>
          </Box>

          {/* Enterprise Plan */}
          <Box className="rounded-lg border border-gray-300 bg-gray-50 p-4">
            <Box className="flex h-full flex-col items-start justify-between">
              <Heading as="h2" className="text-lg font-semibold text-gray-800">
                Enterprise Plan
              </Heading>
              <Paragraph className="text-primary-600 text-xl font-bold">Custom Pricing</Paragraph>
              <List className="mt-2 list-disc space-y-1 pl-5 text-left text-gray-700">
                <li>All Pro features</li>
                <li>Dedicated account manager</li>
                <li> SLA support </li>
                <li> Custom workflows </li>
              </List>
              <Box className="mt-4 flex items-center justify-center">
                <Button
                  href="/contact"
                  className="bg-primary-600 hover:bg-primary-700 px-5 py-2 text-white"
                >
                  Contact Sales
                </Button>
              </Box>
            </Box>
          </Box>
        </div>

        <Box className="flex justify-center">
          <Link
            href="/about"
            className="text-primary-600 hover:text-primary-500 text-sm font-medium"
          >
            Learn More
          </Link>
        </Box>
      </div>
    </Box>
  );
}

// Simple list component for repeated use
import { ul as List } from "@/components/ui/list";
