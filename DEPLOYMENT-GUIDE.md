# Deployment Guide - Memorial Page

## Quick Start (Node.js Version Issue)

**Important**: This project requires Node.js 18.20.8 or higher. If you're getting a Node.js version error:

1. **Update Node.js**:
   - Visit [nodejs.org](https://nodejs.org) and download the latest LTS version
   - Or use a version manager like `nvm`:
     ```bash
     nvm install 18.20.8
     nvm use 18.20.8
     ```

2. **Alternative: Use Online Deployment**:
   - Deploy directly to Netlify, Vercel, or similar services
   - They will use the correct Node.js version automatically

## Local Development

Once you have the correct Node.js version:

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Deployment Options

### 1. Netlify (Recommended - Free)

1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Click "New site from Git"
4. Connect your GitHub repository
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Deploy!

### 2. Vercel (Free)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Vercel will auto-detect Astro settings
5. Deploy!

### 3. GitHub Pages

1. Push your code to GitHub
2. Go to repository Settings > Pages
3. Set up GitHub Actions workflow:

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - uses: actions/setup-node@v2
      with:
        node-version: '18'
    - run: npm install
    - run: npm run build
    - uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

### 4. Any Static Host

1. Run `npm run build`
2. Upload the `dist/` folder to your web host
3. Point your domain to the uploaded files

## Customization Checklist

Before deploying, make sure to:

- [ ] Replace sample data in `src/pages/index.astro`
- [ ] Add your images to `public/images/`
- [ ] Add your video to `public/videos/`
- [ ] Update donation information
- [ ] Test all links and functionality
- [ ] Update the site title and description
- [ ] Replace favicon with your own

## Domain Setup

After deployment:

1. **Custom Domain**: Most services allow you to add a custom domain
2. **SSL Certificate**: Usually provided automatically
3. **DNS**: Point your domain to the hosting service

## Performance Tips

- Optimize images before uploading (use tools like TinyPNG)
- Keep video files under 100MB
- Test on mobile devices
- Check loading speed with Google PageSpeed Insights

## Support

If you need help with deployment or customization, the memorial page is designed to be beginner-friendly. All the code is well-commented and follows best practices.