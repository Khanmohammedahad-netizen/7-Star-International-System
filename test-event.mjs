import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function test() {
  const { data, error } = await supabase
    .from('events')
    .select('*, client:clients(name, company)')
    .eq('id', 'f4ef5f20-0ede-4480-b742-324bd72d0cdc')

  console.log("DATA:", data)
  console.log("ERR:", error)
}
test()
