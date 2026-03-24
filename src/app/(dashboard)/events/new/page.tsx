// @ts-nocheck
"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function NewEventPage() {
  const router = useRouter()

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Event</h1>
        <p className="text-muted-foreground mt-1">Initialize a new event command center.</p>
      </div>

      <div className="border border-dashed rounded-xl p-12 text-center flex flex-col items-center gap-4">
        <p className="text-muted-foreground max-w-sm">Event Creation Form would go here utilizing react-hook-form and the createEventSchema zod validator object.</p>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button onClick={() => router.push('/events')}>Create Skeleton</Button>
        </div>
      </div>
    </div>
  )
}

