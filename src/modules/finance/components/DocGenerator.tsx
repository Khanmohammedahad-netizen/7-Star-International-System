"use client"

import React, { useState } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { FileText, Receipt, Download, RefreshCw, CheckCircle2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

export function DocGenerator() {
    const [type, setType] = useState<"quotation" | "invoice">("quotation")
    const [isGenerating, setIsGenerating] = useState(false)
    const [step, setStep] = useState<"form" | "success">("form")

    const handleGenerate = async () => {
        setIsGenerating(true)
        await new Promise(resolve => setTimeout(resolve, 2000))
        setIsGenerating(false)
        setStep("success")
        toast.success(`${type === 'quotation' ? 'Quotation' : 'Invoice'} generated successfully`)
    }

    return (
        <Card className="bg-[#111111] border-white/10 overflow-hidden relative">
            {/* Subtle gradient accent */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-transparent pointer-events-none" />

            <CardHeader className="border-b border-white/10 pb-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                        {type === 'quotation'
                            ? <FileText className="w-4 h-4 text-blue-400" />
                            : <Receipt className="w-4 h-4 text-emerald-400" />
                        }
                        {type === 'quotation' ? 'Quotation Generator' : 'Invoice Generator'}
                    </h3>
                    {/* Tab toggle — always visible */}
                    <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                        <button
                            onClick={() => { setType('quotation'); setStep('form'); }}
                            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                                type === 'quotation'
                                    ? 'bg-white text-black shadow-sm'
                                    : 'text-neutral-500 hover:text-neutral-300'
                            }`}
                        >
                            Quotation
                        </button>
                        <button
                            onClick={() => { setType('invoice'); setStep('form'); }}
                            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                                type === 'invoice'
                                    ? 'bg-white text-black shadow-sm'
                                    : 'text-neutral-500 hover:text-neutral-300'
                            }`}
                        >
                            Invoice
                        </button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-6">
                <AnimatePresence mode="wait">
                    {step === "form" ? (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="space-y-5"
                        >
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">
                                        Document Number
                                    </Label>
                                    <Input
                                        defaultValue={type === 'quotation'
                                            ? `QT-${Math.floor(1000 + Math.random() * 9000)}`
                                            : `INV-${Math.floor(1000 + Math.random() * 9000)}`
                                        }
                                        className="h-10"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">
                                        Issue Date
                                    </Label>
                                    <Input
                                        type="date"
                                        className="h-10 inv-color-scheme-dark"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">
                                    Select Related Event
                                </Label>
                                <Select
                                    options={[
                                        { label: 'Gala Dinner 2024', value: '1' },
                                        { label: 'Tech Summit', value: '2' }
                                    ]}
                                />
                            </div>

                            {/* Generate button — always bg-white text-black, highly visible */}
                            <Button
                                onClick={handleGenerate}
                                disabled={isGenerating}
                                className="w-full h-11 mt-2 bg-white text-black font-bold rounded-xl hover:bg-neutral-200 active:scale-[0.98] transition-all shadow-lg border-transparent disabled:opacity-60"
                            >
                                {isGenerating ? (
                                    <span className="flex items-center gap-2">
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        Generating...
                                    </span>
                                ) : (
                                    `Generate ${type.charAt(0).toUpperCase() + type.slice(1)}`
                                )}
                            </Button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center py-6 text-center space-y-4"
                        >
                            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2">
                                <CheckCircle2 className="w-10 h-10" />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-white">Document Ready</h4>
                                <p className="text-sm text-neutral-400 mt-1">Successfully compiled and finalized.</p>
                            </div>
                            <div className="flex flex-col w-full gap-2">
                                <Button
                                    variant="secondary"
                                    className="w-full h-11"
                                >
                                    <Download className="w-4 h-4 mr-2" /> Download PDF
                                </Button>
                                <button
                                    onClick={() => setStep('form')}
                                    className="text-neutral-500 text-xs hover:text-neutral-300 transition-colors py-2"
                                >
                                    Generate Another
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    )
}
