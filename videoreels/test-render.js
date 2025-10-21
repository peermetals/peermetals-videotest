/**
 * Test video generation with real listing data
 *
 * Run from project root:
 * node videoreels/test-render.js
 */

import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateDetailedDescription } from './src/utils/generateDescription.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Real listing data from database
const testListingRaw = {
  title: 'Lot of 4 Republic De Cuba Cinco Centavos Libertad',
  description: 'As pictured.',
  images: [
    'https://zstflevnkjsnxnbgtlms.supabase.co/storage/v1/object/public/listings/listings/d93e43ea-5fe4-44e6-aea9-3a7a24fa6f9e/4ksk1rzom44.jpg',
    'https://zstflevnkjsnxnbgtlms.supabase.co/storage/v1/object/public/listings/listings/d93e43ea-5fe4-44e6-aea9-3a7a24fa6f9e/g4dbi2k1lst.jpg',
  ],
  specifications: {
    category: 'Currency',
    condition: 'Numismatic',
    weight: '0.5 oz',
  },
};

async function testVideoRender() {
  try {
    console.log('🎬 Starting test video generation...\n');

    // Generate AI description
    console.log('🤖 Generating AI description...');
    const aiDescription = await generateDetailedDescription(testListingRaw);
    console.log('   ✅ Description:', aiDescription);
    console.log('');

    // Prepare video data with AI description
    const testListingData = {
      listingTitle: testListingRaw.title,
      listingDescription: aiDescription,
      images: testListingRaw.images,
      specifications: testListingRaw.specifications,
      sellerName: 'Paul Bryant',
      logoUrl: 'https://peermetals.com/peermetals.png',
    };

    console.log('📋 Video Data:');
    console.log('   Title:', testListingData.listingTitle);
    console.log('   Images:', testListingData.images.length);
    console.log('   Seller:', testListingData.sellerName);
    console.log('');

    // Step 1: Bundle the Remotion project
    console.log('📦 Bundling Remotion project...');
    const bundleLocation = await bundle({
      entryPoint: path.join(__dirname, 'src', 'index.js'),
      webpackOverride: (config) => config,
    });
    console.log(`✅ Bundle created at: ${bundleLocation}\n`);

    // Step 2: Select the composition
    console.log('🎯 Selecting composition...');
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: 'ListingReel',
      inputProps: testListingData,
    });
    console.log(`✅ Composition selected: ${composition.id}`);
    console.log(`   Duration: ${composition.durationInFrames} frames at ${composition.fps}fps`);
    console.log(`   Size: ${composition.width}x${composition.height}`);
    console.log('');

    // Step 3: Render the video
    const outputFileName = `test-video-${Date.now()}.mp4`;
    const outputPath = path.join(__dirname, 'out', outputFileName);

    console.log('🎥 Rendering video...');
    console.log(`   Output: ${outputPath}`);
    console.log('');

    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: 'h264',
      outputLocation: outputPath,
      inputProps: testListingData,
      onProgress: ({ progress, renderedFrames, encodedFrames, stitchStage }) => {
        const percent = Math.round(progress * 100);
        if (stitchStage === 'encoding') {
          console.log(`   📊 Encoding: ${percent}% (${encodedFrames}/${composition.durationInFrames} frames)`);
        } else {
          console.log(`   📊 Rendering: ${percent}% (${renderedFrames}/${composition.durationInFrames} frames)`);
        }
      },
      // Performance settings - optimized for speed
      concurrency: '50%', // Use 50% of CPU cores
      // Quality settings - CRF 28 for faster encoding
      crf: 28,
      pixelFormat: 'yuv420p',
      // Use number of CPU cores for parallel processing
      numberOfGifLoops: null,
      // Enable faster encoding
      chromiumOptions: {
        gl: 'angle', // Use ANGLE renderer for faster GPU acceleration
      },
    });

    console.log('');
    console.log('✅ Video rendered successfully!');
    console.log(`   📁 Location: ${outputPath}`);
    console.log('');
    console.log('🎉 Test complete! Open the video to preview.');

  } catch (error) {
    console.error('');
    console.error('❌ Video render failed!');
    console.error('   Error:', error.message);
    console.error('');
    console.error('Stack trace:');
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the test
testVideoRender();
