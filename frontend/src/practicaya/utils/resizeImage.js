// Resizes an uploaded image file to fit within an exact target canvas size
// (like CSS object-fit: contain) without cropping any part of the original
// image, padding the leftover space with a solid background color, and
// returns a compressed base64 data URL.
export function resizeImageToDataUrl(file, targetWidth, targetHeight, quality = 0.85, backgroundColor = '#FFFFFF') {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, targetWidth, targetHeight);

        const targetRatio = targetWidth / targetHeight;
        const srcRatio = img.width / img.height;
        let dw, dh, dx, dy;

        if (srcRatio > targetRatio) {
          // Source is relatively wider than target: fit to width, pad top/bottom
          dw = targetWidth;
          dh = dw / srcRatio;
          dx = 0;
          dy = (targetHeight - dh) / 2;
        } else {
          // Source is relatively taller than target: fit to height, pad left/right
          dh = targetHeight;
          dw = dh * srcRatio;
          dy = 0;
          dx = (targetWidth - dw) / 2;
        }

        ctx.drawImage(img, 0, 0, img.width, img.height, dx, dy, dw, dh);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => reject(new Error('No se pudo leer la imagen'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('No se pudo leer el archivo'));
    reader.readAsDataURL(file);
  });
}
