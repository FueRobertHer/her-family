# Gallery Carousel & Reordering Feature

## Overview
The gallery has been updated with a modern carousel display with infinite scrolling and drag-and-drop reordering functionality for admins.

## Features

### 1. **Carousel Display**
- **Infinite Auto-Scroll**: Gallery automatically advances every 5 seconds
- **Touch/Swipe Support**: Swipe left/right on mobile devices
- **Keyboard Navigation**: Use arrow keys to navigate (Left/Right)
- **Navigation Dots**: Click dots below the carousel to jump to specific images
- **Previous/Next Buttons**: Large, easy-to-click arrow buttons on each side
- **Pause on Hover**: Auto-scroll pauses when you hover over the carousel
- **Responsive**: Shows 1-4 images at a time depending on screen size:
  - Mobile: 1 image
  - Tablet: 2 images
  - Desktop: 3 images
  - Large screens: 4 images

### 2. **Lightbox View**
- Click any image to open full-screen lightbox
- Navigate between images using arrow buttons or keyboard
- Close with X button, Escape key, or clicking outside
- Displays image captions

### 3. **Admin Reordering** (Admin only)
- **Reorder Button**: Click "Reorder Images" in the admin toolbar
- **Drag & Drop Interface**: 
  - Drag images to rearrange them
  - Visual feedback shows which image you're moving
  - Position numbers update in real-time
- **Save Changes**: Click "Save Order" to persist the new arrangement
- **Cancel**: Close without saving to keep original order

### 4. **Image Upload** (Admin only)
- Click "Upload New Image" button
- Select image file
- Enter optional caption in modal
- Image uploaded to Cloudinary and added to gallery
- Page automatically refreshes to show new image

### 5. **Image Deletion** (Admin only)
- Hover over any image in the carousel
- Click the red trash icon that appears
- Confirm deletion
- Image removed from Cloudinary and database
- Page refreshes automatically

## Technical Implementation

### Files Modified
- **`src/components/Gallery.astro`**: Complete rewrite with carousel structure
  - Replaced grid layout with carousel track
  - Added prev/next navigation buttons
  - Added dot indicators
  - Added reorder modal UI
  - Updated JavaScript for carousel, lightbox, upload, delete, and reorder functionality

### Files Created
- **`src/pages/api/gallery/update-order.ts`**: New API endpoint
  - Accepts `imagePath` and `displayOrder`
  - Updates gallery image order in database
  - Admin authentication required

### Carousel Structure
```html
<div class="carousel-container">
  <button id="carouselPrev">←</button>
  <button id="carouselNext">→</button>
  
  <div class="carousel-track">
    <!-- Images slide horizontally -->
    <div class="carousel-item">...</div>
    <div class="carousel-item">...</div>
    ...
  </div>
  
  <div class="carousel-dots">
    <button class="dot"></button>
    ...
  </div>
</div>
```

### Reorder Modal Structure
```html
<div id="reorderModal">
  <div id="reorderList">
    <!-- Grid of draggable images -->
    <div class="reorder-item" draggable="true">
      <img src="..." />
      <div class="position-badge">1</div>
    </div>
    ...
  </div>
  <button id="saveReorderBtn">Save Order</button>
  <button id="cancelReorderBtn">Cancel</button>
</div>
```

## How Reordering Works

1. **Open Modal**: Admin clicks "Reorder Images" button
2. **Display Current Order**: Modal shows all images in current order with position numbers (1, 2, 3...)
3. **Drag to Reorder**: Admin drags images to new positions
   - Drag events: `dragstart`, `dragover`, `drop`, `dragend`
   - Visual feedback with opacity and ring highlights
   - Position numbers update in real-time
4. **Save**: Click "Save Order" to send updates to API
   - API endpoint: `/api/gallery/update-order`
   - Sends each image's new `displayOrder` value
   - Uses "clear and re-insert" strategy to avoid SQLite binding issues
5. **Refresh**: Page reloads to show new order

## API Endpoint Details

### POST `/api/gallery/update-order`

**Request Body:**
```json
{
  "imagePath": "https://res.cloudinary.com/.../image.jpg",
  "displayOrder": 3
}
```

**Response:**
```json
{
  "success": true,
  "message": "Display order updated successfully"
}
```

**Authentication**: Requires `admin_auth` cookie

**Implementation Strategy**: 
- Fetches all gallery images
- Updates the specific image's `displayOrder` in memory
- Deletes all records from `GalleryImages` table
- Re-inserts all images with updated data
- This avoids SQLite WHERE clause binding issues

## Usage Instructions

### For Visitors
1. View the carousel - images auto-advance
2. Use arrows or dots to navigate manually
3. Swipe on mobile devices
4. Click any image to view full-screen
5. Use keyboard arrows to navigate in lightbox

### For Admins
1. **Log in** at `/admin`
2. **Enable Edit Mode** using the toggle in the purple admin toolbar
3. **Upload Images**:
   - Click "Upload New Image"
   - Select file
   - Add optional caption
   - Wait for upload and refresh
4. **Reorder Images**:
   - Click "Reorder Images"
   - Drag images to desired positions
   - Click "Save Order"
   - Wait for update and refresh
5. **Delete Images**:
   - Hover over image in carousel
   - Click red trash icon
   - Confirm deletion
   - Wait for deletion and refresh

## Performance Considerations

- **Lazy Loading**: Images use `loading="lazy"` attribute
- **Auto-play Interval**: 5 seconds (configurable in code)
- **Smooth Transitions**: CSS transitions with `duration-500 ease-out`
- **Touch Optimization**: Minimum swipe distance of 50px to prevent accidental navigation
- **Database Efficiency**: Single query fetches all images, sorted by `displayOrder`

## Future Enhancements (Not Implemented)

- Batch reordering (save all at once instead of individual requests)
- Image cropping/editing before upload
- Bulk delete
- Drag-and-drop upload
- Image metadata editing (captions, alt text)
- Animation effects between slides
- Thumbnail preview for reordering
