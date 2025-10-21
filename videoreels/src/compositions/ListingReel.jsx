import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
  Img,
  Easing,
  Audio,
  staticFile,
} from 'remotion';
import { z } from 'zod';

export const listingReelSchema = z.object({
  listingTitle: z.string(),
  listingDescription: z.string(),
  images: z.array(z.string()),
  specifications: z.object({
    category: z.string().optional(),
    condition: z.string().optional(),
    weight: z.string().optional(),
    purity: z.string().optional(),
    year: z.string().optional(),
  }),
  sellerName: z.string(),
  logoUrl: z.string().optional(),
});

export const ListingReel = ({
  listingTitle,
  listingDescription,
  images,
  specifications,
  sellerName,
  logoUrl,
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {/* Scene 1: Intro with Zoom & Particles (0-150 frames = 5s) */}
      <Sequence from={0} durationInFrames={150}>
        <IntroScene title={listingTitle} image={images[0]} />
      </Sequence>

      {/* Scene 2: Product Showcase with Ken Burns Effect (150-360 frames = 7s) */}
      <Sequence from={150} durationInFrames={210}>
        <ProductShowcaseScene images={images} />
      </Sequence>

      {/* Scene 3: Split Screen Gallery (360-450 frames = 3s) */}
      <Sequence from={360} durationInFrames={90}>
        <SplitScreenScene images={images} />
      </Sequence>

      {/* Scene 4: Specifications with Animated Cards (450-540 frames = 3s) */}
      <Sequence from={450} durationInFrames={90}>
        <SpecificationsScene
          specifications={specifications}
          image={images[0]}
        />
      </Sequence>

      {/* Scene 5: Why Choose PeerMetals (540-690 frames = 5s) */}
      <Sequence from={540} durationInFrames={150}>
        <WhyChoosePeerMetalsScene image={images[0]} />
      </Sequence>

      {/* Scene 6: Call to Action with Pulse Effect (690-780 frames = 3s) */}
      <Sequence from={690} durationInFrames={90}>
        <CTAScene
          description={listingDescription}
          sellerName={sellerName}
        />
      </Sequence>

      {/* Animated Logo Watermark (always visible, fades in) */}
      {logoUrl && <LogoWatermark logoUrl={logoUrl} />}

      {/* Background Audio */}
      <Audio
        src={staticFile('genvideo.mp3')}
        volume={0.3}
        startFrom={0}
      />
    </AbsoluteFill>
  );
};

