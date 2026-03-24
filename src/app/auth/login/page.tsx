'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/db/supabase-browser'
import { Button } from '@/components/primitives/Button'
import { Input } from '@/components/primitives/Input' // Assuming it exists or I'll use native
import { toast } from 'sonner'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      toast.success('Successfully logged in')
      // Use replace to prevent back-button loops
      window.location.href = '/dashboard'
    } catch (error: any) {
      toast.error(error.message || 'Failed to login')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-auto max-w-md space-y-8 bg-neutral-900/50 p-8 rounded-2xl border border-white/5 backdrop-blur-xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white tracking-tight">7STAR OS</h1>
          <p className="text-neutral-400 mt-2">Sign in to your operation center</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
              placeholder="operator@7star.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
              placeholder="••••••••"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-white text-black hover:bg-neutral-200"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </div>
    </div>
  )
}
