import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createSupabaseServerClient } from '@/lib/db/supabase-server'

const createExampleSchema = z.object({
    name: z.string().min(1).max(100),
})

export async function GET() {
    try {
        const supabase = await createSupabaseServerClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data, error } = await supabase
            .from('example_items')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ data }, { status: 200 })
    } catch (fatal: unknown) {
        const message = fatal instanceof Error ? fatal.message : 'Internal server error'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const supabase = await createSupabaseServerClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        let body: unknown
        try {
            body = await request.json()
        } catch {
            return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
        }

        const parsed = createExampleSchema.safeParse(body)
        if (!parsed.success) {
            return NextResponse.json({ error: 'Validation failed', details: parsed.error.format() }, { status: 400 })
        }

        const { data, error } = await supabase
            .from('example_items')
            .insert({ name: parsed.data.name })
            .select()
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ data }, { status: 201 })
    } catch (fatal: unknown) {
        const message = fatal instanceof Error ? fatal.message : 'Internal server error'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
