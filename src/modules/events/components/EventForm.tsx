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

export function EventForm() {
    const router = useRouter()
    const { createEvent } = useEventMutations()

    const { data: clients } = useQuery({
        queryKey: ['clients'],
        queryFn: async () => {
            const res = await fetch('/api/clients')
            const json = await res.json()
            return json.data || []
        }
    })

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(createEventSchema),
        defaultValues: {
            status: 'planning',
            type: 'corporate',
            venue_city: 'Dubai',
            venue_country: 'UAE',
            color: '#C9A84C'
        }
    })

    const onSubmit = async (data: any) => {
        try {
            await createEvent(data)
            toast.success("Event created successfully")
            router.push('/events')
        } catch (error) {
            toast.error("Failed to create event")
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="name">Event Name</Label>
                    <Input id="name" {...register('name')} placeholder="e.g. Annual Gala 2024" className="h-11 border-white/10 bg-white/5" />
                    {errors.name && <p className="text-xs text-red-500">{errors.name.message as string}</p>}
                </div>

                <div className="space-y-2">
                    <Select 
                        label="Client"
                        {...register('client_id')}
                        options={[
                            { label: 'Select Client', value: '' },
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
                        ]}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input id="start_date" type="date" {...register('start_date')} className="h-11 border-white/10 bg-white/5 inv-color-scheme-dark" />
                    {errors.start_date && <p className="text-xs text-red-500">{errors.start_date.message as string}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="end_date">End Date</Label>
                    <Input id="end_date" type="date" {...register('end_date')} className="h-11 border-white/10 bg-white/5 inv-color-scheme-dark" />
                    {errors.end_date && <p className="text-xs text-red-500">{errors.end_date.message as string}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="venue_name">Venue Name</Label>
                    <Input id="venue_name" {...register('venue_name')} placeholder="Hotel Ballroom, etc." className="h-11 border-white/10 bg-white/5" />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="budget_total">Total Budget (AED)</Label>
                    <Input id="budget_total" type="number" {...register('budget_total', { valueAsNumber: true })} placeholder="0.00" className="h-11 border-white/10 bg-white/5" />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="notes">Event Notes</Label>
                <Textarea id="notes" {...register('notes')} placeholder="General setup requirements, special requests..." rows={4} className="border-white/10 bg-white/5" />
            </div>

            <div className="flex justify-end gap-4 pt-10 border-t border-white/5 mt-8">
                <Button type="button" variant="ghost" onClick={() => router.back()} className="h-12 px-8 text-neutral-400 hover:text-white hover:bg-white/5 transition-all">
                    Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="h-12 px-12 bg-white text-black font-bold hover:bg-neutral-200 transition-all shadow-xl shadow-white/5 disabled:opacity-50">
                    {isSubmitting ? 'Creating...' : 'Initialize Event Command Center'}
                </Button>
            </div>
        </form>
    )
}
