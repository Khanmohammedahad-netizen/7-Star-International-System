'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { createBrowserClient } from '@supabase/ssr'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { appConfig } from '@/config/app.config'
import { cardStagger, buttonPress } from '@/motion/variants'
import Link from 'next/link'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [message, setMessage] = useState<string | null>(null)

    const supabase = createBrowserClient(
        appConfig.supabase.url,
        appConfig.supabase.anonKey
    )

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault()
        setStatus('loading')
        setMessage(null)

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/reset`,
        })

        if (error) {
            setStatus('error')
            setMessage(error.message)
            return
        }

        setStatus('success')
        setMessage('Check your email for the password reset link.')
    }

    return (
        <motion.div
            variants={cardStagger.container}
            initial="initial"
            animate="animate"
            className="w-full flex-col space-y-6"
        >
            <motion.div variants={cardStagger.item} className="text-center mb-8">
                <h2 className="text-3xl font-bold text-neutral-900">Reset Password</h2>
                <p className="text-sm text-neutral-500 mt-2">Enter your email to receive recovery instructions</p>
            </motion.div>

            {status === 'success' ? (
                <motion.div variants={cardStagger.item} className="text-center p-6 bg-green-50 rounded-xl border border-green-200">
                    <p className="text-green-800 font-medium">{message}</p>
                    <Link href="/auth/login" className="inline-block mt-4 text-sm text-green-700 hover:text-green-900 underline">
                        Return to sign in
                    </Link>
                </motion.div>
            ) : (
                <form onSubmit={handleReset} className="space-y-4">
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

                    {status === 'error' && (
                        <motion.div 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3"
                        >
                            {message}
                        </motion.div>
                    )}

                    <motion.div variants={cardStagger.item} className="pt-4">
                        <motion.div variants={buttonPress} whileTap="whileTap">
                            <Button type="submit" disabled={status === 'loading'} className="w-full bg-neutral-900 text-white hover:bg-neutral-800">
                                {status === 'loading' ? 'Sending...' : 'Send Reset Link'}
                            </Button>
                        </motion.div>
                    </motion.div>
                </form>
            )}

            <motion.p variants={cardStagger.item} className="text-center text-sm text-neutral-500 mt-6">
                Remember your password?{' '}
                <Link href="/auth/login" className="text-amber-600 hover:text-amber-700 font-medium">
                    Sign in
                </Link>
            </motion.p>
        </motion.div>
    )
}
