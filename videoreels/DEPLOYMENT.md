# Deploying PeerMetals Video Reels to Vercel

This guide explains how to deploy the video reel generation system to Vercel using **Fluid Compute** for extended rendering times.

## Prerequisites

- Vercel account (Pro plan required for Fluid Compute)
- GitHub repository connected to Vercel
- Supabase project with storage bucket
- Google Gemini API key (optional, for AI descriptions)

## Environment Variables

Create these environment variables in your Vercel project settings:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Google Gemini AI (optional)
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key

# App URL (optional)
NEXT_PUBLIC_APP_URL=https://peermetals.com
```

## Deployment Steps

### 1. Install Vercel CLI (Optional - for local testing)

```bash
npm install -g vercel
```

### 2. Deploy to Vercel

#### Option A: Deploy via GitHub (Recommended)

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Add video reel generation with Fluid Compute"
   git push origin main
   ```

2. Import project in Vercel Dashboard:
   - Go to https://vercel.com/new
   - Select your GitHub repository
   - Set **Root Directory** to: `videoreels`
   - Add environment variables
   - Click "Deploy"

#### Option B: Deploy via CLI

```bash
cd videoreels
vercel --prod
```

### 3. Enable Fluid Compute

Fluid Compute is automatically enabled for functions configured with `maxDuration > 60` seconds.

Our `vercel.json` configuration:
```json
{
  "functions": {
    "api/render-video.js": {
      "maxDuration": 900,    // 15 minutes
      "memory": 3008         // 3GB RAM
    }
  }
}
```

**Note:** Fluid Compute requires a Vercel Pro plan ($20/month).

### 4. Test the Deployment

Test the API endpoint:

```bash
curl -X POST https://your-project.vercel.app/api/render-video \\
  -H "Content-Type: application/json" \\
  -d '{
    "listingId": "your-listing-id"
  }'
```

Or test with listing data directly:

```bash
curl -X POST https://your-project.vercel.app/api/render-video \\
  -H "Content-Type: application/json" \\
  -d '{
    "listingData": {
      "id": "test-123",
      "title": "1oz Gold Eagle",
      "description": "Beautiful gold coin",
      "images": ["https://example.com/image1.jpg"],
      "user_id": "seller-id",
      "tier1_category": "Gold",
      "condition": "Mint",
      "weight": 1,
      "purity": ".999",
      "year": "2024"
    }
  }'
```

## API Endpoint Usage

### POST `/api/render-video`

**Request Body:**

```json
{
  "listingId": "uuid-of-listing"
}
```

OR

```json
{
  "listingData": {
    "id": "listing-id",
    "title": "Product Title",
    "description": "Product description",
    "images": ["url1", "url2"],
    "user_id": "seller-id",
    "tier1_category": "Gold",
    "condition": "Mint",
    "weight": 1,
    "purity": ".999",
    "year": "2024"
  }
}
```

**Response (Success):**

```json
{
  "success": true,
  "videoUrl": "https://supabase-storage-url.com/video.mp4",
  "listingId": "listing-id",
  "renderTime": "45.23",
  "message": "Video rendered and uploaded successfully"
}
```

**Response (Error):**

```json
{
  "success": false,
  "error": "Error message",
  "renderTime": "12.45"
}
```

## Integration with Supabase Webhook

To automatically generate videos when listings are created:

1. Create a Supabase webhook for the `listings` table
2. Set the webhook URL to: `https://your-project.vercel.app/api/render-video`
3. Configure for `INSERT` events
4. Add condition: `status = 'active'`

The webhook will automatically:
- Receive listing data
- Generate AI description
- Render video
- Upload to Supabase Storage
- Update listing with `video_url`

## Performance & Costs

### Execution Time
- Average render time: 30-60 seconds per video (26 seconds, 780 frames)
- Maximum duration: 15 minutes (with Fluid Compute)
- Timeout without Fluid Compute: 60 seconds (not enough for rendering)

### Vercel Pricing
- **Pro Plan:** $20/month (required for Fluid Compute)
- **Execution:** Charged per GB-hour
- **Bandwidth:** Charged for video uploads/downloads

### Cost Optimization Tips
1. Use CRF 28 (current setting) for faster encoding
2. Reduce concurrency to 50% if hitting memory limits
3. Consider caching bundled Remotion project
4. Monitor function execution time in Vercel dashboard

## Monitoring & Debugging

### View Logs
```bash
vercel logs your-project-url
```

Or in Vercel Dashboard:
- Go to your project
- Click "Functions" tab
- Select `api/render-video`
- View real-time logs

### Common Issues

**1. Function Timeout**
- Ensure Fluid Compute is enabled (Pro plan required)
- Check `maxDuration` in `vercel.json`

**2. Memory Limit Exceeded**
- Increase `memory` in `vercel.json` (max 3008 MB)
- Reduce `concurrency` in render settings

**3. Upload Failed**
- Check Supabase storage bucket permissions
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set

**4. Chrome Headless Shell Download Failed**
- Vercel will automatically download it on first run
- Ensure sufficient execution time and memory

## Local Development

Test locally with Vercel CLI:

```bash
cd videoreels
npm install
vercel dev
```

Then access:
```
http://localhost:3000/api/render-video
```

## Production Checklist

- [ ] Environment variables configured in Vercel
- [ ] Vercel Pro plan activated
- [ ] Supabase storage bucket created (`listings`)
- [ ] Gemini API key added (optional)
- [ ] GitHub repository connected
- [ ] Webhook configured in Supabase
- [ ] Test video generation with sample data
- [ ] Monitor logs for first production render
- [ ] Set up alerts for function failures

## Support

For issues or questions:
- Check Vercel logs first
- Review Remotion documentation: https://remotion.dev
- Check Vercel Fluid Compute docs: https://vercel.com/docs/functions/runtimes#max-duration

---

**Next Steps:**
1. Deploy to Vercel
2. Test with a sample listing
3. Configure Supabase webhook
4. Monitor first production renders
