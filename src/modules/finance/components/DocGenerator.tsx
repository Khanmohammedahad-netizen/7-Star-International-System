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
        <Card className="bg-[#1a1a1a] border border-[#2a2a2a] overflow-hidden sticky top-6">
            <CardHeader className="border-b border-[#2a2a2a] pb-4 bg-[#111111]/50">
                <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                        {type === 'quotation'
                            ? <FileText className="w-4 h-4 text-[#C9A84C]" />
                            : <Receipt className="w-4 h-4 text-[#C9A84C]" />
                        }
                        {type === 'quotation' ? 'Quotation Generator' : 'Invoice Generator'}
                    </h3>
                    <div className="flex bg-[#111111] p-1 rounded-xl border border-[#2a2a2a]">
                        <button
                            onClick={() => { setType('quotation'); setDocNumber(''); setStep('form'); }}
                            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                                type === 'quotation'
                                    ? 'bg-[#C9A84C] text-black shadow-sm'
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            Quotation
                        </button>
                        <button
                            onClick={() => { setType('invoice'); setDocNumber(''); setStep('form'); }}
                            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                                type === 'invoice'
                                    ? 'bg-[#C9A84C] text-black shadow-sm'
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            Invoice
                        </button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-6">
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Document No.</Label>
                            <Input value={docNumber} onChange={(e) => setDocNumber(e.target.value)} className="h-10 bg-[#111111] border-[#2a2a2a] text-white placeholder:text-gray-500" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Issue Date</Label>
                            <Input type="date" className="h-10 bg-[#111111] border-[#2a2a2a] text-white placeholder:text-gray-500 [color-scheme:dark]" defaultValue={new Date().toISOString().split('T')[0]} />
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <Label className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Client Name</Label>
                        <Input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="e.g. John Doe" className="h-10 bg-[#111111] border-[#2a2a2a] text-white placeholder:text-gray-500" />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Select Related Event (Optional)</Label>
                        <Select
                            value={selectedEventId}
                            onChange={(e) => setSelectedEventId(e.target.value)}
                            options={eventOptions}
                        />
                    </div>

                    {/* Line Items */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Line Items</Label>
                            <button type="button" onClick={addLineItem} className="text-xs text-[#C9A84C] font-medium flex items-center gap-1 hover:text-white transition-colors">
                                <Plus className="w-3 h-3" /> Add Item
                            </button>
                        </div>
                        <div className="space-y-2">
                            {lineItems.map((item, i) => (
                                <div key={i} className="flex gap-2 items-center flex-wrap md:flex-nowrap bg-[#111111] border border-[#2a2a2a] p-3 md:p-3 rounded-xl">
                                    <Input 
                                        className="w-full md:flex-1 h-9 text-sm bg-transparent border-none text-white placeholder:text-gray-500 focus:ring-0 px-0" 
                                        placeholder="Description" 
                                        value={item.description}
                                        onChange={(e) => updateLineItem(i, 'description', e.target.value)}
                                    />
                                    <div className="flex gap-2 w-full md:w-auto items-center">
                                        <Input 
                                            className="w-16 h-9 text-sm bg-transparent border-none text-white placeholder:text-gray-500 text-center" 
                                            type="number" 
                                            min="1"
                                            placeholder="Qty" 
                                            value={item.quantity}
                                            onChange={(e) => updateLineItem(i, 'quantity', parseInt(e.target.value) || 0)}
                                        />
                                        <Input 
                                            className="w-24 h-9 text-sm bg-transparent border-none text-white placeholder:text-gray-500 text-right" 
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
                                            className="ml-2 w-8 h-8 flex items-center justify-center shrink-0 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-400/10 disabled:opacity-50 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Totals Summary */}
                    <div className="bg-[#111111] rounded-xl p-4 border border-[#2a2a2a] space-y-2 mt-4">
                        <div className="flex justify-between text-sm text-gray-400">
                            <span>Subtotal</span>
                            <span className="text-white">AED {subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-400">
                            <span>VAT (5%)</span>
                            <span className="text-white">AED {vatAmount.toFixed(2)}</span>
                        </div>
                        <div className="pt-2 border-t border-[#2a2a2a] flex justify-between font-bold text-white">
                            <span>Total</span>
                            <span className="text-[#C9A84C]">AED {total.toFixed(2)}</span>
                        </div>
                    </div>

                    <Button
                        onClick={handleGenerate}
                        disabled={mutation.isPending}
                        className="w-full bg-[#C9A84C] text-black font-semibold rounded-lg px-5 py-2.5 hover:bg-[#b09340] active:scale-[0.98] transition-all border-none disabled:opacity-60"
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
                </div>
            </CardContent>
        </Card>
    )
}
