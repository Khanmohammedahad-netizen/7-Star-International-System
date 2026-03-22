import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">MVP Skeleton Core</h1>
        <p className="text-neutral-400 mb-8">Enterprise SaaS Framework by MAK Software Solutions</p>
        <Link
          href="/auth/login"
          className="inline-flex items-center px-6 py-3 bg-white text-neutral-900 rounded-lg font-medium hover:bg-neutral-100 transition-colors"
        >
          Sign In →
        </Link>
      </div>
    </div>
  )
}
