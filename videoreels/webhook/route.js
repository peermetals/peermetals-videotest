import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Enhanced error logging function
function logError(message, error, additionalData = {}) {
  const errorObj = {
    timestamp: new Date().toISOString(),
    message,
    error: error instanceof Error
      ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        }
      : error,
    ...additionalData
  };

  console.error('VIDEO REEL WEBHOOK ERROR:', JSON.stringify(errorObj, null, 2));
}

function validateWebhookPayload(body) {
  try {
    // Check if required fields are present
    if (!body.type || body.type !== 'INSERT') {
      throw new Error('Invalid webhook type - only INSERT events are supported');
    }

    if (!body.table || body.table !== 'listings') {
      throw new Error('Invalid table - only listings table is supported');
    }

    if (!body.record) {
      throw new Error('Missing record data in webhook payload');
    }

    const record = body.record;

    // Check if listing is active (published)
    if (record.status !== 'active') {
      throw new Error(`Listing status '${record.status}' not active - skipping video generation`);
    }

    // Check required fields
    if (!record.id) {
      throw new Error('Missing listing ID');
    }

    if (!record.title) {
      throw new Error('Missing listing title');
    }

    if (!record.user_id) {
      throw new Error('Missing user ID');
    }

    return true;
  } catch (error) {
    logError('Webhook payload validation failed', error, { body });
    throw error;
  }
}

// Helper function to generate AI description if not present
async function generateListingDescription(listing) {
  try {
    if (listing.description && listing.description.length > 10) {
      // Extract plain text from HTML if needed
      const plainText = listing.description.replace(/<[^>]*>/g, '');
      if (plainText.length > 150) {
        return plainText.substring(0, 147) + '...';
      }
      return plainText;
    }

    // Fallback description
    return `Discover this exquisite ${listing.tier1_category || 'precious metal'} item. Quality guaranteed.`;
  } catch (error) {
    console.error('Error generating description:', error);
    return 'Premium precious metal item available now.';
  }
}

// Main video generation function - will be implemented later
async function generateVideoReel(listing, sellerProfile) {
  try {
    console.log(`🎬 Generating video reel for listing: ${listing.title}`);

    // Prepare video data
    const videoData = {
      listingTitle: listing.title || 'New Listing',
      listingDescription: await generateListingDescription(listing),
      images: listing.images || [],
      specifications: {
        category: listing.tier1_category || listing.tier2_category,
        condition: listing.condition,
        weight: listing.weight ? `${listing.weight} oz` : undefined,
        purity: listing.purity,
        year: listing.year,
      },
      sellerName: sellerProfile.full_name || sellerProfile.username,
      logoUrl: process.env.NEXT_PUBLIC_APP_URL
        ? `${process.env.NEXT_PUBLIC_APP_URL}/peermetals.png`
        : 'https://peermetals.com/peermetals.png',
    };

    console.log('Video data prepared:', {
      title: videoData.listingTitle,
      imageCount: videoData.images.length,
      seller: videoData.sellerName,
    });

    // TODO: Implement Remotion rendering
    // For now, just save the video data to track that we need to generate it
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Store video generation request
    const videoFileName = `listing-${listing.id}-${Date.now()}.mp4`;
    const videoPath = `video-reels/${videoFileName}`;

    // You can create a table to track video generation jobs
    // For now, we'll just log it
    console.log(`📹 Video will be saved to: ${videoPath}`);
    console.log(`✅ Video generation queued for listing ${listing.id}`);

    return {
      success: true,
      videoPath,
      videoData,
      message: 'Video generation queued successfully',
    };

  } catch (error) {
    logError('Video generation failed', error, {
      listingId: listing.id,
      listingTitle: listing.title
    });
    return null;
  }
}

export async function POST(req) {
  try {
    // Parse the request body
    const body = await req.json();
    console.log('Video Reel Webhook payload:', JSON.stringify(body, null, 2));

    // Validate the webhook payload
    validateWebhookPayload(body);

    const listing = body.record;
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Fetch seller profile information
    const { data: sellerProfile, error: profileError } = await supabase
      .from('profiles')
      .select('username, full_name, avatar_url, reputation, is_verified')
      .eq('id', listing.user_id)
      .single();

    let seller = sellerProfile;
    if (profileError || !sellerProfile) {
      console.log(`Profile not found or error: ${profileError?.message}. Using fallback profile.`);
      seller = {
        username: 'peermetals_seller',
        full_name: 'PeerMetals Seller',
        avatar_url: null,
        reputation: 0,
        is_verified: false
      };
    }

    console.log(`Generating video reel for listing: ${listing.title} by ${seller.full_name || seller.username}`);

    // Generate video reel
    const videoResult = await generateVideoReel(listing, seller);

    if (!videoResult) {
      throw new Error('Failed to generate video reel');
    }

    return NextResponse.json({
      success: true,
      message: 'Video reel generation queued successfully',
      listingId: listing.id,
      videoPath: videoResult.videoPath,
      videoData: videoResult.videoData,
    }, { status: 200 });

  } catch (error) {
    // Check if this is a validation error that we should ignore
    if (error.message.includes('not active') ||
        error.message.includes('only INSERT events') ||
        error.message.includes('only listings table')) {
      console.log('Skipping webhook:', error.message);
      return NextResponse.json({
        success: true,
        message: 'Webhook skipped',
        reason: error.message
      }, { status: 200 });
    }

    logError('Video reel webhook processing failed', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message
      },
      { status: error.message.includes('Missing') ? 400 : 500 }
    );
  }
}
