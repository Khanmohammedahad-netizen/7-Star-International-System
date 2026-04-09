"use client"

import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { toast } from "sonner"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"

const clientSchema = z.object({
  name: z.string().min(2, "Name is required"),
  company: z.string().optional().nullable(),
  email: z.string().email("Invalid email").optional().nullable().or(z.literal("")),
  phone: z.string().optional().nullable(),
  country: z.string().default("UAE"),
  notes: z.string().optional().nullable(),
})

type ClientFormData = z.infer<typeof clientSchema>

interface ClientFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function ClientForm({ onSuccess, onCancel }: ClientFormProps) {
  const queryClient = useQueryClient()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: { country: "UAE" }
  })

  const mutation = useMutation({
    mutationFn: async (data: ClientFormData) => {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          email: data.email === '' ? null : data.email,
        })
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to create client')
      }
      return json
    },
    onSuccess: () => {
      toast.success("Client added to directory", {
        description: "The new client profile is now active."
      })
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      onSuccess?.()
    },
    onError: (error: any) => {
      toast.error("Failed to add client", {
        description: error.message || "An unexpected error occurred."
      })
    }
  })

  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name / Account Name <span className="text-red-400">*</span></Label>
        <Input id="name" {...register('name')} placeholder="e.g. John Doe or Alpha Corp" className="h-11 border-white/10 bg-white/5" />
        {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="company">Company (Optional)</Label>
          <Input id="company" {...register('company')} placeholder="Organization name" className="h-11 border-white/10 bg-white/5" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input id="country" {...register('country')} placeholder="UAE" className="h-11 border-white/10 bg-white/5" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" type="email" {...register('email')} placeholder="client@example.com" className="h-11 border-white/10 bg-white/5" />
          {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input id="phone" {...register('phone')} placeholder="+971 50 000 0000" className="h-11 border-white/10 bg-white/5" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea id="notes" {...register('notes')} placeholder="Special requirements, preferred communication method..." rows={3} className="border-white/10 bg-white/5" />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
        <Button type="button" variant="ghost" onClick={onCancel} className="text-neutral-400 hover:text-white">
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || mutation.isPending} className="bg-white text-black font-bold hover:bg-neutral-200 shadow-xl shadow-white/5 disabled:opacity-50">
          {isSubmitting || mutation.isPending ? (
            <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Adding...</span>
          ) : "Register Client"}
        </Button>
      </div>
    </form>
  )
}
