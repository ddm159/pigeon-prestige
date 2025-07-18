# Supabase Setup Guide for Pigeon Racing Game

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project name: `pigeon-racing-game`
5. Set a database password (save this!)
6. Choose a region close to your users
7. Click "Create new project"

## Step 2: Get Your Project Credentials

1. Go to **Settings → API** in your Supabase dashboard
2. Copy these values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **Anon (public) key** (starts with `eyJ...`)
   - **Service role key** (keep this secret!)

## Step 3: Set Up Environment Variables

Create a `.env.local` file in your project root:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: For server-side operations (keep secret!)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Replace the values with your actual Supabase credentials!**

## Step 4: Set Up Database Schema

1. Go to **SQL Editor** in your Supabase dashboard
2. Copy the entire contents of `database-schema.sql`
3. Paste it into the SQL Editor
4. Click "Run" to execute the schema

This will create:
- ✅ Users table with authentication
- ✅ Pigeons table with all stats
- ✅ Races and race participants tables
- ✅ Breeding pairs table
- ✅ Market listings table
- ✅ Transactions table
- ✅ Row Level Security (RLS) policies
- ✅ Automatic triggers and functions

## Step 5: Configure Authentication

1. Go to **Authentication → Settings** in Supabase
2. Configure your site URL (for development: `http://localhost:5173`)
3. Add redirect URLs:
   - `http://localhost:5173/auth/callback`
   - `http://localhost:5173/`
4. Save settings

## Step 6: Test Your Connection

Run your development server:

```bash
npm run dev
```

You should see:
- ✅ No console warnings about missing environment variables
- ✅ Authentication working in your app
- ✅ Database operations working

## Step 7: Verify Database Tables

Go to **Table Editor** in Supabase and verify these tables exist:
- `users`
- `pigeons`
- `races`
- `race_participants`
- `breeding_pairs`
- `market_listings`
- `transactions`

## Step 8: Test Authentication Flow

1. Try signing up a new user
2. Check that a user profile is automatically created
3. Try signing in with the new user
4. Verify the user can access their data

## Troubleshooting

### Common Issues:

**1. "Invalid API key" error**
- Check your environment variables are set correctly
- Restart your development server after changing `.env.local`

**2. "Table doesn't exist" error**
- Make sure you ran the SQL schema in Step 4
- Check the SQL Editor for any errors

**3. Authentication not working**
- Verify your site URL and redirect URLs in Auth settings
- Check that RLS policies are enabled

**4. CORS errors**
- Add your localhost URL to the allowed origins in Supabase settings

### Environment Variables Not Loading?

Make sure your `.env.local` file:
- Is in the project root (same level as `package.json`)
- Has no spaces around the `=` sign
- Has no quotes around values
- Is named exactly `.env.local`

### Database Connection Issues?

1. Check your Supabase project is active (not paused)
2. Verify your database password is correct
3. Check your region selection
4. Ensure your IP is not blocked

## Security Best Practices

1. **Never commit `.env.local` to git** (it's already in `.gitignore`)
2. **Use RLS policies** (already set up in the schema)
3. **Validate data on both client and server**
4. **Use prepared statements** (Supabase handles this automatically)
5. **Regularly rotate your service role key**

## Production Deployment

When deploying to production:

1. Update your environment variables with production values
2. Set your production domain in Supabase Auth settings
3. Configure your hosting provider's environment variables
4. Test authentication flow in production

## Next Steps

Your Supabase setup is now complete! You can:

1. Start building your game features
2. Add more complex queries
3. Set up real-time subscriptions
4. Add file storage for pigeon images
5. Implement advanced security features

## Support

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [GitHub Issues](https://github.com/supabase/supabase/issues) 