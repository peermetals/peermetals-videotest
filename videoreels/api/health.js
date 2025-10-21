// Simple health check endpoint
export default function handler(req, res) {
  res.status(200).json({
    status: 'ok',
    service: 'PeerMetals Video Reels',
    timestamp: new Date().toISOString(),
    env: {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasGeminiKey: !!process.env.NEXT_PUBLIC_GEMINI_API_KEY,
    }
  });
}
