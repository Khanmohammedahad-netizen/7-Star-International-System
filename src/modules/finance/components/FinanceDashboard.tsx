"use client"

import React from "react"
import { useQuery } from "@tanstack/react-query"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
    DollarSign, 
    ArrowUpRight, 
    ArrowDownRight, 
    Clock, 
    Receipt, 
    FileText,
    TrendingUp
} from "lucide-react"
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts'

export function FinanceDashboard() {
    const { data: financeData, isLoading } = useQuery({
        queryKey: ['finance-summary'],
        queryFn: async () => {
            const res = await fetch('/api/finance')
            const json = await res.json()
            return json.data
        }
    })

    if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading finance data...</div>

    const summary = financeData?.summary

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-6 bg-white/5 border-white/10 hover:border-primary/50 transition-all group overflow-hidden relative">
                    <div className="absolute -right-4 -bottom-4 bg-primary/5 rounded-full w-24 h-24 group-hover:scale-150 transition-transform duration-700" />
                    <div className="flex justify-between items-start relative">
                        <div>
                            <p className="text-sm text-neutral-400 font-medium">Total Revenue</p>
                            <h3 className="text-2xl font-bold mt-1 text-white">AED {summary?.total_revenue.toLocaleString()}</h3>
                        </div>
                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6 bg-white/5 border-white/10 hover:border-primary/50 transition-all group overflow-hidden relative">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-neutral-400 font-medium">Pending Payments</p>
                            <h3 className="text-2xl font-bold mt-1 text-white">AED {summary?.pending_payments.toLocaleString()}</h3>
                        </div>
                        <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500">
                            <Clock className="w-5 h-5" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6 bg-white/5 border-white/10 hover:border-primary/50 transition-all group overflow-hidden relative">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-neutral-400 font-medium">Total Expenses</p>
                            <h3 className="text-2xl font-bold mt-1 text-white">AED {summary?.total_expenses.toLocaleString()}</h3>
                        </div>
                        <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                            <ArrowDownRight className="w-5 h-5" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6 bg-white/5 border-white/10 hover:border-primary/50 transition-all group overflow-hidden relative">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-neutral-400 font-medium">Net Profit</p>
                            <h3 className="text-2xl font-bold mt-1 text-white">AED {summary?.net_profit.toLocaleString()}</h3>
                        </div>
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <ArrowUpRight className="w-5 h-5" />
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Invoices */}
                <Card className="lg:col-span-2 p-6 bg-white/5 border-white/10 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <Receipt className="w-5 h-5 text-primary" />
                            Recent Invoices
                        </h3>
                        <Badge variant="outline" className="border-white/20">Last 10 Activity</Badge>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="text-sm text-neutral-500 border-b border-white/5">
                                <tr>
                                    <th className="pb-3 font-medium">ID</th>
                                    <th className="pb-3 font-medium">Amount</th>
                                    <th className="pb-3 font-medium">Status</th>
                                    <th className="pb-3 font-medium">Date</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {financeData?.recent_invoices.map((inv: any) => (
                                    <tr key={inv.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group">
                                        <td className="py-4 font-mono text-xs text-neutral-400 group-hover:text-white transition-colors">{inv.id.split('-')[0]}</td>
                                        <td className="py-4 font-bold text-white">AED {inv.total.toLocaleString()}</td>
                                        <td className="py-4">
                                            <Badge variant={inv.status === 'paid' ? 'success' : 'secondary'} className="capitalize text-[10px]">
                                                {inv.status}
                                            </Badge>
                                        </td>
                                        <td className="py-4 text-neutral-500 font-medium">{new Date(inv.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                                {financeData?.recent_invoices.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="py-8 text-center text-neutral-600 italic">No invoices found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Expenses Breakdown */}
                <Card className="p-6 bg-white/5 border-white/10 h-full">
                    <div className="flex flex-col h-full">
                        <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
                            <FileText className="w-5 h-5 text-red-400" />
                            Recent Expenses
                        </h3>
                        <div className="space-y-4 flex-1">
                            {financeData?.recent_expenses.map((exp: any) => (
                                <div key={exp.id} className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all group">
                                    <div className="w-10 h-10 rounded-full bg-red-400/10 flex items-center justify-center text-red-400 shrink-0">
                                        <span className="text-xs font-bold font-mono">{exp.category[0].toUpperCase()}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-white truncate capitalize">{exp.category}</p>
                                        <p className="text-xs text-neutral-500 font-medium">Approved</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-white">AED {exp.amount.toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                            {financeData?.recent_expenses.length === 0 && (
                                <div className="py-12 text-center text-neutral-600 italic">No recent expenses</div>
                            )}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}
