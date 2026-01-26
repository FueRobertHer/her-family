# Memorial Page - Astro.js

A beautiful, elegant memorial page built with Astro.js to honor and remember a loved one's life.

## Features

✨ **Elegant Design**: Timeless, classy design with warm color palette  
📅 **Funeral Information**: Complete service details with dates, times, locations, and eulogy speakers  
🎠 **Carousel Gallery**: Auto-scrolling image carousel with infinite loop, touch/swipe support, and drag-and-drop reordering  
🖼️ **Lightbox View**: Full-screen image viewing with keyboard and touch navigation  
🎥 **Video Player**: Custom video player for memorial videos  
💬 **Comments System**: Interactive memory sharing with moderation and optional photo attachments  
💝 **Donation Integration**: Support for Venmo, PayPal, Cash App, and Zelle  
🔐 **Admin Panel**: Secure authentication with comment moderation  
✏️ **Inline Editing**: Edit all content directly on the page with live updates - no separate admin forms  
📊 **Dynamic Content**: All page content stored in database and editable inline  
☁️ **Cloud Image Hosting**: Upload images directly via Cloudinary integration with captions  
🔄 **Drag-and-Drop Reordering**: Admins can reorder gallery images with intuitive drag-and-drop interface  
📱 **Fully Responsive**: Beautiful on all devices  
⚡ **Fast Performance**: Built with Astro.js for optimal loading speeds  

## Getting Started

### Prerequisites

- Node.js 18.20.8 or higher
- npm or yarn

### Installation

1. Clone or download this project
2. Install dependencies:
   ```bash
   npm install
   ```

3. Initialize the database with default content:
   ```bash
   npx astro db push
   npx astro db execute "db/seed.ts"
   ```
   Or visit `http://localhost:4321/setup` after starting the dev server and click "Initialize Memorial Content"

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser to `http://localhost:4321`

The page will now load with sample memorial content that you can edit inline!

### Customization

#### 1. Update Memorial Information

Edit the `memorialData` object in `src/pages/index.astro`:

```javascript
const memorialData = {
  name: "Your Loved One's Name",
  birthDate: "YYYY-MM-DD",
  deathDate: "YYYY-MM-DD",
  mainImage: "/images/portrait.jpg",
  subtitle: "A brief description",
  biography: "Full life story...",
  highlights: ["Achievement 1", "Achievement 2"],
  // ... more data
};
```

#### 2. Add Images

**Recommended: Cloudinary Upload (with Admin Interface)**

For the best experience, set up Cloudinary for cloud-hosted images:

