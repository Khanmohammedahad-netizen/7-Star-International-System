'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { motion } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { appConfig } from '@/config/app.config'
import { cardStagger, buttonPress } from '@/motion/variants'

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [message, setMessage] = useState<string | null>(null)
    const router = useRouter()

    const supabase = createBrowserClient(
        appConfig.supabase.url,
        appConfig.supabase.anonKey
    )

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (password !== confirmPassword) {
            setStatus('error')
            setMessage("Passwords don't match")
            return
        }

        setStatus('loading')
        setMessage(null)

        const { error } = await supabase.auth.updateUser({
            password: password
        })

        if (error) {
            setStatus('error')
            setMessage(error.message)
            return
        }

        setStatus('success')
        setMessage('Password updated successfully.')
        
        setTimeout(() => {
            router.push('/auth/login')
        }, 2000)
    }

    return (
        <motion.div
            variants={cardStagger.container}
            initial="initial"
            animate="animate"
            className="w-full flex-col space-y-6"
        >
            <motion.div variants={cardStagger.item} className="text-center mb-8">
                <h2 className="text-3xl font-bold text-neutral-900">Set New Password</h2>
                <p className="text-sm text-neutral-500 mt-2">Please enter your new password below</p>
            </motion.div>

            {status === 'success' ? (
                <motion.div variants={cardStagger.item} className="text-center p-6 bg-green-50 rounded-xl border border-green-200">
                    <p className="text-green-800 font-medium">{message}</p>
                    <p className="text-sm text-green-600 mt-2">Redirecting to login...</p>
                </motion.div>
            ) : (
                <form onSubmit={handleUpdate} className="space-y-4">
                    <motion.div variants={cardStagger.item}>
                        <Input
                            id="password"
                            label="New Password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </motion.div>

                    <motion.div variants={cardStagger.item}>
                        <Input
                            id="confirmPassword"
                            label="Confirm New Password"
                            type="password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
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
                                {status === 'loading' ? 'Updating...' : 'Update Password'}
                            </Button>
                        </motion.div>
                    </motion.div>
                </form>
            )}
        </motion.div>
    )
}
