# Quick Start Guide - Cloudinary Integration

## ⚡ Fast Setup (5 minutes)

### 1. Install Dependencies ✅
Already done! Cloudinary SDK is installed.

### 2. Get Cloudinary Credentials

1. Sign up at [cloudinary.com](https://cloudinary.com) (FREE, no credit card)
2. After login, copy from Dashboard:
   - Cloud Name
   - API Key
   - API Secret

### 3. Create `.env` File

In your project root, create a file named `.env`:

```env
CLOUDINARY_CLOUD_NAME=paste_your_cloud_name
CLOUDINARY_API_KEY=paste_your_api_key
CLOUDINARY_API_SECRET=paste_your_api_secret
ADMIN_PASSWORD=yourpassword
```

### 4. Test Locally

```bash
npm run dev
```

1. Go to `http://localhost:4321/admin`
2. Log in with your password
3. Go back to home page
4. Try uploading an image!

### 5. Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add Environment Variables in Vercel Dashboard:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `ADMIN_PASSWORD`
4. Deploy!

## 🎉 Done!

You can now:
- ✅ Upload gallery images directly through the web interface
- ✅ Change the hero portrait with one click
- ✅ Delete unwanted images
- ✅ Images automatically optimized and served via CDN

## 📚 More Details

See `CLOUDINARY-SETUP.md` for complete documentation.

---

**Free Tier Limits:**
- 25 GB storage
- 25 GB bandwidth/month
- Perfect for memorial pages!
