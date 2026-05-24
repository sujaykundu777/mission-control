// import { Box } from "@/components/ui/box";
// import { Heading } from "@/components/ui/heading";
// import { Paragraph } from "@/components/ui/paragraph";
// import { Link } from "next/link";
import Link from "next/link";

export default function BlogPage() {
  // Mock blog posts
  const posts = [
    {
      slug: "welcome-to-our-blog",
      title: "Welcome to Our Blog",
      excerpt: "We are excited to launch our blog about contact management and productivity tips.",
      date: "2024-10-01",
    },
    {
      slug: "productivity-tips",
      title: "Productivity Tips for Teams",
      excerpt: "Boost your team productivity with these helpful strategies.",
      date: "2024-09-25",
    },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-3xl space-y-6 rounded-xl bg-white p-8 shadow-lg">
        <h1 className="text-center text-xl text-gray-900">Blog</h1>
        <p className="text-center text-gray-600"> Latest news and updates </p>

        <div className="space-y-6">
          {posts.map((post) => (
            <div className="border-b border-gray-200 pb-4" key={post.slug}>
              <h2 className="text-lg font-semibold text-gray-800">{post.title}</h2>
              <p className="py-2 text-gray-700"> {post.excerpt} </p>
              <div className="text-sm text-gray-500">{post.date}</div>
              <div className="mt-2 flex">
                <Link
                  href={`/blog/${post.slug}`}
                  className="text-primary-600 hover:text-primary-500"
                >
                  Read more
                </Link>
              </div>
            </div>
          ))}
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
  );
}