// Scene 1: Dramatic Intro with Zoom and Particles
const IntroScene = ({ title, image }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Dramatic zoom-out effect on image
  const imageScale = interpolate(frame, [0, 40], [2.5, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  // Title flies in from bottom with bounce
  const titleSpring = spring({
    frame: frame - 5,
    fps,
    config: { damping: 80, stiffness: 150, mass: 0.5 },
  });

  const titleY = interpolate(titleSpring, [0, 1], [height, height / 2 - 100]);

  // Fade in overlay
  const overlayOpacity = interpolate(frame, [0, 20], [0.9, 0.6]);

  // Split title into words for individual animation
  const words = title.split(' ');

  return (
    <AbsoluteFill>
      {/* Background Image with Zoom */}
      {image && (
        <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
          <Img
            src={image}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: `scale(${imageScale})`,
            }}
          />
        </div>
      )}

      {/* Gradient Overlay */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: `linear-gradient(135deg, rgba(0,0,0,${overlayOpacity}), rgba(40,20,0,${overlayOpacity * 0.8}))`,
        }}
      />

      {/* Animated Particles */}
      <ParticleEffect count={15} />

      {/* Title with word-by-word animation */}
      <div
        style={{
          position: 'absolute',
          top: titleY,
          left: 0,
          right: 0,
          padding: '0 60px',
          textAlign: 'center',
        }}
      >
        {words.map((word, index) => {
          const wordDelay = index * 3;
          const wordOpacity = interpolate(
            frame,
            [10 + wordDelay, 20 + wordDelay],
            [0, 1],
            { extrapolateRight: 'clamp' }
          );

          return (
            <span
              key={index}
              style={{
                display: 'inline-block',
                margin: '0 8px',
                opacity: wordOpacity,
              }}
            >
              <h1
                style={{
                  color: 'white',
                  fontSize: 80,
                  fontWeight: 'bold',
                  margin: 0,
                  textShadow: '0 8px 24px rgba(0,0,0,0.9), 0 0 40px rgba(223,164,59,0.3)',
                  lineHeight: 1.2,
                }}
              >
                {word}
              </h1>
            </span>
          );
        })}

        {/* Animated underline */}
        <div
          style={{
            marginTop: 30,
            height: 6,
            width: interpolate(frame, [20, 35], [0, 300], {
              extrapolateRight: 'clamp',
            }),
            background: 'linear-gradient(90deg, #dfa43b, #f4c542)',
            margin: '30px auto 0',
            borderRadius: 3,
            boxShadow: '0 0 20px rgba(223,164,59,0.6)',
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

// Scene 2: Product Showcase with Ken Burns Effect
const ProductShowcaseScene = ({ images }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // Calculate total frames for this scene (210 frames = 7 seconds)
  const totalFrames = 210;
  const framesPerImage = Math.floor(totalFrames / Math.max(images.length, 1));

  // Cycle through images evenly across the scene duration
  const imageIndex = Math.min(
    Math.floor(frame / framesPerImage),
    images.length - 1
  );
  const currentImage = images[imageIndex] || images[0];

  // Ken Burns effect (slow zoom and pan) - smooth across entire scene, no looping
  const kenBurnsScale = interpolate(frame, [0, totalFrames], [1, 1.2], {
    extrapolateRight: 'clamp',
  });
  const kenBurnsPan = interpolate(frame, [0, totalFrames], [0, -50], {
    extrapolateRight: 'clamp',
  });

  // Rotating spotlight effect
  const spotlightRotation = (frame * 2) % 360;

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {/* Main Image with Ken Burns Effect */}
      <div
        style={{
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: '85%',
            height: '85%',
            transform: `scale(${kenBurnsScale}) translateX(${kenBurnsPan}px)`,
            transition: 'transform 0.3s ease-out',
            borderRadius: 20,
            overflow: 'hidden',
            boxShadow: '0 30px 80px rgba(0,0,0,0.8), 0 0 100px rgba(223,164,59,0.2)',
          }}
        >
          {currentImage && (
            <Img
              src={currentImage}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                backgroundColor: '#1a1a1a',
              }}
            />
          )}
        </div>
      </div>

      {/* Rotating Spotlight Effect */}
      <div
        style={{
          position: 'absolute',
          width: '200%',
          height: '200%',
          top: '-50%',
          left: '-50%',
          background: `conic-gradient(from ${spotlightRotation}deg, transparent 0%, rgba(223,164,59,0.1) 10%, transparent 20%)`,
          opacity: 0.3,
        }}
      />

      {/* Image Counter */}
      {images.length > 1 && (
        <div
          style={{
            position: 'absolute',
            bottom: 100,
            left: 0,
            right: 0,
            textAlign: 'center',
            display: 'flex',
            justifyContent: 'center',
            gap: 12,
          }}
        >
          {images.map((_, index) => {
            const dotScale = index === imageIndex ? 1.5 : 1;
            const dotOpacity = index === imageIndex ? 1 : 0.4;

            return (
              <div
                key={index}
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: '#dfa43b',
                  opacity: dotOpacity,
                  transform: `scale(${dotScale})`,
                  transition: 'all 0.3s ease',
                  boxShadow: index === imageIndex ? '0 0 15px rgba(223,164,59,0.8)' : 'none',
                }}
              />
            );
          })}
        </div>
      )}

      {/* Removed dotted border - cleaner look */}
    </AbsoluteFill>
  );
};

