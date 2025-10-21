# PeerMetals Video Reels

Automated video reel generation for PeerMetals listings using Remotion and deployed on Vercel with Fluid Compute.

## Features

- **26-second Instagram Reels** (1080x1920, 9:16 format)
- **6 Dynamic Scenes:**
  1. Dramatic intro with zoom effect
  2. Product showcase with Ken Burns effect
  3. Split-screen gallery
  4. Animated specifications cards
  5. "Why Choose PeerMetals" benefits
  6. Call-to-action with "SHOP NOW"
- **AI-Generated Descriptions** using Google Gemini
- **Automated Rendering** via Vercel serverless functions
- **Supabase Integration** for storage and webhooks
- **Background Music** and animations

## Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Preview in Remotion Studio
npm run preview

# Test render locally
npm run test:render

# Run Vercel dev server
npm run dev
```

### Deploy to Vercel

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

Quick deploy:
```bash
vercel --prod
```

## Project Structure

```
videoreels/
├── api/
│   └── render-video.js       # Vercel serverless function
├── src/
│   ├── compositions/
│   │   └── ListingReel.jsx   # Main video composition
│   ├── utils/
│   │   └── generateDescription.js  # AI description generator
│   ├── index.js              # Remotion entry point
│   └── Root.jsx              # Remotion root component
├── public/
│   └── genvideo.mp3          # Background music
├── webhook/
│   └── route.js              # Supabase webhook handler
├── test-render.js            # Local testing script
├── vercel.json               # Vercel configuration
├── remotion.config.js        # Remotion settings
└── package.json
```

## API Usage

### POST /api/render-video

Generate a video for a listing:

```bash
curl -X POST https://your-project.vercel.app/api/render-video \\
  -H "Content-Type: application/json" \\
  -d '{"listingId": "your-listing-id"}'
```

Response:
```json
{
  "success": true,
  "videoUrl": "https://storage-url.com/video.mp4",
  "listingId": "listing-id",
  "renderTime": "45.23"
}
```

## Environment Variables

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_APP_URL=https://peermetals.com
```

## Video Specifications

- **Duration:** 26 seconds (780 frames at 30fps)
- **Resolution:** 1080x1920 (9:16 aspect ratio)
- **Format:** MP4 (H.264)
- **Audio:** Background music included
- **File Size:** ~5-10 MB (CRF 28)

## Deployment

**Requirements:**
- Vercel Pro plan ($20/month) for Fluid Compute
- Supabase project with storage
- Google Gemini API key (optional)

**Fluid Compute:**
- Max duration: 15 minutes
- Memory: 3GB
- Concurrency: 100% CPU

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full deployment guide.

## Performance

- **Average render time:** 30-60 seconds
- **Bundle size:** ~50 MB
- **Memory usage:** ~1-2 GB
- **Concurrent renders:** Limited by Vercel plan

## Customization

### Change Video Duration

Edit `src/Root.jsx`:
```jsx
durationInFrames={780} // 26 seconds at 30fps
```

### Modify Scenes

Edit `src/compositions/ListingReel.jsx` to adjust:
- Scene timing and transitions
- Colors and fonts
- Animations and effects
- Text content

### Update Background Music

Replace `public/genvideo.mp3` with your audio file.

### Adjust Render Quality

Edit `remotion.config.js`:
```js
Config.setCrf(23); // Lower = higher quality, slower render
```

## Troubleshooting

**Video not rendering:**
- Check Vercel logs: `vercel logs`
- Ensure Fluid Compute is enabled (Pro plan)
- Verify environment variables

**Timeout errors:**
- Increase `maxDuration` in `vercel.json`
- Reduce video complexity or duration

**Upload failed:**
- Check Supabase storage permissions
- Verify service role key

**Memory limit:**
- Increase `memory` in `vercel.json`
- Reduce concurrency in render settings

## Scripts

```bash
npm run preview        # Open Remotion Studio
npm run test:render    # Test render locally
npm run dev           # Run Vercel dev server
npm run render        # Render video via CLI
npm run render:still  # Render thumbnail image
```

## Technologies

- **[Remotion](https://remotion.dev)** - Video generation
- **[Vercel](https://vercel.com)** - Serverless hosting
- **[Supabase](https://supabase.com)** - Database & storage
- **[Google Gemini](https://ai.google.dev)** - AI descriptions
- **React** - UI components

## License

Private - PeerMetals

## Support

For issues or questions, check:
- [DEPLOYMENT.md](./DEPLOYMENT.md)
- Vercel logs
- Remotion documentation
