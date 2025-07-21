# 🏆 Competition System Quick Setup

## ❌ Current Issue
The competition page shows "Failed to load divisions" because the database tables don't exist yet.

## ✅ Solution
Run the competition database schema in your Supabase project.

## 🚀 Quick Steps

### 1. Open Supabase Dashboard
- Go to [https://supabase.com](https://supabase.com)
- Open your project dashboard

### 2. Navigate to SQL Editor
- Click on "SQL Editor" in the left sidebar
- Click "New query"

### 3. Run the Competition Schema
- Copy the entire contents of `competition-schema.sql`
- Paste it into the SQL Editor
- Click "Run" to execute

### 4. Verify Setup
- Go to "Table Editor" in the left sidebar
- You should see these new tables:
  - `divisions` (with 3 divisions)
  - `seasons`
  - `season_standings`
  - `competition_races`
  - And many more...

## 🎯 Expected Results

After running the schema, when you visit the Competition page, you should see:

✅ **No more "Failed to load divisions" error**
✅ **3 divisions listed:**
- Division 1 - Elite
- Division 2A - Intermediate  
- Division 2B - Intermediate

✅ **Empty sections for:**
- Seasons (ready to create)
- Upcoming Races (ready to schedule)

## 🔧 If You Still See Errors

1. **Check Supabase Connection**
   - Verify your `.env.local` has correct Supabase URL and key
   - Test connection in browser console

2. **Check Database Permissions**
   - Ensure Row Level Security policies are active
   - Verify your user has proper permissions

3. **Check Browser Console**
   - Look for any JavaScript errors
   - Check network requests to Supabase

## 📞 Need Help?

- Run: `node setup-competition-db.js` for setup instructions
- Check: `SUPABASE_SETUP.md` for general Supabase setup
- Check: `COMPETITION_TODO.md` for next development steps

---

**Once the schema is run, the competition system will be fully functional!** 🎉 