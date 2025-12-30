# Photo Upload Feature - User Guide

## What Changed

### 1. Photo Cleanup ✅
- Ran cleanup script that reduced existing property photos:
  - **Ravensdale**: 7 → 1 photo
  - **Maple Valley**: 18 → 3 photos (will be reduced to 1 when you upload)

### 2. Single Photo Per Property ✅
- Each property now stores **exactly 1 photo**
- When you upload a new photo, it replaces the existing one
- Button text changes:
  - **"+ Add Photo"** when no photo exists
  - **"Change Photo"** when a photo is already present

### 3. File Upload from Hard Drive ✅
Upload images directly from your computer with a simple click.

## How to Add Photos to Your Properties

### For Each Property:

1. **Find the property** in your portfolio (either Primary Residence or Rental Properties section)

2. **Look for the button** below the property image (top-right of each card):
   - Shows **"+ Add Photo"** if no photo exists
   - Shows **"Change Photo"** if photo already exists

3. **Click the button**
   - Your system's file picker will open automatically
   
4. **Select an image file from your computer**
   - Supported formats: JPG, PNG, GIF, WebP, etc.
   - Maximum file size: **5MB**
   
5. **The photo uploads and replaces any existing photo**
   - The page will refresh and show your new photo
   - You'll see a success message: "Photo added successfully!"

### Photo Storage

- Photos are stored as **base64-encoded data URLs** directly in the database
- No external image hosting required
- Works offline once loaded
- Each property stores **exactly 1 photo** (replacing any previous photo)
- Perfect for portfolio display without clutter

### File Size Limits

- **Maximum file size: 5MB per photo**
- If your photo is too large, you'll see an error message
- To reduce file size:
  - Use JPG format instead of PNG for photos
  - Resize large images before uploading
  - Use image compression tools

### Recommended Photo Dimensions

For best display:
- **Minimum**: 640x480 pixels
- **Recommended**: 1024x768 pixels
- **Maximum**: 1920x1440 pixels (will be resized by browser)

## Cash Flow Calculations

**Important**: Cash flow calculations now correctly exclude the Primary Residence:
- **Monthly Rental Income**: Only from rental properties
- **Monthly Expenses**: Only rental property mortgages
- **Total Equity**: Includes both primary residence AND rental properties

This gives you accurate rental portfolio performance metrics.

## Technical Details

### API Endpoint

For programmatic access:
```
POST /api/properties/upload-photo
Content-Type: multipart/form-data
Body: {
  "propertyId": "property-id-here",
  "file": <File object>
}
```

### Storage Format

Photos are converted to base64 data URLs:
```
data:image/jpeg;base64,/9j/4AAQSkZJRg...
```

This allows:
- Direct embedding in HTML
- No external dependencies
- Reliable offline access
- Simple database storage
- Single photo per property (replaces on upload)

## Next Steps

Add photos to your properties:
1. Visit each property in your portfolio
2. Click **"+ Add Photo"** (or **"Change Photo"** if one exists)
3. Select a photo from your computer
4. Your property will now display with a professional photo!

Each property looks best with one high-quality main photo.
