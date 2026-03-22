import { createSupabaseServerClient } from '@/lib/db/supabase-server'
import type { ExampleItem, CreateExampleInput } from './types'
import type { ServiceResponse } from '@/types/modules'

export async function listExampleItems(organizationId: string): Promise<ServiceResponse<ExampleItem[]>> {
    const supabase = await createSupabaseServerClient()

    const { data, error } = await supabase
        .from('example_items')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })

    if (error) {
        return { data: null, error: error.message }
    }

    return { data: data as ExampleItem[], error: null }
}

export async function createExampleItem(
    organizationId: string,
    input: CreateExampleInput
): Promise<ServiceResponse<ExampleItem>> {
    const supabase = await createSupabaseServerClient()

    const { data, error } = await supabase
        .from('example_items')
        .insert({
            name: input.name,
            organization_id: organizationId,
            status: 'active',
        })
        .select()
        .single()

    if (error) {
        return { data: null, error: error.message }
    }

    return { data: data as ExampleItem, error: null }
}
