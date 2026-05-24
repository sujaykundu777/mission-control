import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-3xl space-y-6 rounded-xl bg-white p-8 shadow-lg">
        <h1 className="text-center text-xl text-gray-900">Privacy Policy</h1>
        <p className="text-center text-gray-600">
          Your privacy is important to us. This page explains how we handle personal information.
        </p>

        <div className="space-y-4">
          <div className="rounded-lg bg-gray-100 p-4">
            <h2 className="text-lg font-semibold text-gray-800">Information We Collect</h2>
            <p className="text-gray-700">
              We collect contact information you provide, including name, email address, and phone
              number, solely to enable communication within the app.
            </p>
          </div>

          <div className="rounded-lg bg-gray-100 p-4">
            <h2 className="text-lg font-semibold text-gray-800">Data Usage</h2>
            <p className="text-gray-700">
              Your data is used exclusively to provide and improve our services. We do not sell or
              rent your personal information to third parties.
            </p>
          </div>

          <div className="rounded-lg bg-gray-100 p-4">
            <h2 className="text-lg font-semibold text-gray-800">Security</h2>
            <p className="text-gray-700">
              We implement resonable administrative, technical, and physical safeguards to protect
              your data.
            </p>
          </div>

          <div className="rounded-lg bg-gray-100 p-4">
            <h2 className="text-lg font-semibold text-gray-800">Your Rights</h2>
            <p className="text-gray-700">
              You may access, update, or request deletion of your personal data at any time through
              your account settings.
            </p>
          </div>

          <div className="flex justify-center">
            <Link
              href="/dashboard"
              className="text-primary-600 hover:text-primary-500 text-sm font-medium"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
