import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import { Paragraph } from "@/components/ui/paragraph";
import { Link } from "next/link";
import { useRouter } from "next/router";

export default function AboutPage() {
  const router = useRouter();

  return (
    <Box className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-2xl space-y-6 rounded-xl bg-white p-8 shadow-lg">
        <Heading as="h1" size="xl" className="text-center text-gray-900">
          About Us
        </Heading>
        <Paragraph className="text-center text-gray-600">
          Learn more about the Contact Management App and our mission.
        </Paragraph>

        <div className="space-y-4">
          <Box as="section" className="rounded-lg bg-gray-100 p-4">
            <Heading as="h2" className="text-lg font-semibold text-gray-800">
              Our Story
            </Heading>
            <Paragraph className="text-gray-700">
              Founded in 2024, our team is dedicated to simplifying how you connect with your
              contacts.
            </Paragraph>
          </Box>

          <Box as="section" className="rounded-lg bg-gray-100 p-4">
            <Heading as="h2" className="text-lg font-semibold text-gray-800">
              Our Values
            </Heading>
            <Paragraph className="text-gray-700">
              Privacy, simplicity, and productivity are at the core of everything we do.
            </Paragraph>
          </Box>

          <Box className="flex justify-center">
            <Link
              href="/dashboard"
              className="text-primary-600 hover:text-primary-500 text-sm font-medium"
            >
              Go to Dashboard
            </Link>
          </Box>
        </div>
      </div>
    </Box>
  );
}
