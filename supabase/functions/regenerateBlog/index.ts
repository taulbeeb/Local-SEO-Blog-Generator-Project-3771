import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabaseClient.auth.getUser(token)

    if (!user) {
      throw new Error('Unauthorized')
    }

    const { blog_id, client_id } = await req.json()

    // Get client data
    const { data: client, error: clientError } = await supabaseClient
      .from('clients')
      .select('*')
      .eq('id', client_id)
      .eq('user_id', user.id)
      .single()

    if (clientError) throw clientError

    // Get settings for prompt template
    const { data: settings } = await supabaseClient
      .from('settings')
      .select('prompt_template')
      .single()

    const promptTemplate = settings?.prompt_template || `You are an expert SEO content writer. Write a fully optimized local blog for a business that must rank in Google search, the local Map Pack, and AI tools like Gemini, ChatGPT, and Grok. Make sure this is WordPress-ready with the appropriate heading tags and metadata.

The content must:
• Include @Service + @City in headings and copy
• Use natural language to answer real searcher questions
• Include an FAQ section with long-tail questions
• Use bullet points, lists, short paragraphs
• Mention nearby service areas like @Areas
• Include a strong CTA and local trust signals (reviews, experience, etc.)

Target service: @Service
City: @City
Areas: @Areas
Business: @Business
Tone: @Tone`

    // Replace variables in prompt
    const prompt = promptTemplate
      .replace(/@Business/g, client.business_name)
      .replace(/@Service/g, client.service)
      .replace(/@City/g, client.city)
      .replace(/@Areas/g, client.areas?.join(', ') || '')
      .replace(/@Tone/g, client.tone || 'Professional')

    // Call OpenAI
    const openaiApiKey = client.openai_api_key || Deno.env.get('OPENAI_API_KEY')
    
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: prompt + '\n\nPlease generate a completely new and different blog post with fresh content and perspective.'
          }
        ],
        max_tokens: 4000,
        temperature: 0.8,
      }),
    })

    if (!openaiResponse.ok) {
      throw new Error('OpenAI API error')
    }

    const openaiData = await openaiResponse.json()
    const content = openaiData.choices[0].message.content

    // Extract title from content (assuming first H1 tag)
    const titleMatch = content.match(/<h1[^>]*>(.*?)<\/h1>/i)
    const title = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, '') : `${client.service} in ${client.city}`

    // Update existing blog
    const { data: blog, error: blogError } = await supabaseClient
      .from('blogs')
      .update({
        title,
        content,
        created_at: new Date().toISOString()
      })
      .eq('id', blog_id)
      .select()
      .single()

    if (blogError) throw blogError

    return new Response(
      JSON.stringify({ blog }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})