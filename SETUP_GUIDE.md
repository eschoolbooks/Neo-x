# Neo-X Setup Guide

## Prerequisites
- Node.js (v18 or later)
- npm or yarn
- Supabase account
- Google Gemini API key

## Installation Steps

### 1. Install Dependencies
```bash
npm install
```

This will install:
- `@supabase/supabase-js` - Supabase client library
- `@supabase/ssr` - Server-side rendering support
- `@google/generative-ai` - Gemini 2.5 Flash API
- `pdf-parse` - PDF text extraction
- All other existing dependencies

### 2. Set Up Supabase

#### Create a Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your **Project URL** and **Anon Key**

#### Run Database Migration
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `src/database/supabase-schema.sql`
4. Paste and run it in the SQL Editor
5. Verify all tables are created successfully

#### Set Up Storage
1. Go to **Storage** in Supabase dashboard
2. Create a new bucket named `question-papers`
3. Set it to **Private** (users can only access their own files)
4. Add storage policies:

```sql
-- Allow users to upload their own files
CREATE POLICY "Users can upload their own question papers"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'question-papers' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow users to read their own files
CREATE POLICY "Users can read their own question papers"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'question-papers' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own question papers"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'question-papers' AND (storage.foldername(name))[1] = auth.uid()::text);
```

#### Enable Authentication Providers
1. Go to **Authentication** > **Providers**
2. Enable **Email** provider
3. Enable **Google** provider (optional, requires Google OAuth setup)

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
# Copy from .env.example
cp .env.example .env.local
```

Update `.env.local` with your actual values:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Gemini AI
GOOGLE_GEMINI_API_KEY=your-gemini-api-key

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Neo X

# Optional
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

**Get Supabase Keys:**
- Project URL: Found in **Settings** > **API**
- Anon Key: Found in **Settings** > **API** (under "Project API keys")
- Service Role Key: Found in **Settings** > **API** (⚠️ Keep this secret!)

**Get Gemini API Key:**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy and paste it into your `.env.local`

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Migration from Firebase

### Data Migration (Optional)

If you want to migrate existing data from Firebase:

1. **Export Firebase Data:**
   - Go to Firebase Console > Firestore Database
   - Export your collections
   - Download as JSON

2. **Import to Supabase:**
   - Create a migration script (we can help with this)
   - Transform Firebase data to match Supabase schema
   - Import using Supabase client

### Auth Migration

Users will need to re-register with Supabase Auth. Options:
1. **Fresh Start**: All users create new accounts
2. **Email Migration**: Send users migration emails to create new accounts

## Testing

### Test Authentication
1. Go to `/auth`
2. Create a new account
3. Verify email (check Supabase Auth logs)
4. Sign in

### Test Question Upload
1. Sign in
2. Go to `/upload-qn`
3. Upload a sample PDF question paper
4. Verify it appears in Supabase Storage

### Test Prediction
1. Upload 2-3 question papers
2. Go to `/ai-hub`
3. Select exam type and subject
4. Generate prediction
5. View results

## Troubleshooting

### "Supabase URL is not configured"
- Check that `.env.local` exists and has correct values
- Restart dev server after changing environment variables

### "Failed to upload file"
- Verify storage bucket `question-papers` exists
- Check storage policies are correctly set
- Ensure file is PDF and under 15MB

### "AI service authentication failed"
- Verify `GOOGLE_GEMINI_API_KEY` is correct
- Check API quota in Google AI Studio
- Ensure you're using a valid Gemini 2.5 Flash API key

### Database Errors
- Verify schema migration ran successfully
- Check RLS policies are enabled
- View Supabase logs for detailed errors

## Next Steps

1. ✅ Install dependencies
2. ✅ Set up Supabase project and database
3. ✅ Configure environment variables
4. ✅ Run development server
5. ⏭️ Test authentication flow
6. ⏭️ Test question upload and prediction
7. ⏭️ Customize UI/UX (if needed)
8. ⏭️ Deploy to production

## Deployment

When ready to deploy:

1. Update `NEXT_PUBLIC_APP_URL` to production URL
2. Add environment variables to your hosting platform
3. Build and deploy:
   ```bash
   npm run build
   npm start
   ```

Recommended platforms:
- Vercel (easiest for Next.js)
- Netlify
- AWS Amplify
- Your own server

Need help? Check the implementation plan or ask for assistance!
