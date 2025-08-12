# StyleSensei Setup Guide

## 🚀 Quick Setup

### 1. Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# OpenAI API Configuration
OPENAI_API_KEY=sk-your_openai_api_key_here

# Anthropic (Claude) API Configuration
ANTHROPIC_API_KEY=sk-ant-your_anthropic_api_key_here

# Google Gemini API Configuration
GEMINI_API_KEY=AIza-your_gemini_api_key_here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Optional: Service role key for admin features
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

## 🔑 Getting API Keys

### OpenAI (GPT-4o)
1. Go to [platform.openai.com](https://platform.openai.com/)
2. Sign up/login and navigate to "API Keys"
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)

### Anthropic (Claude)
1. Go to [console.anthropic.com](https://console.anthropic.com/)
2. Sign up/login and go to "API Keys"
3. Click "Create Key"
4. Copy the key (starts with `sk-ant-`)

### Google Gemini
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the "Generative Language API" in the API Library
4. Go to "Credentials" → "Create Credentials" → "API Key"
5. Copy the key (starts with `AIza...`)
6. **Important**: Set up billing (required for API usage)

### Set Up Supabase
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings > API to get your URL and keys
4. Add them to your `.env.local` file

### Create Database Table

Run this SQL in your Supabase SQL editor:

```sql
-- Create documents table
CREATE TABLE documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  suggestions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Users can view their own documents" ON documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents" ON documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents" ON documents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents" ON documents
  FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_documents_updated_at 
  BEFORE UPDATE ON documents 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
```

### Run the Application

```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see StyleSensei in action!

## 🎯 How to Use Multiple AI Providers

StyleSensei now supports multiple AI providers:

1. **OpenAI GPT-4o** - Most advanced language model
2. **Anthropic Claude** - Safety-focused AI assistant  
3. **Google Gemini** - Google's multimodal AI

To use them:
1. Get API keys for the providers you want to use
2. Add them to your `.env.local` file
3. Select your preferred AI provider in the toolbar
4. Each provider will give slightly different results based on their strengths

## 🔧 Troubleshooting

### Common Issues

1. **"OpenAI API key not found"**
   - Make sure your `.env.local` file exists and has the correct API key
   - Restart your development server after adding environment variables

2. **"Anthropic API key not found"**
   - Verify your Anthropic API key is correct
   - Check that you have sufficient credits in your Anthropic account

3. **"Gemini API key not found"**
   - Ensure your Google Cloud project has billing enabled
   - Verify the Generative Language API is enabled
   - Check that your API key has the correct permissions

4. **"Supabase connection failed"**
   - Verify your Supabase URL and keys are correct
   - Check that your Supabase project is active

5. **"Database table not found"**
   - Run the SQL commands above in your Supabase SQL editor
   - Make sure RLS policies are enabled

6. **Authentication issues**
   - Check that Supabase Auth is enabled in your project
   - Verify your Supabase keys have the correct permissions

### Getting Help

- Check the [README.md](README.md) for more details
- Open an issue on GitHub if you're still having problems
- Join our Discord community for support

## 🎯 Next Steps

Once you have StyleSensei running:

1. **Test the functionality** with different types of text
2. **Try different AI providers** to see which works best for your use case
3. **Customize the tones** by editing `utils/aiProviders.ts`
4. **Deploy to Vercel** for production use
5. **Add your own features** and contribute back!

Happy writing! ✨ 