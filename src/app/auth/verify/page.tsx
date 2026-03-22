'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { cardStagger } from '@/motion/variants'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function VerifyPage() {
    const [mounted, setMounted] = useState(false)
    const router = useRouter()

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    return (
        <motion.div
            variants={cardStagger.container}
            initial="initial"
            animate="animate"
            className="w-full flex-col space-y-6 text-center"
        >
            <motion.div variants={cardStagger.item} className="mb-4">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>
                <h2 className="text-3xl font-bold text-neutral-900">Check your email</h2>
                <p className="text-base text-neutral-500 mt-3 max-w-sm mx-auto">
                    We've sent you a verification link. Please click the link to verify your account and continue.
                </p>
            </motion.div>

            <motion.div variants={cardStagger.item} className="pt-8 space-y-4">
                <Button 
                    onClick={() => router.push('/auth/login')}
                    className="w-full bg-neutral-900 text-white hover:bg-neutral-800"
                >
                    Back to Login
                </Button>
                
                <p className="text-sm text-neutral-500 mt-6">
                    Didn't receive the email?{' '}
                    <button className="text-amber-600 hover:text-amber-700 font-medium">
                        Click to resend
                    </button>
                </p>
            </motion.div>
        </motion.div>
    )
}
