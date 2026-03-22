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

export default function RegisterPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const supabase = createBrowserClient(
        appConfig.supabase.url,
        appConfig.supabase.anonKey
    )

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                }
            }
        })

        if (authError) {
            setError(authError.message)
            setLoading(false)
            return
        }

        router.push('/auth/verify')
    }

    return (
        <motion.div
            variants={cardStagger.container}
            initial="initial"
            animate="animate"
            className="w-full flex-col space-y-6"
        >
            <motion.div variants={cardStagger.item} className="text-center mb-8">
                <h2 className="text-3xl font-bold text-neutral-900">Create Account</h2>
                <p className="text-sm text-neutral-500 mt-2">Join the MAK framework</p>
            </motion.div>

            <form onSubmit={handleRegister} className="space-y-4">
                <motion.div variants={cardStagger.item}>
                    <Input
                        id="fullName"
                        label="Full Name"
                        type="text"
                        placeholder="John Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                    />
                </motion.div>

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
                    <Input
                        id="password"
                        label="Password"
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

                <motion.div variants={cardStagger.item} className="pt-4">
                    <motion.div variants={buttonPress} whileTap="whileTap">
                        <Button type="submit" disabled={loading} className="w-full bg-neutral-900 text-white hover:bg-neutral-800">
                            {loading ? 'Creating...' : 'Create Account'}
                        </Button>
                    </motion.div>
                </motion.div>
            </form>

            <motion.p variants={cardStagger.item} className="text-center text-sm text-neutral-500 mt-6">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-amber-600 hover:text-amber-700 font-medium">
                    Sign in
                </Link>
            </motion.p>
        </motion.div>
    )
}
