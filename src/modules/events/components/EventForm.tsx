"use client"

import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createEventSchema } from "../schema"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useQuery } from "@tanstack/react-query"
import { useEventMutations } from "../hooks/useEventMutations"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { z } from "zod"

type EventFormData = z.infer<typeof createEventSchema>

export function EventForm() {
    const router = useRouter()
    const { createEvent, isCreating } = useEventMutations()

    const { data: clients } = useQuery({
        queryKey: ['clients'],
        queryFn: async () => {
            const res = await fetch('/api/clients')
            const json = await res.json()
            return json.data || []
        }
    })

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<EventFormData>({
        resolver: zodResolver(createEventSchema),
        defaultValues: {
            status: 'planning',
            type: 'corporate',
            venue_city: 'Dubai',
            venue_country: 'UAE',
            color: '#C9A84C',
            expected_guests: undefined,
            budget_total: undefined,
        } as any
    })

    const onSubmit = async (data: EventFormData) => {
        try {
            // Sanitize: coerce empty string client_id → null (never send "" to UUID column)
            const payload = {
                ...data,
                client_id: data.client_id && data.client_id !== '' ? data.client_id : null,
                // budget_total: ensure number or null, never NaN
                budget_total: typeof data.budget_total === 'number' && !isNaN(data.budget_total)
                    ? data.budget_total
                    : null,
                expected_guests: typeof data.expected_guests === 'number' && !isNaN(data.expected_guests)
                    ? data.expected_guests
                    : null,
                // Dates are already validated as YYYY-MM-DD strings by schema
            }
            await createEvent(payload)
            toast.success("Event created successfully", {
                description: `${data.name} has been added to the Event Command Center.`
            })
            router.push('/events')
        } catch (error: any) {
            toast.error("Failed to create event", {
                description: error.message || "An unexpected database error occurred."
            })
        }
    }

    const isPending = isSubmitting || isCreating

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="name">Event Name <span className="text-red-400">*</span></Label>
                    <Input id="name" {...register('name')} placeholder="e.g. Annual Gala 2024" className="h-11 border-white/10 bg-white/5" />
                    {errors.name && <p className="text-xs text-red-400">{errors.name.message as string}</p>}
                </div>

                <div className="space-y-2">
                    <Select 
                        label="Client"
                        {...register('client_id')}
                        options={[
                            { label: 'No Client (Internal)', value: '' },
                            ...(clients?.map((c: any) => ({ label: c.name, value: c.id })) || [])
                        ]}
                    />
                </div>

                <div className="space-y-2">
                    <Select 
                        label="Event Type"
                        {...register('type')}
                        options={[
                            { label: 'Corporate', value: 'corporate' },
                            { label: 'Wedding', value: 'wedding' },
                            { label: 'Gala', value: 'gala' },
                            { label: 'Conference', value: 'conference' },
                            { label: 'Exhibition', value: 'exhibition' },
                            { label: 'Product Launch', value: 'product_launch' },
                            { label: 'Private', value: 'private' },
                            { label: 'Concert', value: 'concert' },
                            { label: 'Other', value: 'other' }
                        ]}
                    />
                </div>

                <div className="space-y-2">
                    <Select 
                        label="Initial Status"
                        {...register('status')}
                        options={[
                            { label: 'Planning', value: 'planning' },
                            { label: 'Confirmed', value: 'confirmed' },
                            { label: 'In Progress', value: 'in_progress' },
                        ]}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date <span className="text-red-400">*</span></Label>
                    <Input id="start_date" type="date" {...register('start_date')} className="h-11 border-white/10 bg-white/5 inv-color-scheme-dark" />
                    {errors.start_date && <p className="text-xs text-red-400">{errors.start_date.message as string}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="end_date">End Date <span className="text-red-400">*</span></Label>
                    <Input id="end_date" type="date" {...register('end_date')} className="h-11 border-white/10 bg-white/5 inv-color-scheme-dark" />
                    {errors.end_date && <p className="text-xs text-red-400">{errors.end_date.message as string}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="venue_name">Venue Name</Label>
                    <Input id="venue_name" {...register('venue_name')} placeholder="Hotel Ballroom, Convention Centre..." className="h-11 border-white/10 bg-white/5" />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="expected_guests">Expected Guests</Label>
                    <Input 
                        id="expected_guests" 
                        type="number" 
                        min="0"
                        {...register('expected_guests', { 
                            setValueAs: (v) => v === '' || v === undefined ? null : parseInt(v, 10) || null 
                        })} 
                        placeholder="0" 
                        className="h-11 border-white/10 bg-white/5" 
                    />
                </div>

                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="budget_total">Total Budget (AED)</Label>
                    <Input 
                        id="budget_total" 
                        type="number" 
                        step="0.01"
                        min="0"
                        {...register('budget_total', { 
                            setValueAs: (v) => v === '' || v === undefined ? null : parseFloat(v) || null 
                        })} 
                        placeholder="0.00" 
                        className="h-11 border-white/10 bg-white/5" 
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="notes">Event Notes</Label>
                <Textarea id="notes" {...register('notes')} placeholder="General setup requirements, special requests, important notes..." rows={4} className="border-white/10 bg-white/5" />
            </div>

            <div className="flex justify-end gap-4 pt-10 border-t border-white/5 mt-8">
                <Button type="button" variant="ghost" onClick={() => router.back()} className="h-12 px-8 text-neutral-400 hover:text-white hover:bg-white/5 transition-all">
                    Cancel
                </Button>
                <Button type="submit" disabled={isPending} className="h-12 px-12 bg-white text-black font-bold hover:bg-neutral-200 transition-all shadow-xl shadow-white/5 disabled:opacity-50">
                    {isPending ? (
                        <span className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Creating Event...
                        </span>
                    ) : 'Initialize Event Command Center'}
                </Button>
            </div>
        </form>
    )
}
