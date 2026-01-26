# Cloudinary Image Hosting Setup Guide

This memorial page now uses **Cloudinary** for image hosting, allowing admins to upload images directly through the web interface!

## 🎯 What Changed

### Before (Static Files):
- Images stored in `/public/images/` folder
- Manual file management via FTP/Git
- No upload interface

### After (Cloudinary):
- Images hosted on Cloudinary's CDN
- Admin upload interface for gallery and portrait
- Automatic image optimization
- 25GB free storage

---

## 📋 Setup Steps

### 1. Create a Free Cloudinary Account

1. Go to [cloudinary.com](https://cloudinary.com)
2. Click "Sign Up Free"
3. Create your account (no credit card required)
4. Confirm your email

### 2. Get Your API Credentials

After logging in:

1. Go to your **Dashboard**
2. Find the "Product Environment Credentials" section
3. You'll see three values:
   - `Cloud Name`
   - `API Key`
   - `API Secret`

### 3. Add Credentials to Your Project

Create a `.env` file in your project root (if it doesn't exist):

```bash
# In your project folder: /Users/fher/atlassian/repo/her-family/
touch .env
```

Add these lines to `.env`:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here

# Admin Configuration (your existing password)
ADMIN_PASSWORD=yourpassword
```

**Important**: Replace the placeholder values with your actual credentials from Cloudinary dashboard!

### 4. Deploy to Vercel with Environment Variables

When deploying to Vercel:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `ADMIN_PASSWORD`
4. Click "Save" for each one
5. **Redeploy** your site for changes to take effect

---

## ✨ How to Use

### Upload Gallery Images

1. **Log in** as admin at `/admin`
2. Go to the home page
3. Scroll to the **Gallery** section
4. Click **"Upload New Image"** button
5. Select an image from your computer
6. Wait for upload (Cloudinary automatically optimizes!)
7. Page refreshes with new image added

### Delete Gallery Images

1. While logged in as admin
2. Hover over any gallery image
3. Click the **red delete button** that appears
4. Confirm deletion
5. Image removed from both Cloudinary and database

### Change Hero Portrait

1. **Log in** as admin
2. Click **"✏️ Edit Hero"** button at top
3. Find the **"Portrait Image"** field
4. Click **"Upload"** button next to it
5. Select your new portrait photo
6. Wait for upload
7. Click **"Save Changes"**
8. Portrait updates instantly!

---

## 🔧 Technical Details

### Image Optimization

Cloudinary automatically:
- Resizes large images (max 2000x2000px)
- Optimizes quality for web
- Converts to WebP when supported
- Serves via global CDN

### Storage Limits (Free Tier)

- **Storage**: 25 GB
- **Bandwidth**: 25 GB/month
- **Transformations**: 25,000/month

This is more than enough for most memorial pages!

### URL Format

Uploaded images are stored with URLs like:
```
https://res.cloudinary.com/your-cloud-name/image/upload/memorial/gallery/abc123.jpg
```

### Folders Structure

Images are organized in Cloudinary:
- `memorial/portraits/` - Hero portrait images
- `memorial/gallery/` - Gallery photos

---

## 🐛 Troubleshooting

### "Unauthorized" Error When Uploading

**Problem**: Not logged in as admin  
**Solution**: Go to `/admin` and log in first

### "Upload Failed" Error

**Problem**: Missing or incorrect Cloudinary credentials  
**Solution**:
1. Check `.env` file has correct values
2. Verify credentials in Cloudinary dashboard
3. Restart dev server: `npm run dev`

### Images Don't Display After Upload

**Problem**: Browser cache or page not refreshed  
**Solution**: 
1. Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
2. Clear browser cache
3. Check browser console for errors

### Vercel Deployment Upload Not Working

**Problem**: Environment variables not set in Vercel  
**Solution**:
1. Go to Vercel project → Settings → Environment Variables
2. Add all three Cloudinary variables
3. **Redeploy** the site

---

## 📊 Migration Strategy

### If You Have Existing Images

You have two options:

#### Option A: Keep Static Images (Hybrid)
- Existing images in `/public/images/` continue to work
- New uploads go to Cloudinary
- Gallery supports both local and Cloudinary URLs

#### Option B: Migrate Everything to Cloudinary
1. Log in as admin
2. Upload each existing image via the gallery
3. Old images remain as backup in `/public/images/`
4. Database now points to Cloudinary URLs

---

## 💰 Cost Considerations

### Free Forever
- Small memorial sites (< 100 images)
- Low traffic (< 1000 visitors/month)
- **Free tier is sufficient!**

### Upgrade Needed If:
- 1000+ images
- 10,000+ monthly visitors
- Advanced features (video hosting, etc.)

**Pro Tier**: $99/month (100GB storage, 100GB bandwidth)

---

## 🔐 Security Notes

- `.env` file is **NOT** committed to Git (protected by `.gitignore`)
- API credentials should **never** be shared publicly
- Admin authentication required for all uploads
- Cloudinary URLs are public but hard to guess

---

## 📚 Additional Resources

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Astro Environment Variables](https://docs.astro.build/en/guides/environment-variables/)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

## ✅ Quick Checklist

- [ ] Created Cloudinary account
- [ ] Got API credentials from dashboard
- [ ] Added credentials to `.env` file locally
- [ ] Tested upload in dev environment (`npm run dev`)
- [ ] Added environment variables to Vercel
- [ ] Deployed and tested on production
- [ ] Uploaded test images successfully

---

**Need Help?** Check the browser console (F12) for detailed error messages!
