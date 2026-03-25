"use client"

import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createVendorSchema } from "../schema"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { z } from "zod"

type VendorFormData = z.infer<typeof createVendorSchema>

export function VendorForm({ onSuccess }: { onSuccess: () => void }) {
    const queryClient = useQueryClient()

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<VendorFormData>({
        resolver: zodResolver(createVendorSchema),
        defaultValues: {
            category: 'catering',
            is_preferred: false
        } as any
    })

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch('/api/vendors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            if (!res.ok) throw new Error('Failed to create vendor')
            return res.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vendors'] })
            toast.success("Vendor added to directory")
            onSuccess()
        },
        onError: () => {
            toast.error("Failed to add vendor")
        }
    })

    const onSubmit = (data: any) => mutation.mutate(data)

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
                <Label htmlFor="vendor_name">Company Name</Label>
                <Input id="vendor_name" {...register('name')} placeholder="e.g. Royal Catering" className="h-11 border-white/10 bg-white/5" />
                {errors.name && <p className="text-xs text-red-500">{errors.name.message as string}</p>}
            </div>

            <div className="space-y-2">
                <Select 
                    label="Category"
                    {...register('category')}
                    options={[
                        { label: 'Catering', value: 'catering' },
                        { label: 'AV & Production', value: 'av_production' },
                        { label: 'Decor', value: 'decor' },
                        { label: 'Photography', value: 'photography' },
                        { label: 'Entertainment', value: 'entertainment' },
                        { label: 'Venue', value: 'venue' },
                        { label: 'Other', value: 'other' }
                    ]}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="contact_name">Contact Person</Label>
                    <Input id="contact_name" {...register('contact_name')} placeholder="Full Name" className="h-11 border-white/10 bg-white/5" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" {...register('phone')} placeholder="+971..." className="h-11 border-white/10 bg-white/5" />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" {...register('email')} placeholder="commercial@vendor.com" className="h-11 border-white/10 bg-white/5" />
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="ghost" onClick={onSuccess} className="h-11 px-6 text-neutral-400">Cancel</Button>
                <Button type="submit" disabled={isSubmitting} className="h-11 px-8 bg-white text-black font-bold hover:bg-neutral-200">
                    {isSubmitting ? 'Saving...' : 'Add Vendor'}
                </Button>
            </div>
        </form>
    )
}
