const Filters = {
  stripes: function(ctx, width, height, spacing = 10, color1 = '#ff0000', color2 = '#0000ff') {
    for (let x = 0; x < width; x += spacing * 2) {
      ctx.fillStyle = color1;
      ctx.fillRect(x, 0, spacing, height);
      ctx.fillStyle = color2;
      ctx.fillRect(x + spacing, 0, spacing, height);
    }
  },

  clouds: function(ctx, width, height) {
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const tempCtx = canvas.getContext('2d');
    
    for (let i = 0; i < data.length; i += 4) {
      const v = Math.random() * 255;
      data[i] = data[i + 1] = data[i + 2] = v;
      data[i + 3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);
    ctx.globalAlpha = 0.5;
    ctx.filter = 'blur(4px)';
    ctx.drawImage(canvas, 0, 0);
    ctx.filter = 'none';
    ctx.globalAlpha = 1.0;
  },

  mandelbrot: function(ctx, width, height, maxIter = 100) {
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        let a = (x - width / 1.5) / (width / 3);
        let b = (y - height / 2) / (height / 3);
        let ca = a;
        let cb = b;
        let n = 0;
        while (n < maxIter) {
          let aa = a * a - b * b;
          let bb = 2 * a * b;
          a = aa + ca;
          b = bb + cb;
          if (a * a + b * b > 16) break;
          n++;
        }
        const pix = (x + y * width) * 4;
        const color = n === maxIter ? 0 : (n / maxIter) * 255;
        data[pix] = color;
        data[pix + 1] = color;
        data[pix + 2] = color;
        data[pix + 3] = 255;
      }
    }
    ctx.putImageData(imageData, 0, 0);
  },

  julia: function(ctx, width, height, cx = -0.7, cy = 0.27015, maxIter = 100) {
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        let a = 1.5 * (x - width / 2) / (0.5 * width);
        let b = (y - height / 2) / (0.5 * height);
        let n = 0;
        while (n < maxIter) {
          let aa = a * a - b * b;
          let bb = 2 * a * b;
          a = aa + cx;
          b = bb + cy;
          if (a * a + b * b > 4) break;
          n++;
        }
        const pix = (x + y * width) * 4;
        const color = n === maxIter ? 0 : (n / maxIter) * 255;
        data[pix] = color;
        data[pix + 1] = color * 0.5;
        data[pix + 2] = 255;
        data[pix + 3] = 255;
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }
};
