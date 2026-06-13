import Link from "next/link";

export default function TermsAndConditionsPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-3xl space-y-6 rounded-xl bg-white p-8 shadow-lg">
        <h1 className="text-center text-xl text-gray-900">Terms and Conditions</h1>
        <p className="text-center text-gray-600">
          These terms govern your use of the Contact Management App. By accessing or using the app,
          you agree to these terms.
        </p>

        <div className="space-y-4">
          <div className="rounded-lg bg-gray-100 p-4">
            <h2 className="text-lg font-semibold text-gray-800">Use of Service</h2>
            <p className="text-gray-700">
              You may use the app solely for personal and business contact management purposes. You
              agree not to misusse the service or violate any laws.
            </p>
          </div>

          <div className="rounded-lg bg-gray-100 p-4">
            <h2 className="text-lg font-semibold text-gray-800">User Content</h2>
            <p className="text-gray-700">
              You retain ownership of your contact data. By submitting content, you grant us a
              non-exclusive license to displayt and store it within the app.
            </p>
          </div>

          <div className="rounded-lg bg-gray-100 p-4">
            <h2 className="text-lg font-semibold text-gray-800">Termination</h2>
            <p className="text-gray-700">
              We may terminate or suspend access to the app at our discretion for violation of these
              terms or unlawful use.
            </p>
          </div>

          <div className="rounded-lg bg-gray-100 p-4">
            <h2 className="text-lg font-semibold text-gray-800">Governing Law</h2>
            <p className="text-gray-700">
              These terms are governed by the laws of the State of California, without regard to
              conflict of law principles.
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
