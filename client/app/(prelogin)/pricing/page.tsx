// import { Box } from "@/components/ui/box";
// import { Heading } from "@/components/ui/heading";
// import { Paragraph } from "@/components/ui/paragraph";
import { Button } from "@/components/ui/button";
// import { Link } from "next/link";
import Link from "next/link";

export default function PricingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-2xl space-y-6 rounded-xl bg-white p-8 shadow-lg">
        <h1 className="text-center text-xl text-gray-900">Pricing Plans</h1>
        <p className="text-center text-gray-600">
          Choose the plan that fits your needs. All plans include full access to Contact Management
          features.
        </p>

        <div className="space-y-6">
          {/* Basic Plan */}
          <div className="rounded-lg border border-gray-300 bg-gray-50 p-4">
            <div className="flex h-full flex-col items-start justify-between">
              <h2 className="text-lg font-semibold text-gray-800">Basic Plan</h2>
              <p className="text-primary-600 text-xl font-bold">$9.99/month</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-left text-gray-700">
                <li>Up to 50 contacts</li>
                <li>Email support</li>
                <li>Basic analytics</li>
              </ul>
              <div className="mt-4 flex items-center justify-center">
                <Link href="/login">
                  <Button className="bg-primary-600 hover:bg-primary-700 px-5 py-2 text-white">
                    Sign In to Start
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Pro Plan */}
          <div className="rounded-lg border border-gray-300 bg-gray-50 p-4">
            <div className="flex h-full flex-col items-start justify-between">
              <h2 className="text-lg font-semibold text-gray-800">Pro Plan</h2>
              <p className="text-primary-600 text-xl font-bold">$19.99/month</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-left text-gray-700">
                <li>Unlimited contacts</li>
                <li>Priority support</li>
                <li>Advanced analytics</li>
                <li>Integrations</li>
              </ul>
              <div className="mt-4 flex items-center justify-center">
                <Link href="/login">
                  <Button className="bg-primary-600 hover:bg-primary-700 px-5 py-2 text-white">
                    Sign In to Start
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Enterprise Plan */}
          <div className="rounded-lg border border-gray-300 bg-gray-50 p-4">
            <div className="flex h-full flex-col items-start justify-between">
              <h2 className="text-lg font-semibold text-gray-800">Enterprise Plan</h2>
              <p className="text-primary-600 text-xl font-bold">Custom Pricing</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-left text-gray-700">
                <li>All Pro features</li>
                <li>Dedicated account manager</li>
                <li>SLA support</li>
                <li>Custom workflows</li>
              </ul>
              <div className="mt-4 flex items-center justify-center">
                <Link href="/contact">
                  <Button className="bg-primary-600 hover:bg-primary-700 px-5 py-2 text-white">
                    Contact Sales
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <Link
            href="/about"
            className="text-primary-600 hover:text-primary-500 text-sm font-medium"
          >
            Learn More
          </Link>
        </div>
      </div>
    </div>
  );
}
