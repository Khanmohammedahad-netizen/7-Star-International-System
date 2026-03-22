'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { motion } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { appConfig } from '@/config/app.config'
import { cardStagger, buttonPress } from '@/motion/variants'
import Link from 'next/link'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const supabase = createBrowserClient(
        appConfig.supabase.url,
        appConfig.supabase.anonKey
    )

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (authError) {
            setError(authError.message)
            setLoading(false)
            return
        }

        router.push(appConfig.auth.dashboardPath)
    }

    return (
        <motion.div
            variants={cardStagger.container}
            initial="initial"
            animate="animate"
            className="w-full flex-col space-y-6"
        >
            <motion.div variants={cardStagger.item} className="text-center mb-8">
                <h2 className="text-3xl font-bold text-neutral-900">Welcome Back</h2>
                <p className="text-sm text-neutral-500 mt-2">Sign in to your account</p>
            </motion.div>

            <form onSubmit={handleLogin} className="space-y-5">
                <motion.div variants={cardStagger.item}>
                    <Input
                        id="email"
                        label="Email Address"
                        type="email"
                        placeholder="you@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </motion.div>
                
                <motion.div variants={cardStagger.item}>
                    <div className="flex justify-between items-center mb-1">
                        <label className="text-sm font-medium text-neutral-700" htmlFor="password">
                            Password
                        </label>
                        <Link href="/auth/forgot" className="text-xs text-amber-600 hover:text-amber-700 font-medium">
                            Forgot password?
                        </Link>
                    </div>
                    <Input
                        id="password"
                        label=""
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </motion.div>

                {error && (
                    <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3"
                    >
                        {error}
                    </motion.div>
                )}

                <motion.div variants={cardStagger.item} className="pt-2">
                    <motion.div variants={buttonPress} whileTap="whileTap">
                        <Button type="submit" disabled={loading} className="w-full bg-neutral-900 text-white hover:bg-neutral-800">
                            {loading ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </motion.div>
                </motion.div>
            </form>

            <motion.p variants={cardStagger.item} className="text-center text-sm text-neutral-500 mt-6">
                Don't have an account?{' '}
                <Link href="/auth/register" className="text-amber-600 hover:text-amber-700 font-medium">
                    Register here
                </Link>
            </motion.p>
        </motion.div>
    )
}
