// import { Box } from "@/components/ui/box";
// import { Heading } from "@/components/ui/heading";
// import { Paragraph } from "@/components/ui/paragraph";
// import { Link } from "next/link";
// import { useRouter } from "next/router";
import Link from "next/link";

export default function AboutPage() {
  // const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-2xl space-y-6 rounded-xl bg-white p-8 shadow-lg">
        <h1 className="text-center text-xl text-gray-900">About ContactOS</h1>
        <p className="text-center text-gray-600">Learn more about the OS and our mission</p>

        <div className="space-y-4">
          <div className="rounded-lg bg-gray-100 p-4">
            <h1 className="text-lg font-semibold text-gray-800">Our Story</h1>
            <p className="text-gray-700">
              Founded in 2024, our team is dedicated to simplifying how you connect with your
              contacts.
            </p>
          </div>

          <div className="rounded-lg bg-gray-100 p-4">
            <h2 className="text-lg font-semibold text-gray-800">Our Values</h2>
            <p className="text-gray-700">
              Privacy, simplicity, and productivity are at the core of everything we do.
            </p>
          </div>

          <div className="flex justify-center">
            <Link
              href="/dashboard"
              className="text-primary-600 hover:text-primary-500 text-sm font-medium"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
