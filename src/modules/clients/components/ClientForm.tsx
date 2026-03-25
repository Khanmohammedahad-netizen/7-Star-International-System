"use client"

import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useMutation, useQueryClient } from "@tanstack/react-query"

const clientSchema = z.object({
  name: z.string().min(2, "Name is required"),
  company: z.string().optional().nullable(),
  email: z.string().email("Invalid email").optional().nullable().or(z.literal("")),
  phone: z.string().optional().nullable(),
})

type ClientFormData = z.infer<typeof clientSchema>

interface ClientFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function ClientForm({ onSuccess, onCancel }: ClientFormProps) {
  const queryClient = useQueryClient()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema)
  })

  const mutation = useMutation({
    mutationFn: async (data: ClientFormData) => {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('Failed to create client')
      return res.json()
    },
    onSuccess: () => {
      toast.success("Client added to directory")
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      onSuccess?.()
    },
    onError: (error: any) => {
      toast.error(error.message || "Something went wrong")
    }
  })

  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name / Account Name</Label>
          <Input id="name" {...register('name')} placeholder="e.g. John Doe or Alpha Corp" className="h-11 border-white/10 bg-white/5" />
          {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="company">Company (Optional)</Label>
          <Input id="company" {...register('company')} placeholder="Organization name" className="h-11 border-white/10 bg-white/5" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" {...register('email')} placeholder="client@example.com" className="h-11 border-white/10 bg-white/5" />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" {...register('phone')} placeholder="+971..." className="h-11 border-white/10 bg-white/5" />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
        <Button type="button" variant="ghost" onClick={onCancel} className="text-neutral-400 hover:text-white">
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="bg-white text-black font-bold hover:bg-neutral-200 shadow-xl shadow-white/5 disabled:opacity-50">
          {isSubmitting ? "Adding..." : "Register Client"}
        </Button>
      </div>
    </form>
  )
}
