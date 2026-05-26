/**
 * Generates a lock screen image that mirrors the app's turntable view:
 * - Dark background with blurred album art
 * - Vinyl disc with grooves
 * - Album art circle in the center
 * - Song title and artist text below
 * All rendered as a static image for the lock screen.
 */
export function generateVinylArtwork(
  albumArtUrl: string,
  title: string,
  artist: string,
  size = 512
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return reject(new Error('Canvas not supported'));

    const centerX = size / 2;
    const vinylCenterY = size * 0.4;
    const vinylRadius = size * 0.32;
    const artRadius = vinylRadius * 0.42;
    const holeRadius = 5;

    const img = new Image();
    img.crossOrigin = 'anonymous';

    const drawScene = (hasImage: boolean) => {
      // === BACKGROUND ===
      // Dark gradient background (like the app)
      const bgGrad = ctx.createLinearGradient(0, 0, 0, size);
      bgGrad.addColorStop(0, '#0a0a0a');
      bgGrad.addColorStop(0.5, '#111');
      bgGrad.addColorStop(1, '#0a0a0a');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, size, size);

      // Blurred album art glow behind vinyl
      if (hasImage) {
        ctx.save();
        ctx.globalAlpha = 0.2;
        ctx.filter = 'blur(40px)';
        ctx.drawImage(img, centerX - size * 0.4, vinylCenterY - size * 0.4, size * 0.8, size * 0.8);
        ctx.restore();
      }

      // === VINYL DISC ===
      // Outer shadow
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 30;
      ctx.shadowOffsetY = 8;
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.arc(centerX, vinylCenterY, vinylRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Vinyl body
      const vinylGrad = ctx.createRadialGradient(
        centerX, vinylCenterY, artRadius,
        centerX, vinylCenterY, vinylRadius
      );
      vinylGrad.addColorStop(0, '#222');
      vinylGrad.addColorStop(0.3, '#1a1a1a');
      vinylGrad.addColorStop(0.7, '#111');
      vinylGrad.addColorStop(1, '#0d0d0d');
      ctx.fillStyle = vinylGrad;
      ctx.beginPath();
      ctx.arc(centerX, vinylCenterY, vinylRadius, 0, Math.PI * 2);
      ctx.fill();

      // Grooves
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.lineWidth = 0.6;
      for (let r = artRadius + 8; r < vinylRadius - 6; r += 3.5) {
        ctx.beginPath();
        ctx.arc(centerX, vinylCenterY, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Vinyl shine
      const shineGrad = ctx.createLinearGradient(
        centerX - vinylRadius, vinylCenterY - vinylRadius,
        centerX + vinylRadius, vinylCenterY + vinylRadius
      );
      shineGrad.addColorStop(0, 'rgba(255,255,255,0.06)');
      shineGrad.addColorStop(0.4, 'rgba(255,255,255,0)');
      shineGrad.addColorStop(0.6, 'rgba(255,255,255,0.03)');
      shineGrad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = shineGrad;
      ctx.beginPath();
      ctx.arc(centerX, vinylCenterY, vinylRadius, 0, Math.PI * 2);
      ctx.fill();

      // === ALBUM ART CENTER ===
      if (hasImage) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, vinylCenterY, artRadius, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, centerX - artRadius, vinylCenterY - artRadius, artRadius * 2, artRadius * 2);
        ctx.restore();
      } else {
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(centerX, vinylCenterY, artRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Art border ring
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, vinylCenterY, artRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Center hole
      ctx.fillStyle = '#0a0a0a';
      ctx.beginPath();
      ctx.arc(centerX, vinylCenterY, holeRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(centerX, vinylCenterY, holeRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Outer edge
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, vinylCenterY, vinylRadius - 1, 0, Math.PI * 2);
      ctx.stroke();

      // === SONG TITLE & ARTIST ===
      const textY = vinylCenterY + vinylRadius + 36;

      // Title
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.round(size * 0.042)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const truncatedTitle = title.length > 30 ? title.substring(0, 27) + '...' : title;
      ctx.fillText(truncatedTitle, centerX, textY);

      // Artist
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.font = `${Math.round(size * 0.032)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      const truncatedArtist = artist.length > 35 ? artist.substring(0, 32) + '...' : artist;
      ctx.fillText(truncatedArtist, centerX, textY + Math.round(size * 0.05));

      resolve(canvas.toDataURL('image/png'));
    };

    img.onload = () => drawScene(true);
    img.onerror = () => drawScene(false);
    img.src = albumArtUrl;
  });
}

/**
 * Updates the Media Session metadata with vinyl artwork
 */
export async function updateMediaSessionWithVinyl(
  title: string,
  artist: string,
  albumArtUrl: string
) {
  if (!('mediaSession' in navigator)) return;

  try {
    const vinylDataUrl = await generateVinylArtwork(albumArtUrl, title, artist);

    navigator.mediaSession.metadata = new MediaMetadata({
      title,
      artist,
      album: 'Retro Player',
      artwork: [
        { src: vinylDataUrl, sizes: '512x512', type: 'image/png' },
        { src: albumArtUrl, sizes: '256x256', type: 'image/jpeg' },
      ]
    });
  } catch (err) {
    console.warn('Failed to generate vinyl artwork:', err);
    navigator.mediaSession.metadata = new MediaMetadata({
      title,
      artist,
      album: 'Retro Player',
      artwork: [
        { src: albumArtUrl, sizes: '256x256', type: 'image/jpeg' },
      ]
    });
  }
}
