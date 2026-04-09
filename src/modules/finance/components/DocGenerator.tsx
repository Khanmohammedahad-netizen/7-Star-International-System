"use client"

import React, { useState, useMemo } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { FileText, Receipt, Download, RefreshCw, CheckCircle2, Plus, Trash2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

type LineItem = { description: string, quantity: number, unit_price: number }

export function DocGenerator() {
    const queryClient = useQueryClient()
    const [type, setType] = useState<"quotation" | "invoice">("quotation")
    const [step, setStep] = useState<"form" | "success">("form")
    const [docNumber, setDocNumber] = useState("")
    const [clientName, setClientName] = useState("")
    const [selectedEventId, setSelectedEventId] = useState("")
    const [lineItems, setLineItems] = useState<LineItem[]>([{ description: "", quantity: 1, unit_price: 0 }])

    // Fetch events for dropdown (use events query to populate the select)
    const { data: events } = useQuery({
        queryKey: ['events'],
        queryFn: async () => {
            const res = await fetch('/api/events')
            const json = await res.json()
            return json.data || []
        }
    })

    const eventOptions = useMemo(() => {
        const opts = (events || []).map((e: any) => ({ label: e.name || e.title, value: e.id }))
        return [{ label: "No Event Linked", value: "" }, ...opts]
    }, [events])

    // Calculate totals
    const subtotal = lineItems.reduce((acc, item) => acc + (item.quantity * item.unit_price), 0)
    const vatAmount = subtotal * 0.05
    const total = subtotal + vatAmount

    // Auto-generate initial doc number
    React.useEffect(() => {
        if (step === 'form' && !docNumber) {
            setDocNumber(`${type === 'quotation' ? 'QT' : 'INV'}-${Math.floor(1000 + Math.random() * 9000)}`)
        }
    }, [type, step])

    const addLineItem = () => {
        setLineItems([...lineItems, { description: "", quantity: 1, unit_price: 0 }])
    }

    const updateLineItem = (index: number, field: keyof LineItem, value: any) => {
        const newItems = [...lineItems]
        newItems[index] = { ...newItems[index], [field]: value }
        setLineItems(newItems)
    }

    const removeLineItem = (index: number) => {
        if (lineItems.length > 1) {
            setLineItems(lineItems.filter((_, i) => i !== index))
        }
    }

    const mutation = useMutation({
        mutationFn: async () => {
            const res = await fetch('/api/invoices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    doc_type: type,
                    doc_number: docNumber,
                    client_name: clientName,
                    event_id: selectedEventId || null,
                    subtotal,
                    line_items: lineItems
                })
            })
            const json = await res.json()
            if (!res.ok || !json.success) throw new Error(json.error || 'Failed to generate document')
            return json.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['finance'] })
            queryClient.invalidateQueries({ queryKey: ['dashboard'] })
            setStep("success")
            toast.success(`${type === 'quotation' ? 'Quotation' : 'Invoice'} generated successfully`)
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to generate document")
        }
    })

    const handleGenerate = () => {
        if (!clientName) {
            toast.error("Client Name is required")
            return
        }
        if (lineItems.some(i => !i.description)) {
            toast.error("Line item descriptions cannot be empty")
            return
        }
        mutation.mutate()
    }

    return (
        <Card className="bg-[#111111] border-white/10 overflow-hidden relative">
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
                    <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                        <button
                            onClick={() => { setType('quotation'); setDocNumber(''); setStep('form'); }}
                            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                                type === 'quotation'
                                    ? 'bg-white text-black shadow-sm'
                                    : 'text-neutral-500 hover:text-neutral-300'
                            }`}
                        >
                            Quotation
                        </button>
                        <button
                            onClick={() => { setType('invoice'); setDocNumber(''); setStep('form'); }}
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
                            className="space-y-6"
                        >
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">Document No.</Label>
                                    <Input value={docNumber} onChange={(e) => setDocNumber(e.target.value)} className="h-10" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">Client Name</Label>
                                    <Input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="e.g. John Doe" className="h-10" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">Related Event</Label>
                                <Select
                                    value={selectedEventId}
                                    onChange={(e) => setSelectedEventId(e.target.value)}
                                    options={eventOptions}
                                />
                            </div>

                            {/* Line Items */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">Line Items</Label>
                                    <button type="button" onClick={addLineItem} className="text-xs text-blue-400 font-medium flex items-center gap-1 hover:text-blue-300">
                                        <Plus className="w-3 h-3" /> Add Item
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {lineItems.map((item, i) => (
                                        <div key={i} className="flex gap-2 items-center">
                                            <Input 
                                                className="flex-1 h-9 text-sm" 
                                                placeholder="Description" 
                                                value={item.description}
                                                onChange={(e) => updateLineItem(i, 'description', e.target.value)}
                                            />
                                            <Input 
                                                className="w-20 h-9 text-sm" 
                                                type="number" 
                                                min="1"
                                                placeholder="Qty" 
                                                value={item.quantity}
                                                onChange={(e) => updateLineItem(i, 'quantity', parseInt(e.target.value) || 0)}
                                            />
                                            <Input 
                                                className="w-28 h-9 text-sm" 
                                                type="number" 
                                                step="0.01"
                                                min="0"
                                                placeholder="Price" 
                                                value={item.unit_price}
                                                onChange={(e) => updateLineItem(i, 'unit_price', parseFloat(e.target.value) || 0)}
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => removeLineItem(i)}
                                                disabled={lineItems.length === 1}
                                                className="w-9 h-9 flex items-center justify-center shrink-0 rounded-md text-neutral-500 hover:text-red-400 hover:bg-red-400/10 disabled:opacity-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Totals Summary */}
                            <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-2">
                                <div className="flex justify-between text-sm text-neutral-400">
                                    <span>Subtotal</span>
                                    <span>{new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED' }).format(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-neutral-400">
                                    <span>VAT (5%)</span>
                                    <span>{new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED' }).format(vatAmount)}</span>
                                </div>
                                <div className="pt-2 border-t border-white/10 flex justify-between font-bold text-white">
                                    <span>Total</span>
                                    <span>{new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED' }).format(total)}</span>
                                </div>
                            </div>

                            <Button
                                onClick={handleGenerate}
                                disabled={mutation.isPending}
                                className="w-full h-11 bg-white text-black font-bold rounded-xl hover:bg-neutral-200 active:scale-[0.98] transition-all shadow-lg border-transparent disabled:opacity-60"
                            >
                                {mutation.isPending ? (
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
                                <h4 className="text-lg font-bold text-white">Document Generated</h4>
                                <p className="text-sm text-neutral-400 mt-1">Successfully compiled and saved to database.</p>
                            </div>
                            <div className="flex flex-col w-full gap-2 mt-4">
                                <Button
                                    variant="secondary"
                                    className="w-full h-11"
                                    onClick={() => toast("PDF generation would happen here.")}
                                >
                                    <Download className="w-4 h-4 mr-2" /> Download Document
                                </Button>
                                <button
                                    onClick={() => {
                                        setDocNumber('');
                                        setClientName('');
                                        setLineItems([{ description: "", quantity: 1, unit_price: 0 }]);
                                        setStep('form');
                                    }}
                                    className="text-neutral-500 text-xs hover:text-neutral-300 transition-colors py-2 mt-2"
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
