import React from 'react';
import { Composition } from 'remotion';
import { ListingReel, listingReelSchema } from './compositions/ListingReel.jsx';

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="ListingReel"
        component={ListingReel}
        durationInFrames={780} // 26 seconds at 30fps (removed Seller Spotlight)
        fps={30}
        width={1080}
        height={1920} // Instagram Reel format (9:16)
        schema={listingReelSchema}
        defaultProps={{
          listingTitle: 'Premium Gold Coin',
          listingDescription: 'Beautiful gold coin in excellent condition',
          images: [],
          specifications: {
            category: 'Gold',
            condition: 'Mint',
            weight: '1 oz',
            purity: '.999',
            year: '2024',
          },
          sellerName: 'PeerMetals Seller',
          logoUrl: '',
        }}
      />
    </>
  );
};
