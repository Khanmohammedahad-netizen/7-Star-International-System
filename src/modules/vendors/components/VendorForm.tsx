"use client"

import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createVendorSchema } from "../schema"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Loader2, Star } from "lucide-react"
import { z } from "zod"

const VENDOR_CATEGORIES = [
  { label: 'Catering', value: 'catering' },
  { label: 'AV / Tech', value: 'av_tech' },
  { label: 'Décor', value: 'decor' },
  { label: 'Photography', value: 'photography' },
  { label: 'Security', value: 'security' },
  { label: 'Transport', value: 'transport' },
  { label: 'Venue', value: 'venue' },
  { label: 'Entertainment', value: 'entertainment' },
  { label: 'Other', value: 'other' },
]

type VendorFormData = z.infer<typeof createVendorSchema>

export function VendorForm({ onSuccess }: { onSuccess: () => void }) {
    const queryClient = useQueryClient()
    const [rating, setRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)

    const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<VendorFormData>({
        resolver: zodResolver(createVendorSchema),
        defaultValues: {
            category: 'catering',
            rating: 0,
        } as any
    })

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch('/api/vendors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...data,
                    email: data.email === '' ? null : data.email,
                    rating: rating,
                })
            })
            const json = await res.json()
            if (!res.ok || !json.success) {
                throw new Error(json.error || 'Failed to add vendor')
            }
            return json
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vendors'] })
            toast.success("Vendor added to directory", {
                description: "The vendor profile is now active in the 7STAR network."
            })
            onSuccess()
        },
        onError: (error: any) => {
            toast.error("Failed to add vendor", {
                description: error.message || "An unexpected error occurred."
            })
        }
    })

    const onSubmit = (data: any) => mutation.mutate(data)

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
                <Label htmlFor="vendor_name">Vendor / Company Name <span className="text-red-400">*</span></Label>
                <Input id="vendor_name" {...register('name')} placeholder="e.g. Royal Catering Group" className="h-11 border-white/10 bg-white/5" />
                {errors.name && <p className="text-xs text-red-400">{errors.name.message as string}</p>}
            </div>

            <div className="space-y-2">
                <Select 
                    label="Service Category"
                    {...register('category')}
                    options={VENDOR_CATEGORIES}
                />
                {errors.category && <p className="text-xs text-red-400">{errors.category.message as string}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="contact">Contact Person</Label>
                <Input id="contact" {...register('contact')} placeholder="Contact person's name" className="h-11 border-white/10 bg-white/5" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" {...register('email')} placeholder="vendor@email.com" className="h-11 border-white/10 bg-white/5" />
                    {errors.email && <p className="text-xs text-red-400">{errors.email.message as string}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" {...register('phone')} placeholder="+971 50 000 0000" className="h-11 border-white/10 bg-white/5" />
                </div>
            </div>

            {/* Star Rating */}
            <div className="space-y-2">
                <Label>Rating</Label>
                <div className="flex items-center gap-1 py-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => { setRating(star); setValue('rating', star) }}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="transition-transform hover:scale-110 focus:outline-none"
                        >
                            <Star
                                className={`w-7 h-7 transition-colors ${
                                    star <= (hoverRating || rating)
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'fill-transparent text-neutral-600'
                                }`}
                            />
                        </button>
                    ))}
                    {rating > 0 && (
                        <span className="text-sm text-neutral-400 ml-2">{rating}/5</span>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea id="notes" {...register('notes')} placeholder="Special terms, past performance, reliability notes..." rows={3} className="border-white/10 bg-white/5" />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <Button type="button" variant="ghost" onClick={onSuccess} className="h-11 px-6 text-neutral-400">Cancel</Button>
                <Button type="submit" disabled={isSubmitting || mutation.isPending} className="h-11 px-8 bg-white text-black font-bold hover:bg-neutral-200 disabled:opacity-50">
                    {isSubmitting || mutation.isPending ? (
                        <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Adding...</span>
                    ) : 'Add Vendor'}
                </Button>
            </div>
        </form>
    )
}
