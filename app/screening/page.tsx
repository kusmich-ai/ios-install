'use client'

export default function ScreeningPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-8">
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-green-500/10 border border-green-500 rounded-lg p-8">
          <h1 className="text-4xl font-bold mb-4" style={{ color: '#ff9e19' }}>
            ✅ Screening Route Works!
          </h1>
          <p className="text-zinc-300 mb-4">
            If you're seeing this, the route is working and middleware is letting you through.
          </p>
          <p className="text-zinc-400 text-sm">
            This means the issue was in your original screening page code.
          </p>
        </div>

        <div className="mt-8 bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-left">
          <h2 className="text-xl font-bold mb-4">Debug Info:</h2>
          <div className="space-y-2 text-sm text-zinc-400">
            <p>• Route exists: ✓</p>
            <p>• Middleware allows access: ✓</p>
            <p>• Page renders: ✓</p>
          </div>
        </div>
      </div>
    </div>
  )
}
