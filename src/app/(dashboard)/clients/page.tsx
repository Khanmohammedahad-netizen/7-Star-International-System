"use client"

import React, { useState } from "react"
import { ClientList } from "@/modules/clients/components/ClientList"
import { ClientForm } from "@/modules/clients/components/ClientForm"
import { Plus, Users, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"

import { useQuery } from "@tanstack/react-query"
import { Client } from "@/modules/clients/types"
import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "framer-motion"

export default function ClientsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false)

    const { data: clients, isLoading } = useQuery({
        queryKey: ['clients'],
        queryFn: async () => {
            const res = await fetch('/api/clients')
            const json = await res.json()
            return json.data as Client[]
        }
    })

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 min-h-screen">
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-6"
            >
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-white flex items-center gap-3" style={{ fontFamily: 'var(--font-cormorant)' }}>
                        Client Directory
                    </h1>
                    <p className="text-neutral-400 mt-2 text-lg">Manage key accounts, contact intelligence, and organizational partnerships.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="ghost" className="h-11 px-5 rounded-xl border border-white/10 bg-white/5 text-sm font-medium hover:bg-white/10 transition-all flex items-center gap-2 text-neutral-400">
                        <Filter className="w-4 h-4" /> Filter
                    </Button>
                    
                    <Button 
                        onClick={() => setIsModalOpen(true)}
                        className="h-11 px-8 rounded-xl bg-white text-black font-bold hover:bg-neutral-200 transition-all flex items-center gap-2 shadow-2xl shadow-white/10 border-transparent"
                    >
                        <Plus className="w-5 h-5" /> Add New Client
                    </Button>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Stats Summary Panel */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="lg:col-span-1 space-y-4"
                >
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm relative overflow-hidden group min-h-[160px] flex items-center justify-between">
                        <div className="flex flex-col z-10">
                            <span className="text-neutral-500 text-sm font-medium uppercase tracking-widest">Total Active</span>
                            {isLoading ? (
                                <Skeleton className="h-10 w-12 bg-white/5 mt-2" />
                            ) : (
                                <span className="text-5xl font-bold text-white mt-2">{clients?.length || 0}</span>
                            )}
                        </div>
                        <Users className="w-20 h-20 text-white/5 absolute -bottom-4 -right-4 transition-transform group-hover:scale-110" />
                    </div>
                </motion.div>

                {/* Main Content Area */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="lg:col-span-3"
                >
                    <ClientList />
                </motion.div>
            </div>

            {/* Creation Modal */}
            <Modal 
                open={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title="New Client Profile"
                className="max-w-xl"
            >
                <div className="space-y-6">
                    <p className="text-neutral-400 text-sm">Register a new client entity in the 7STAR ecosystem to enable event assignments and CRM tracking.</p>
                    <ClientForm 
                        onSuccess={() => setIsModalOpen(false)} 
                        onCancel={() => setIsModalOpen(false)} 
                    />
                </div>
            </Modal>
        </div>
    )
}
