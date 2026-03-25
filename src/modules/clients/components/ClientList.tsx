"use client"

import React, { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Search, Mail, Phone, Building2, MoreVertical, ExternalLink, Users } from "lucide-react"
import { Client } from "../types"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"

export function ClientList() {
    const [search, setSearch] = useState("")

    const { data: clients, isLoading } = useQuery({
        queryKey: ['clients'],
        queryFn: async () => {
            const res = await fetch('/api/clients')
            const json = await res.json()
            return json.data as Client[]
        }
    })

    const filteredClients = clients?.filter(c => 
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.company?.toLowerCase().includes(search.toLowerCase()) ||
        c.email?.toLowerCase().includes(search.toLowerCase())
    )

    if (isLoading) {
        return (
            <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full rounded-2xl" />
                ))}
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-2 pl-4 focus-within:ring-2 focus-within:ring-white/20 transition-all">
                <Search className="w-5 h-5 text-neutral-500" />
                <input 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search clients by name, company, or email..."
                    className="flex-1 bg-transparent border-none outline-none text-sm py-2 placeholder:text-neutral-600 focus:ring-0"
                />
            </div>

            <div className="grid grid-cols-1 gap-4">
                {filteredClients?.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 border border-dashed border-white/10 rounded-3xl">
                        <Users className="w-12 h-12 text-neutral-700 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-white">No clients found</h3>
                        <p className="text-neutral-500 mt-1">Try a different search term or add your first client.</p>
                    </div>
                ) : (
                    filteredClients?.map((client) => (
                        <div key={client.id} className="group bg-white/5 border border-white/10 p-5 rounded-2xl hover:bg-white/[0.07] transition-all flex items-center justify-between">
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center border border-white/10 text-xl font-bold text-white shadow-lg">
                                    {client.name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-lg tracking-tight">{client.name}</h4>
                                    <div className="flex items-center gap-4 mt-1 text-sm text-neutral-400">
                                        {client.company && (
                                            <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" /> {client.company}</span>
                                        )}
                                        {client.email && (
                                            <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {client.email}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="sm" className="rounded-full">
                                    <ExternalLink className="w-4 h-4 text-neutral-400" />
                                </Button>
                                <Button variant="ghost" size="sm" className="rounded-full">
                                    <MoreVertical className="w-4 h-4 text-neutral-400" />
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
