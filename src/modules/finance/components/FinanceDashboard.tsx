"use client"

import React from "react"
import { useQuery } from "@tanstack/react-query"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
    ArrowUpRight, 
    ArrowDownRight, 
    Clock, 
    Receipt, 
    FileText,
    TrendingUp
} from "lucide-react"

export function FinanceDashboard() {
    const { data: financeData, isLoading, refetch } = useQuery({
        queryKey: ['finance-summary'],
        queryFn: async () => {
            const res = await fetch('/api/finance')
            if (!res.ok) throw new Error('Failed to fetch finance data')
            const json = await res.json()
            return json.data
        },
        staleTime: 0,
        refetchOnWindowFocus: true,
    })

    if (isLoading) return <div className="p-8 text-center text-neutral-400 animate-pulse">Loading finance data...</div>

    const summary = financeData?.summary

    // Safe number formatter — returns "0" if value is null/undefined
    const fmt = (val: number | null | undefined) =>
        Math.round(val ?? 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <Card className="p-4 md:p-6 bg-[#1a1a1a] border border-[#2a2a2a] hover:bg-[#1a1a1a]/80 transition-all group overflow-hidden relative">
                    <div className="flex flex-col-reverse md:flex-row justify-between items-start md:items-center relative gap-3">
                        <div>
                            <p className="text-xs md:text-sm text-gray-400 font-medium">Total Revenue</p>
                            <h3 className="text-base md:text-2xl font-bold mt-1 text-white">
                                <span className="text-gray-400 mr-1 text-sm font-normal">AED</span>
                                <span className="tabular-nums">{fmt(summary?.total_revenue)}</span>
                            </h3>
                        </div>
                        <div className="p-1.5 md:p-2 bg-emerald-500/10 rounded-lg text-emerald-400 w-fit">
                            <TrendingUp className="w-4 h-4 md:w-5 md:h-5" />
                        </div>
                    </div>
                </Card>

                <Card className="p-4 md:p-6 bg-[#1a1a1a] border border-[#2a2a2a] hover:bg-[#1a1a1a]/80 transition-all group overflow-hidden relative">
                    <div className="flex flex-col-reverse md:flex-row justify-between items-start md:items-center gap-3">
                        <div>
                            <p className="text-xs md:text-sm text-gray-400 font-medium">Pending</p>
                            <h3 className="text-base md:text-2xl font-bold mt-1 text-white">
                                <span className="text-gray-400 mr-1 text-sm font-normal">AED</span>
                                <span className="tabular-nums">{fmt(summary?.pending_payments)}</span>
                            </h3>
                        </div>
                        <div className="p-1.5 md:p-2 bg-amber-500/10 rounded-lg text-amber-500 w-fit">
                            <Clock className="w-4 h-4 md:w-5 md:h-5" />
                        </div>
                    </div>
                </Card>

                <Card className="p-4 md:p-6 bg-[#1a1a1a] border border-[#2a2a2a] hover:bg-[#1a1a1a]/80 transition-all group overflow-hidden relative">
                    <div className="flex flex-col-reverse md:flex-row justify-between items-start md:items-center gap-3">
                        <div>
                            <p className="text-xs md:text-sm text-gray-400 font-medium">Expenses</p>
                            <h3 className="text-base md:text-2xl font-bold mt-1 text-white">
                                <span className="text-gray-400 mr-1 text-sm font-normal">AED</span>
                                <span className="tabular-nums">{fmt(summary?.total_expenses)}</span>
                            </h3>
                        </div>
                        <div className="p-1.5 md:p-2 bg-red-500/10 rounded-lg text-red-500 w-fit">
                            <ArrowDownRight className="w-4 h-4 md:w-5 md:h-5" />
                        </div>
                    </div>
                </Card>

                <Card className="p-4 md:p-6 bg-[#1a1a1a] border border-[#2a2a2a] hover:bg-[#1a1a1a]/80 transition-all group overflow-hidden relative">
                    <div className="flex flex-col-reverse md:flex-row justify-between items-start md:items-center gap-3">
                        <div>
                            <p className="text-xs md:text-sm text-gray-400 font-medium">Net Profit</p>
                            <h3 className="text-base md:text-2xl font-bold mt-1 text-[#C9A84C]">
                                <span className="text-gray-400 mr-1 text-sm font-normal">AED</span>
                                <span className="tabular-nums">{fmt(summary?.net_profit)}</span>
                            </h3>
                        </div>
                        <div className="p-1.5 md:p-2 bg-[#C9A84C]/10 rounded-lg text-[#C9A84C] w-fit">
                            <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5" />
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Invoices */}
                <Card className="lg:col-span-2 p-6 bg-[#1a1a1a] border border-[#2a2a2a] flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Receipt className="w-5 h-5 text-[#C9A84C]" />
                            Recent Invoices
                        </h3>
                        <Badge variant="outline" className="border-[#2a2a2a] text-gray-400 bg-[#111111]">Last 10 Activity</Badge>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="text-xs text-gray-400 uppercase tracking-wider border-b border-[#2a2a2a]">
                                <tr>
                                    <th className="pb-3 font-semibold">ID</th>
                                    <th className="pb-3 font-semibold">Amount</th>
                                    <th className="pb-3 font-semibold">Status</th>
                                    <th className="pb-3 font-semibold">Date</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {financeData?.recent_invoices?.map((inv: any) => (
                                    <tr key={inv.id} className="border-b border-[#2a2a2a] hover:bg-[#111111] transition-colors group">
                                        <td className="py-4 font-mono text-xs text-gray-400">{(inv.doc_number || inv.invoice_number || inv.id?.split('-')[0] || '—')}</td>
                                        <td className="py-4 font-bold text-white">AED {fmt(inv.total)}</td>
                                        <td className="py-4">
                                            <Badge variant={inv.status === 'paid' ? 'success' : 'secondary'} className="capitalize text-[10px]">
                                                {inv.status}
                                            </Badge>
                                        </td>
                                        <td className="py-4 text-gray-400 font-medium">{new Date(inv.created_at).toISOString().split('T')[0]}</td>
                                    </tr>
                                ))}
                                {(!financeData?.recent_invoices || financeData.recent_invoices.length === 0) && (
                                    <tr>
                                        <td colSpan={4} className="py-12 text-center text-gray-500 italic">No invoices found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Expenses Breakdown */}
                <Card className="p-6 bg-[#1a1a1a] border border-[#2a2a2a] h-full">
                    <div className="flex flex-col h-full">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                            <FileText className="w-5 h-5 text-red-500" />
                            Recent Expenses
                        </h3>
                        <div className="space-y-4 flex-1">
                            {financeData?.recent_expenses?.map((exp: any) => (
                                <div key={exp.id} className="flex items-center gap-4 p-3 rounded-xl bg-[#111111] border border-[#2a2a2a] hover:bg-[#111111]/80 transition-all group">
                                    <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
                                        <span className="text-xs font-bold font-mono">{(exp.category?.[0] ?? '?').toUpperCase()}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-white truncate capitalize">{exp.category}</p>
                                        <p className="text-xs text-gray-400 font-medium">{exp.description}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-white">AED {fmt(exp.amount)}</p>
                                    </div>
                                </div>
                            ))}
                            {(!financeData?.recent_expenses || financeData.recent_expenses.length === 0) && (
                                <div className="py-12 text-center text-gray-500 italic">No expenses found</div>
                            )}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}
