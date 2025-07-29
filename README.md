# Local-SEO Blog Generator

A production-ready application for generating SEO-optimized blog content for local businesses using Supabase, React, and OpenAI.

## Features

- **Client Management**: Add and manage multiple business clients with their details
- **SEO Blog Generation**: Generate WordPress-ready blog content using OpenAI GPT-4o
- **Customizable Prompts**: Edit prompt templates with variable substitution
- **N8N Integration**: Automatically send generated content to N8N workflows
- **Row-Level Security**: Secure multi-tenant architecture with Supabase RLS
- **Modern UI**: Beautiful, responsive interface built with React and Tailwind CSS

## Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Authentication**: Supabase Auth with email/password
- **AI**: OpenAI GPT-4o for content generation
- **Automation**: N8N webhook integration
- **Icons**: React Icons (Feather)
- **Animations**: Framer Motion

## Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd local-seo-blog-generator
npm install
```

### 2. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the migration script in the Supabase SQL editor:

```sql
-- Copy and paste the contents of supabase/migrations/001_initial_schema.sql
```

3. Deploy the Edge Functions:

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy functions
supabase functions deploy generateBlog
supabase functions deploy regenerateBlog
```

### 3. Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_N8N_WEBHOOK_URL=your_n8n_webhook_url
OPENAI_API_KEY=your_openai_api_key
```

### 4. Run the Application

```bash
npm run dev
```

## Database Schema

### Tables

**clients**
- `id` - UUID primary key
- `user_id` - References auth.users(id)
- `business_name` - Business name
- `service` - Service offered
- `city` - Primary city
- `areas` - Array of service areas
- `tone` - Content tone (Professional, Friendly, etc.)
- `keywords` - Array of SEO keywords
- `openai_api_key` - Optional client-specific API key
- `created_at` - Timestamp

**blogs**
- `id` - UUID primary key
- `client_id` - References clients(id)
- `title` - Blog title
- `content` - Full HTML content
- `keywords` - Array of keywords used
- `status` - 'draft' or 'posted'
- `posted_at` - Timestamp when posted
- `created_at` - Timestamp

**settings**
- `id` - Always 1 (single row)
- `prompt_template` - Customizable prompt template
- `n8n_webhook_url` - N8N webhook URL
- `unlock_api_keys` - Boolean to enable client API key editing

## Features in Detail

### Client Management
- Add/edit business clients with comprehensive details
- Manage service areas and SEO keywords
- Optional client-specific OpenAI API keys

### Blog Generation
- Uses customizable prompt templates with variable substitution
- Variables: @Business, @Service, @City, @Areas, @Tone
- Generates WordPress-ready HTML content
- Automatic title extraction from content

### Settings
- Global prompt template editing
- N8N webhook URL configuration
- Toggle for client API key editing

### Security
- Row-Level Security (RLS) ensures users only see their data
- Encrypted API key storage
- Secure authentication with Supabase Auth

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production

```env
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_supabase_anon_key
VITE_N8N_WEBHOOK_URL=your_production_n8n_webhook_url
OPENAI_API_KEY=your_openai_api_key
```

## API Integration

### OpenAI Integration
- Uses GPT-4o model for high-quality content generation
- Supports both global and client-specific API keys
- Configurable temperature and max tokens

### N8N Integration
- Automatically sends generated blogs to N8N workflows
- Payload includes: blog_id, client_id, title, content
- Configurable webhook URL

## Development

### Project Structure
```
src/
├── components/
│   ├── Auth/          # Authentication components
│   ├── Client/        # Client detail and blog management
│   ├── Dashboard/     # Main dashboard and client cards
│   ├── Layout/        # Header and layout components
│   └── Settings/      # Settings modal
├── contexts/          # React contexts (Auth)
├── lib/              # Utilities (Supabase client)
├── pages/            # Main pages
└── common/           # Shared components (SafeIcon)
```

### Key Components
- **Dashboard**: Main client listing and management
- **ClientDetail**: Individual client view with blog generation
- **BlogList**: Display and manage generated blogs
- **SettingsModal**: Global application settings

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions:
- Check the GitHub issues
- Review the documentation
- Contact the development team

---

Built with ❤️ using React, Supabase, and OpenAI