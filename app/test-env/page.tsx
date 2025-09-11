"use client"

export default function TestEnvPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Environment Variables Test</h1>
      <div className="space-y-2">
        <p>
          <strong>NEXT_PUBLIC_SUPABASE_URL:</strong>
          {supabaseUrl ? "✅ Set" : "❌ Missing"}
        </p>
        <p>
          <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong>
          {supabaseKey ? "✅ Set" : "❌ Missing"}
        </p>
        {supabaseUrl && <p className="text-sm text-gray-600">URL: {supabaseUrl}</p>}
      </div>
    </div>
  )
}