1. Create a free Cloudinary account at [cloudinary.com](https://cloudinary.com)
2. Follow the setup guide in `CLOUDINARY-SETUP.md`
3. Log in at `/admin`
4. **Gallery Images**: Click "Upload New Image" button in the Gallery section
5. **Portrait Image**: Click "Edit Hero" → Upload button next to Portrait Image field
6. Images are automatically optimized and served via CDN!

**Alternative: Local Static Files**

Place your images in the `public/images/` directory:
- `portrait.jpg` - Main portrait for hero section
- Gallery images with any filename (e.g., `gallery1.jpg`, `gallery2.jpg`)
- `video-poster.jpg` - Video thumbnail

Then add them to the database via `/setup` or inline editing.

**Note:** The gallery supports both Cloudinary URLs and local file paths. You can mix and match!

#### 3. Add Video

Place your memorial video in `public/videos/memorial-video.mp4`

#### 4. Configure Funeral Information

Update the service details in the `memorialData.funeralInfo` object:

```javascript
funeralInfo: {
  services: [
    {
      type: "Viewing & Visitation",
      date: "2024-01-15",
      time: "14:00", // 24-hour format
      location: {
        name: "Funeral Home Name",
        address: "123 Address St, City, State ZIP",
        phone: "(555) 123-4567",
        website: "https://website.com"
      },
      description: "Service description",
      dresscode: "Business casual or formal attire"
    }
    // Add more services as needed
  ],
  eulogySpeakers: [
    {
      name: "Speaker Name",
      relationship: "Son/Daughter/Friend",
      time: "11:15" // Optional speaking time
    }
  ],
  receptionInfo: {
    location: "Reception venue",
    time: "Following the service",
    description: "Reception details"
  },
  specialInstructions: "Any special notes for attendees",
  flowersInfo: "Information about flowers or donations in lieu"
}
```

#### 5. Configure Donations

Update the donation information in the `memorialData.donations` object:

```javascript
donations: {
  venmoUsername: "YourVenmoUsername",
  paypalEmail: "your@email.com",
  cashappUsername: "YourCashApp",
  zelleEmail: "your@email.com",
  charityName: "Favorite Charity",
  charityUrl: "https://charity.org/donate"
}
```

#### 6. Comments System

The memorial page includes an interactive comments system where visitors can:
- Share memories and condolences
- Specify their relationship to the deceased
- Leave contact information (optional)
- View approved comments from others

**Features:**
- **Moderation**: All comments require approval before appearing
- **Database Storage**: Uses Astro DB for reliable data storage
- **Responsive Design**: Works beautifully on all devices
- **Character Limits**: Prevents spam with reasonable message limits
- **Real-time Updates**: Dynamic loading and submission

**Database Setup:**
The comments system uses Astro DB. To seed with sample data:
1. Start your development server: `npm run dev`
2. Visit `/api/seed` in your browser (POST request) to add sample comments
3. Comments will appear in the "Memories" section

**Admin Interface:**

**Inline Editing:**
1. Log in at `/admin` with password `memorial2024`
2. Click "✏️ Edit Site Content (Inline)" to go to the home page
3. You'll see an "Edit Mode" indicator in the top-right corner
4. Click the "✏️ Edit" buttons that appear on each section (Hero, Biography, Video, Donations)
5. Edit content in the modal and save changes
6. **Changes appear instantly on the page without reloading!**

**Gallery Management:**
1. **Upload Images**: Click "Upload New Image" button
   - Select an image file
   - Add an optional caption
   - Image is uploaded to Cloudinary and added to the gallery
2. **Reorder Images**: Click "Reorder Images" button
   - Drag and drop images to arrange them in your preferred order
   - Position numbers update in real-time as you drag
   - Click "Save Order" to persist the new arrangement
3. **Delete Images**: Hover over any image in the carousel
   - Click the red trash icon that appears
   - Confirm deletion to remove from gallery
4. **Carousel Features**:
   - Auto-scrolling every 5 seconds
   - Touch/swipe support on mobile
   - Keyboard navigation (arrow keys)
   - Click navigation dots to jump to specific images
   - Click any image for full-screen lightbox view

**Comment Moderation:**
Visit `/admin` to:
- View pending comments awaiting approval
- Approve or reject visitor memories
- See comment statistics dashboard
- Filter between pending, approved, and all comments

**⚠️ Security Note:** Change the admin password in `src/pages/api/admin/login.ts` before deploying to production!

For detailed information about the gallery carousel and reordering features, see [GALLERY-CAROUSEL.md](GALLERY-CAROUSEL.md).

## File Structure

```
src/
├── components/
│   ├── Hero.astro          # Hero section with portrait (inline editable)
│   ├── Biography.astro     # Life story section (inline editable)
│   ├── FuneralInfo.astro   # Funeral services and eulogy information
│   ├── Gallery.astro       # Carousel gallery with drag-and-drop reordering
│   ├── VideoPlayer.astro   # Video player component (inline editable)
│   ├── Comments.astro      # Interactive comments/memories section with photo attachments
│   └── Donations.astro     # Donation options (inline editable)
├── layouts/
│   └── Layout.astro        # Main page layout
├── pages/
│   ├── index.astro         # Main memorial page with inline editing
│   ├── setup.astro         # Database initialization utility
│   ├── admin/
│   │   └── index.astro     # Admin dashboard for comment moderation
│   └── api/
│       ├── comments.ts     # Public comments API
│       ├── content.ts      # Public content API
│       ├── init-content.ts # Initialize memorial content
│       ├── upload-image.ts # Cloudinary image upload
│       ├── delete-image.ts # Cloudinary image deletion
│       ├── gallery/
│       │   ├── add.ts      # Add image to gallery database
│       │   ├── delete.ts   # Delete image from gallery database
│       │   └── update-order.ts # Update gallery image order (reordering)
│       └── admin/
│           ├── login.ts    # Admin authentication
│           ├── comments.ts # Comment moderation API
│           └── content.ts  # Content management API (for inline editing)
└── db/
    ├── config.ts           # Database schema (Comments, MemorialContent, GalleryImages)
    └── seed.ts             # Sample data for development

public/
├── images/                 # Place your images here
├── videos/                 # Place your videos here
└── favicon.svg            # Site icon
```

## Deployment

### Build for Production

```bash
npm run build
```

### Deploy Options

- **Netlify**: Connect your GitHub repo for automatic deployments
- **Vercel**: Import your project for instant deployment
- **GitHub Pages**: Use GitHub Actions for deployment
- **Any Static Host**: Upload the `dist/` folder after building

## Customization Tips

### Colors
The site uses a warm gray color palette. To customize colors, edit `tailwind.config.mjs`:

```javascript
colors: {
  'warm-gray': {
    // Your custom color values
  }
}
```

### Fonts
The site uses Inter and Playfair Display fonts. To change fonts, update the Google Fonts link in `src/layouts/Layout.astro`.

### Sections
You can easily add, remove, or reorder sections by modifying the components in `src/pages/index.astro`.

## Support

This memorial page template is designed to be easy to customize while maintaining a respectful, elegant appearance. The design focuses on:

- **Accessibility**: Proper semantic HTML and ARIA labels
- **Performance**: Optimized images and minimal JavaScript
- **Mobile-First**: Responsive design that works on all devices
- **SEO-Friendly**: Proper meta tags and structured data

## License

This project is open source and available under the MIT License.

---

*Created with love and respect for those we remember.*