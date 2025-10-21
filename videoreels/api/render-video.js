/**
 * Vercel Serverless Function for Video Rendering
 * Uses Remotion to render videos on Vercel with Fluid Compute
 *
 * This endpoint supports up to 15 minutes execution time with Fluid Compute
 */

import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { createClient } from '@supabase/supabase-js';
import { generateDetailedDescription } from '../src/utils/generateDescription.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/**
 * Main handler for video rendering
 */
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const startTime = Date.now();
  console.log('🎬 Video render request received');

  try {
    // Parse request body
    const { listingId, listingData } = req.body;

    if (!listingId && !listingData) {
      return res.status(400).json({
        error: 'Missing required parameter: listingId or listingData'
      });
    }

    let listing = listingData;

    // Fetch listing data from Supabase if only ID provided
    if (listingId && !listingData) {
      console.log(`📋 Fetching listing data for ID: ${listingId}`);
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', listingId)
        .single();

      if (error || !data) {
        throw new Error(`Failed to fetch listing: ${error?.message}`);
      }

      listing = data;
    }

    // Fetch seller profile
    console.log(`👤 Fetching seller profile for user: ${listing.user_id}`);
    const { data: sellerProfile } = await supabase
      .from('profiles')
      .select('username, full_name, avatar_url')
      .eq('id', listing.user_id)
      .single();

    const seller = sellerProfile || {
      username: 'peermetals_seller',
      full_name: 'PeerMetals Seller',
    };

    // Generate AI description
    console.log('🤖 Generating AI description...');
    const aiDescription = await generateDetailedDescription({
      title: listing.title,
      description: listing.description,
      specifications: {
        category: listing.tier1_category || listing.tier2_category,
        condition: listing.condition,
        weight: listing.weight,
        purity: listing.purity,
        year: listing.year,
      },
    });

    // Prepare video input props
    const videoInputProps = {
      listingTitle: listing.title,
      listingDescription: aiDescription,
      images: listing.images || [],
      specifications: {
        category: listing.tier1_category || listing.tier2_category,
        condition: listing.condition,
        weight: listing.weight ? `${listing.weight} oz` : undefined,
        purity: listing.purity,
        year: listing.year,
      },
      sellerName: seller.full_name || seller.username,
      logoUrl: 'https://peermetals.com/peermetals.png',
    };

    console.log('📦 Bundling Remotion project...');
    const bundleLocation = await bundle({
      entryPoint: path.join(__dirname, '..', 'src', 'index.js'),
      webpackOverride: (config) => config,
    });

    console.log('🎯 Selecting composition...');
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: 'ListingReel',
      inputProps: videoInputProps,
    });

    console.log(`✅ Composition: ${composition.id}, ${composition.durationInFrames} frames`);

    // Generate output filename
    const outputFileName = `listing-${listing.id}-${Date.now()}.mp4`;
    const outputPath = path.join('/tmp', outputFileName);

    console.log('🎥 Rendering video...');
    console.log(`   Output: ${outputPath}`);

    // Render the video
    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: 'h264',
      outputLocation: outputPath,
      inputProps: videoInputProps,
      onProgress: ({ progress, renderedFrames }) => {
        const percent = Math.round(progress * 100);
        if (renderedFrames % 60 === 0) {
          console.log(`   📊 Progress: ${percent}% (${renderedFrames}/${composition.durationInFrames} frames)`);
        }
      },
      // Performance settings
      concurrency: '100%', // Use all available CPU on Vercel
      crf: 28,
      pixelFormat: 'yuv420p',
      chromiumOptions: {
        gl: 'angle',
      },
    });

    console.log('✅ Video rendered successfully!');

    // Upload to Supabase Storage
    console.log('📤 Uploading to Supabase Storage...');
    const videoBuffer = fs.readFileSync(outputPath);
    const storagePath = `video-reels/${outputFileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('listings')
      .upload(storagePath, videoBuffer, {
        contentType: 'video/mp4',
        cacheControl: '3600',
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('listings')
      .getPublicUrl(storagePath);

    console.log(`✅ Video uploaded: ${publicUrl}`);

    // Update listing with video URL
    const { error: updateError } = await supabase
      .from('listings')
      .update({ video_url: publicUrl })
      .eq('id', listing.id);

    if (updateError) {
      console.error('Failed to update listing with video URL:', updateError);
    }

    // Clean up temp file
    fs.unlinkSync(outputPath);

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`🎉 Complete! Total time: ${totalTime}s`);

    return res.status(200).json({
      success: true,
      videoUrl: publicUrl,
      listingId: listing.id,
      renderTime: totalTime,
      message: 'Video rendered and uploaded successfully',
    });

  } catch (error) {
    console.error('❌ Video render failed:', error);
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);

    return res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      renderTime: totalTime,
    });
  }
}

// Export config for Vercel Serverless Functions
export const config = {
  maxDuration: 900, // 15 minutes with Fluid Compute (requires Pro plan)
  memory: 3008, // Maximum memory allocation
};
