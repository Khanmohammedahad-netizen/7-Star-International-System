'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { appConfig } from '@/config/app.config'
import { toast } from 'sonner'
import { getSession } from '@/lib/auth/session'

export interface Notification {
    id: string
    title: string
    message: string | null
    is_read: boolean
    link_url: string | null
    created_at: string
}

export function useNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    
    const supabase = createBrowserClient(
        appConfig.supabase.url,
        appConfig.supabase.anonKey
    )

    useEffect(() => {
        let mounted = true
        let channel: ReturnType<typeof supabase.channel>

        async function init() {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) return

            // Initial fetch
            const { data } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false })
                .limit(50)

            if (mounted && data) {
                setNotifications(data)
                setUnreadCount(data.filter(n => !n.is_read).length)
            }

            // Realtime subscription
            channel = supabase
                .channel('realtime_notifications')
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'notifications',
                        filter: `user_id=eq.${session.user.id}`,
                    },
                    (payload) => {
                        const newNotification = payload.new as Notification
                        if (mounted) {
                            setNotifications(prev => [newNotification, ...prev])
                            setUnreadCount(prev => prev + 1)
                            toast.info(newNotification.title, {
                                description: newNotification.message || undefined,
                            })
                        }
                    }
                )
                .subscribe()
        }

        init()

        return () => {
            mounted = false
            if (channel) supabase.removeChannel(channel)
        }
    }, [supabase])

    const markAsRead = async (id: string) => {
        setNotifications(prev => 
            prev.map(n => n.id === id ? { ...n, is_read: true } : n)
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
        
        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id)
    }

    const markAllAsRead = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
        setUnreadCount(0)

        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', session.user.id)
            .eq('is_read', false)
    }

    return {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead
    }
}
