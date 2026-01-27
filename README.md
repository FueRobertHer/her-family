# Memorial Page

A memorial page built with Astro.js to honor and remember a loved one's life.

## Features

- ✨ **Elegant Design**: Timeless, classy design with warm color palette
- 📅 **Funeral Information**: Complete service details with dates, times, and locations
- 🎠 **Carousel Gallery**: Auto-scrolling image carousel with infinite loop, touch/swipe support, and drag-and-drop reordering
- 🖼️ **Lightbox View**: Full-screen image viewing with keyboard and touch navigation
- 🎥 **Video Player**: Custom video player for memorial videos
- 💬 **Comments System**: Interactive memory sharing with moderation and optional photo attachments
- 💝 **Donation Integration**: Support for Venmo, Cash App, and Zelle
- 🔐 **Admin Panel**: Secure authentication with comment moderation
- ✏️ **Inline Editing**: Edit all content directly on the page with live updates - no separate admin forms
- ☁️ **Cloud Image Hosting**: Upload images directly via Cloudinary integration with captions
- 🔄 **Drag-and-Drop Reordering**: Admins can reorder gallery images with intuitive drag-and-drop interface
- 📱 **Fully Responsive**: Beautiful on all devices
- ⚡ **Fast Performance**: Built with Astro.js for optimal loading speeds

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
3. Create a `.env` file in your project root with your Cloudinary credentials (see [Configuration](#configuration)):
   ```bash
   touch .env
   ```
4. Initialize the database with default content:

   ```bash
   npx astro db push
   npx astro db execute "db/seed.ts"
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```
6. Open your browser to `http://localhost:4321`

### Development Scripts

```bash
npm run dev            # Start development server
npm run build          # Build for production
npm run preview        # Preview production build
npm run check          # Run TypeScript type checking
npm run lint           # Check code for issues
npm run lint:fix       # Auto-fix linting issues
npm run format         # Format code with Prettier
npm run format:check   # Check formatting without changes
```

### Configuration

#### Cloudinary Setup (Recommended)

This project uses Cloudinary for image hosting, allowing admins to upload images directly through the web interface.

1. Create a free account at [cloudinary.com](https://cloudinary.com).
2. Get your **Cloud Name**, **API Key**, and **API Secret** from the dashboard.
3. Add them to your `.env` file:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

TURSO_DATABASE_URL=your_database_url
TURSO_AUTH_TOKEN=your_auth_token

# These are the same as the TURSO_DATABASE_URL and auth token, but it is used by the Astro DB integration
ASTRO_DB_REMOTE_URL=your_remote_url
ASTRO_DB_APP_TOKEN=your_app_token

# Admin Configuration
ADMIN_PASSWORD=yourpassword
```

> **Note**: The free tier of Cloudinary includes 25GB of storage and bandwidth, which is typically sufficient for a memorial page.

#### Local Images (Alternative)

You can also place images manually in `public/images/` and reference them in the database, but the drag-and-drop upload feature requires Cloudinary.

## Usage

### Admin Interface

Log in at `/admin` (default password: what you set in `.env`).

#### Inline Editing

1. Log in as admin.
2. Click "✏️ Edit Site Content (Inline)" to view the home page in Edit Mode.
3. Click the "✏️ Edit" buttons on any section to modify text, images, or visibility.
4. Changes are saved instantly.

#### Gallery Management

1. **Upload**: Click "Upload New Image" in the Gallery section. Images are optimized by Cloudinary.
2. **Reorder**: Click "Reorder Images" to drag and drop images into your preferred order.
3. **Delete**: Hover over an image and click the red trash icon.

#### Comment Moderation

Visit `/admin` to approve or reject memories shared by visitors.

## Deployment

### Vercel

1. Push your code to GitHub.
2. Import the project in Vercel.
3. Add the Environment Variables (`CLOUDINARY_...`, `ADMIN_PASSWORD`) in Vercel Project Settings.
4. Deploy!

### Other Static Hosts

Run `npm run build` to generate the `dist/` folder and upload it to any static host (Netlify, GitHub Pages, etc.).
**Important**: Dynamic features like Comments and Admin Panel require a backend (SSR), so Vercel or similar adapter-supported platforms are strongly recommended.

## Technical Details

- **Framework**: Astro.js
- **Styling**: Tailwind CSS
- **Database**: Astro DB (LibSQL/SQLite) via Turso
- **Image CDN**: Cloudinary
- **Deployment**: Vercel (Server output)

### File Structure

```
src/
├── components/     # UI Components (Hero, Gallery, etc.)
├── layouts/        # Page layouts
├── pages/
│   ├── admin/      # Admin dashboard
│   ├── api/        # API endpoints
│   └── index.astro # Main page
└── scripts/        # Client-side scripts (Gallery, Admin)

db/                 # Database config & seed
```

## Troubleshooting

- **Upload Failed**: Check that your `.env` file exists and contains the correct Cloudinary credentials. If deploying, ensure Environment Variables are set in your host dashboard.
- **Images Not Loading**: Ensure your `CLOUDINARY_CLOUD_NAME` is correct.
- **Node Version Error**: This project requires Node.js 18.20.8+. If you see version errors, use `nvm install 18` or update your Node version.
- **"Unauthorized" Error**: Make sure you are logged in at `/admin` before trying to upload or edit content.
- **Changes Not Appearing**: Try a hard refresh (Ctrl+Shift+R or Cmd+Shift+R) to clear browser cache.

## License

This project is open source and available under the MIT License.