// Scene 3: Split Screen Gallery
const SplitScreenScene = ({ images }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Show 2-4 images in split screen
  const displayImages = images.slice(0, 4);

  // Synchronized entrance for all images
  const gridSpring = spring({
    frame,
    fps,
    config: { damping: 80, stiffness: 150 },
  });

  const gridScale = interpolate(gridSpring, [0, 1], [0.9, 1]);
  const gridOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Slow zoom effect on all images together
  const imageZoom = interpolate(frame, [0, 90], [1, 1.05], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0a0a' }}>
      {/* Grid layout for images */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: displayImages.length > 2 ? '1fr 1fr' : '1fr',
          gridTemplateRows: displayImages.length > 2 ? '1fr 1fr' : '1fr',
          width: '100%',
          height: '100%',
          gap: 4,
          padding: 4,
          opacity: gridOpacity,
          transform: `scale(${gridScale})`,
        }}
      >
        {displayImages.map((image, index) => {
          return (
            <div
              key={index}
              style={{
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                backgroundColor: '#1a1a1a',
                boxShadow: '0 10px 30px rgba(0,0,0,0.7), inset 0 0 40px rgba(223,164,59,0.1)',
              }}
            >
              {image && (
                <Img
                  src={image}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transform: `scale(${imageZoom})`,
                  }}
                />
              )}

              {/* Subtle overlay gradient */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(45deg, rgba(223,164,59,0.1), transparent)',
                  opacity: 0.3,
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Center Logo/Badge with entrance animation */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) scale(${gridSpring})`,
          backgroundColor: 'rgba(0,0,0,0.85)',
          padding: '20px 40px',
          borderRadius: 50,
          border: '3px solid #dfa43b',
          boxShadow: '0 0 40px rgba(223,164,59,0.6), inset 0 0 20px rgba(223,164,59,0.2)',
          opacity: gridOpacity,
        }}
      >
        <p
          style={{
            color: '#dfa43b',
            fontSize: 32,
            fontWeight: 'bold',
            margin: 0,
            textShadow: '0 0 10px rgba(223,164,59,0.5)',
          }}
        >
          GALLERY
        </p>
      </div>
    </AbsoluteFill>
  );
};

// Scene 4: Specifications with Animated Cards
const SpecificationsScene = ({ specifications, image }) => {
  const frame = useCurrentFrame();

  const specs = [
    { label: 'Category', value: specifications.category, icon: '📦' },
    { label: 'Condition', value: specifications.condition, icon: '✨' },
    { label: 'Weight', value: specifications.weight, icon: '⚖️' },
    { label: 'Purity', value: specifications.purity, icon: '💎' },
    { label: 'Year', value: specifications.year, icon: '📅' },
  ].filter((spec) => spec.value);

  return (
    <AbsoluteFill>
      {/* Animated background with image */}
      {image && (
        <>
          <Img
            src={image}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'blur(30px) brightness(0.4)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, rgba(0,0,0,0.8), rgba(40,20,0,0.85))',
            }}
          />
        </>
      )}

      {/* Floating particles in background */}
      <ParticleEffect count={20} color="rgba(223,164,59,0.3)" />

      {/* Title */}
      <div
        style={{
          position: 'absolute',
          top: 150,
          left: 0,
          right: 0,
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            color: '#dfa43b',
            fontSize: 70,
            fontWeight: 'bold',
            margin: 0,
            textShadow: '0 0 30px rgba(223,164,59,0.8)',
            letterSpacing: 4,
          }}
        >
          SPECIFICATIONS
        </h2>
      </div>

      {/* Animated Cards */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -40%)',
          width: '85%',
        }}
      >
        {specs.map((spec, index) => {
          const cardDelay = index * 4;
          const cardSpring = spring({
            frame: frame - cardDelay,
            fps: 30,
            config: { damping: 80, stiffness: 120 },
          });

          const cardX = interpolate(cardSpring, [0, 1], [-500, 0]);
          const cardOpacity = interpolate(
            frame,
            [cardDelay, cardDelay + 8],
            [0, 1],
            { extrapolateRight: 'clamp' }
          );

          // Hover effect simulation
          const cardScale = interpolate(
            Math.sin((frame - cardDelay) * 0.1),
            [-1, 1],
            [1, 1.02]
          );

          return (
            <div
              key={spec.label}
              style={{
                marginBottom: 20,
                opacity: cardOpacity,
                transform: `translateX(${cardX}px) scale(${cardScale})`,
              }}
            >
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(223,164,59,0.15), rgba(40,20,0,0.3))',
                  borderRadius: 20,
                  padding: '20px 30px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  border: '2px solid rgba(223,164,59,0.4)',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.5), inset 0 0 20px rgba(223,164,59,0.1)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <span style={{ fontSize: 40 }}>{spec.icon}</span>
                  <span
                    style={{
                      color: '#dfa43b',
                      fontSize: 38,
                      fontWeight: 'bold',
                    }}
                  >
                    {spec.label}
                  </span>
                </div>
                <span
                  style={{
                    color: 'white',
                    fontSize: 38,
                    fontWeight: '600',
                    textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                  }}
                >
                  {spec.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// Scene 5: Call to Action with Pulse Effect
const CTAScene = ({ description, sellerName }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Pulse effect for CTA button
  const pulseScale = interpolate(
    Math.sin(frame * 0.3),
    [-1, 1],
    [1, 1.1]
  );

  const ctaSpring = spring({
    frame,
    fps,
    config: { damping: 60 },
  });

  const ctaY = interpolate(ctaSpring, [0, 1], [200, 0]);

  return (
    <AbsoluteFill>
      {/* Radial gradient background */}
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle at center, #1a1a1a 0%, #000 70%)',
        }}
      />

      {/* Animated rays */}
      <div
        style={{
          position: 'absolute',
          width: '200%',
          height: '200%',
          top: '-50%',
          left: '-50%',
          background: `conic-gradient(from ${frame * 3}deg, transparent 0%, rgba(223,164,59,0.15) 5%, transparent 10%, transparent 90%, rgba(223,164,59,0.15) 95%, transparent 100%)`,
        }}
      />

      {/* Content */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) translateY(${ctaY}px)`,
          width: '85%',
          textAlign: 'center',
        }}
      >
        {/* Description */}
        <h2
          style={{
            color: 'white',
            fontSize: 52,
            marginBottom: 50,
            lineHeight: 1.4,
            textShadow: '0 4px 20px rgba(0,0,0,0.8)',
          }}
        >
          {description}
        </h2>

        {/* CTA Button with Pulse */}
        <div
          style={{
            transform: `scale(${pulseScale})`,
            display: 'inline-block',
          }}
        >
          <div
            style={{
              padding: '25px 60px',
              background: 'linear-gradient(135deg, #dfa43b, #f4c542)',
              borderRadius: 50,
              boxShadow: '0 20px 50px rgba(223,164,59,0.5), inset 0 0 30px rgba(255,255,255,0.3)',
              border: '3px solid rgba(255,255,255,0.3)',
            }}
          >
            <p
              style={{
                color: 'black',
                fontSize: 48,
                fontWeight: 'bold',
                margin: 0,
                textShadow: '0 2px 4px rgba(255,255,255,0.3)',
                letterSpacing: 2,
              }}
            >
              SHOP NOW
            </p>
          </div>
        </div>

        {/* PeerMetals Logo */}
        <div
          style={{
            marginTop: 50,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Img
            src="https://peermetals.com/logo.png"
            style={{
              width: 250,
              height: 'auto',
              objectFit: 'contain',
              filter: 'drop-shadow(0 0 20px rgba(223,164,59,0.5))',
            }}
          />
        </div>

        {/* Seller info */}
        <p
          style={{
            color: 'rgba(255,255,255,0.7)',
            fontSize: 28,
            marginTop: 30,
          }}
        >
          Seller: {sellerName}
        </p>
      </div>
    </AbsoluteFill>
  );
};

// Scene 5: Why Choose PeerMetals
const WhyChoosePeerMetalsScene = ({ image }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance animation
  const entranceSpring = spring({
    frame,
    fps,
    config: { damping: 70, stiffness: 120 },
  });

  const titleY = interpolate(entranceSpring, [0, 1], [100, 0]);
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Blurred background with image
  const bgOpacity = interpolate(frame, [0, 15], [0, 0.4], {
    extrapolateRight: 'clamp',
  });

  // Benefits data
  const buyerBenefits = [
    { title: 'Buyer Protection', desc: 'Every transaction backed by dispute resolution' },
    { title: 'Verified Sellers', desc: 'Trust and reputation tools for safer transactions' }
  ];

  const sellerBenefits = [
    { title: '2.75% Platform Fee', desc: 'Keep more of every sale with transparent pricing' },
    { title: '1-3 Day Payouts', desc: 'Fast and reliable, not weeks like other platforms' }
  ];

  return (
    <AbsoluteFill>
      {/* Blurred background with image */}
      {image && (
        <div style={{ position: 'absolute', width: '100%', height: '100%', overflow: 'hidden', opacity: bgOpacity }}>
          <Img
            src={image}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'blur(25px) brightness(0.3)',
            }}
          />
        </div>
      )}

      {/* Dark gradient overlay */}
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle at center, rgba(0,0,0,0.7) 0%, #000 80%)',
        }}
      />

      {/* Content */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px',
        }}
      >
        {/* Main Title */}
        <h2
          style={{
            color: 'white',
            fontSize: 90,
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: 100,
            transform: `translateY(${titleY}px)`,
            opacity: titleOpacity,
            textShadow: '0 4px 20px rgba(0,0,0,0.8)',
          }}
        >
          Why Choose PeerMetals?
        </h2>

        {/* Buyer Benefits */}
        <div style={{ marginBottom: 80 }}>
          <h3
            style={{
              color: '#dfa43b',
              fontSize: 64,
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: 50,
              opacity: interpolate(frame, [20, 40], [0, 1], { extrapolateRight: 'clamp' }),
            }}
          >
            Buyer Benefits
          </h3>

          {buyerBenefits.map((benefit, index) => {
            const delay = 40 + index * 15;
            const benefitOpacity = interpolate(frame, [delay, delay + 15], [0, 1], {
              extrapolateRight: 'clamp',
            });
            const benefitY = interpolate(frame, [delay, delay + 15], [30, 0], {
              extrapolateRight: 'clamp',
            });

            return (
              <div
                key={index}
                style={{
                  marginBottom: 40,
                  paddingLeft: '8%',
                  paddingRight: '8%',
                  opacity: benefitOpacity,
                  transform: `translateY(${benefitY}px)`,
                }}
              >
                <p style={{ color: 'white', fontSize: 52, fontWeight: 'bold', marginBottom: 10 }}>
                  • {benefit.title}
                </p>
                <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 42, paddingLeft: 60 }}>
                  {benefit.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Seller Benefits */}
        <div>
          <h3
            style={{
              color: '#dfa43b',
              fontSize: 64,
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: 50,
              opacity: interpolate(frame, [70, 90], [0, 1], { extrapolateRight: 'clamp' }),
            }}
          >
            Seller Benefits
          </h3>

          {sellerBenefits.map((benefit, index) => {
            const delay = 90 + index * 15;
            const benefitOpacity = interpolate(frame, [delay, delay + 15], [0, 1], {
              extrapolateRight: 'clamp',
            });
            const benefitY = interpolate(frame, [delay, delay + 15], [30, 0], {
              extrapolateRight: 'clamp',
            });

            return (
              <div
                key={index}
                style={{
                  marginBottom: 40,
                  paddingLeft: '8%',
                  paddingRight: '8%',
                  opacity: benefitOpacity,
                  transform: `translateY(${benefitY}px)`,
                }}
              >
                <p style={{ color: 'white', fontSize: 52, fontWeight: 'bold', marginBottom: 10 }}>
                  • {benefit.title}
                </p>
                <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 42, paddingLeft: 60 }}>
                  {benefit.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Animated Logo Watermark
const LogoWatermark = ({ logoUrl }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 20], [0, 0.9], {
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 30,
        right: 30,
        opacity,
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(0,0,0,0.7)',
          borderRadius: 20,
          padding: 15,
          border: '2px solid rgba(223,164,59,0.5)',
          boxShadow: '0 8px 25px rgba(0,0,0,0.6)',
        }}
      >
        <Img
          src={logoUrl}
          style={{
            width: 90,
            height: 90,
            objectFit: 'contain',
          }}
        />
      </div>
    </div>
  );
};


// Particle Effect Component
const ParticleEffect = ({ count = 10, color = 'rgba(223,164,59,0.4)' }) => {
  const frame = useCurrentFrame();

  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const seed = i * 123.456;
        const x = (Math.sin(seed) * 50 + 50) % 100;
        const y = ((frame + seed * 10) % 2000) / 2000 * 100;
        const size = 2 + (Math.cos(seed) * 2 + 2);
        const opacity = Math.abs(Math.sin((frame + seed) * 0.02));

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${x}%`,
              top: `${y}%`,
              width: size,
              height: size,
              borderRadius: '50%',
              backgroundColor: color,
              opacity: opacity * 0.6,
              boxShadow: `0 0 ${size * 2}px ${color}`,
            }}
          />
        );
      })}
    </>
  );
};
