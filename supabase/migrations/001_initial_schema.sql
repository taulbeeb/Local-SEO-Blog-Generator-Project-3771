-- Enable Row Level Security
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- Create clients table
CREATE TABLE clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  service TEXT NOT NULL,
  city TEXT NOT NULL,
  areas TEXT[] DEFAULT '{}',
  tone TEXT DEFAULT 'Professional',
  keywords TEXT[] DEFAULT '{}',
  openai_api_key TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create blogs table
CREATE TABLE blogs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  keywords TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'posted')),
  posted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create settings table
CREATE TABLE settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  prompt_template TEXT,
  n8n_webhook_url TEXT,
  unlock_api_keys BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for clients
CREATE POLICY "Users can view their own clients" ON clients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own clients" ON clients
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients" ON clients
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients" ON clients
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for blogs
CREATE POLICY "Users can view blogs for their clients" ON blogs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clients 
      WHERE clients.id = blogs.client_id 
      AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert blogs for their clients" ON blogs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients 
      WHERE clients.id = blogs.client_id 
      AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update blogs for their clients" ON blogs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM clients 
      WHERE clients.id = blogs.client_id 
      AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete blogs for their clients" ON blogs
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM clients 
      WHERE clients.id = blogs.client_id 
      AND clients.user_id = auth.uid()
    )
  );

-- RLS Policies for settings (global read, admin write)
CREATE POLICY "Anyone can read settings" ON settings
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can update settings" ON settings
  FOR ALL USING (auth.role() = 'authenticated');

-- Insert default settings
INSERT INTO settings (id, prompt_template, unlock_api_keys) VALUES (
  1,
  'You are an expert SEO content writer. Write a fully optimized local blog for a business that must rank in Google search, the local Map Pack, and AI tools like Gemini, ChatGPT, and Grok. Make sure this is WordPress-ready with the appropriate heading tags and metadata.

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
Tone: @Tone',
  false
);