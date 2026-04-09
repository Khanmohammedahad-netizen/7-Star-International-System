/**
 * @file FinancePage.tsx
 * @description Global finance intelligence for the 7STAR OS.
 */

import { FinanceDashboard } from "@/modules/finance/components/FinanceDashboard"
import { DocGenerator } from "@/modules/finance/components/DocGenerator"
import { Download, Filter } from "lucide-react"

export default function FinancePage() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white flex items-center gap-3">
            Financial Intelligence
          </h1>
          <p className="text-neutral-400 mt-2 text-lg">
            Real-time revenue monitoring, billing status, and expense tracking across all events.
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <button className="h-10 px-4 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-neutral-300 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-2">
            <Filter className="w-4 h-4" /> Filter
          </button>
          <button className="h-10 px-5 rounded-xl bg-white text-black text-sm font-bold hover:bg-neutral-200 transition-colors flex items-center gap-2 shadow-lg shadow-white/5">
            <Download className="w-4 h-4" /> Export Report
          </button>
        </div>
      </div>

      {/* 2/3 + 1/3 layout — DocGenerator column is sticky so it stays visible on scroll */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Finance Dashboard spanning 2 columns */}
        <div className="lg:col-span-2">
          <FinanceDashboard />
        </div>

        {/* Quotation Generator — sticky sidebar */}
        <div className="lg:col-span-1 sticky top-6">
          <DocGenerator />
        </div>
      </div>
    </div>
  )
}
