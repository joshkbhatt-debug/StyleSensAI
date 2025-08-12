# Supabase Integration Setup Guide

This guide will help you set up Supabase for document storage in your StyleSensei app.

## 🗄️ Database Setup

### 1. Create the Documents Table

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase-setup.sql`
4. Click **Run** to execute the SQL

This will create:
- `documents` table with proper columns
- Indexes for performance
- Row Level Security (RLS) policies
- Proper permissions

### 2. Verify Table Structure

The `documents` table should have these columns:
- `id` (UUID, Primary Key, Auto-generated)
- `user_id` (UUID, Required)
- `original` (TEXT, Required)
- `rewritten` (TEXT, Required)
- `created_at` (TIMESTAMP, Auto-generated)

## 🔧 Environment Variables

Make sure your `.env.local` file contains:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## 🚀 How to Use

### Frontend Integration

The save functionality is already integrated into your main page. When you:

1. Enter text in the editor
2. Click an action button (e.g., "Make Confident")
3. Get AI-rewritten text
4. Click "Save Document"

The app will automatically save both the original and rewritten text to Supabase.

### API Usage

You can also save documents programmatically:

```typescript
import { saveDocument } from '../utils/documentService';

const result = await saveDocument({
  text: "Original text",
  rewrittenText: "AI-rewritten text", 
  user_id: "user-uuid-here"
});

if (result.success) {
  console.log('Document saved:', result.data);
} else {
  console.error('Save failed:', result.error);
}
```

## 🔒 Security Features

### Row Level Security (RLS)
- Users can only see their own documents
- Users can only insert/update/delete their own documents
- Service role bypasses RLS for admin operations

### Service Role Key Protection
- Service role key is only used server-side
- Never exposed to the frontend
- Used only in API routes

## 🧪 Testing

### Test the API Route

1. Make sure your app is running: `npm run dev`
2. Run the test script: `node test-save-doc.js`
3. Check the console output for success/error messages

### Manual Testing

1. Go to `http://localhost:3000`
2. Enter some text in the editor
3. Click an action button to get AI-rewritten text
4. Click "Save Document"
5. Check your Supabase dashboard to see the saved document

## 🔍 Troubleshooting

### Common Issues

1. **"Missing Supabase environment variables"**
   - Check that all three Supabase env vars are set in `.env.local`
   - Restart your dev server after changing env vars

2. **"Database error: relation 'documents' does not exist"**
   - Run the SQL from `supabase-setup.sql` in your Supabase SQL Editor

3. **"Permission denied"**
   - Check that RLS policies are properly set up
   - Verify the service role key has proper permissions

4. **"Invalid UUID"**
   - Make sure `user_id` is a valid UUID format
   - For testing, use the placeholder UUID provided

### Debug Steps

1. Check browser console for frontend errors
2. Check terminal for server-side errors
3. Check Supabase logs in the dashboard
4. Verify API route is accessible at `/api/save-doc`

## 🔄 Next Steps

### Authentication Integration
Currently using a placeholder `user_id`. To integrate with real authentication:

1. Set up Supabase Auth
2. Get the real user ID from the auth session
3. Replace the placeholder UUID with the actual user ID

### Document Retrieval
Add functionality to:
1. Fetch user's saved documents
2. Display document history
3. Allow editing/deleting saved documents

### Advanced Features
- Document categories/tags
- Search functionality
- Export to different formats
- Document sharing 