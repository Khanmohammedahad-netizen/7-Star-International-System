import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function test() {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/events?id=eq.f4ef5f20-0ede-4480-b742-324bd72d0cdc&select=*,client:clients(name,company)`;
  const res = await fetch(url, {
    headers: {
      apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
    }
  });
  const text = await res.text();
  console.log("STATUS:", res.status);
  console.log("BODY:", text);
}
test();
