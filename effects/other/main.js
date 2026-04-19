const ImageFilters = {
    rgbToHsv: function(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, v = max;
        const d = max - min;
        s = max === 0 ? 0 : d / max;
        if (max === min) {
            h = 0;
        } else {
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return [h * 360, s * 100, v * 100];
    },

    hsvToRgb: function(h, s, v) {
        h /= 360; s /= 100; v /= 100;
        let r, g, b;
        const i = Math.floor(h * 6);
        const f = h * 6 - i;
        const p = v * (1 - s);
        const q = v * (1 - f * s);
        const t = v * (1 - (1 - f) * s);
        switch (i % 6) {
            case 0: r = v, g = t, b = p; break;
            case 1: r = q, g = v, b = p; break;
            case 2: r = p, g = v, b = t; break;
            case 3: r = p, g = q, b = v; break;
            case 4: r = t, g = p, b = v; break;
            case 5: r = v, g = p, b = q; break;
        }
        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    },

    yuvToRgb: function(y, u, v) {
        const r = y + 1.4075 * (v - 128);
        const g = y - 0.3455 * (u - 128) - (0.7169 * (v - 128));
        const b = y + 1.7790 * (u - 128);
        return [
            Math.max(0, Math.min(255, Math.round(r))),
            Math.max(0, Math.min(255, Math.round(g))),
            Math.max(0, Math.min(255, Math.round(b)))
        ];
    },

    rgbToYuv: function(r, g, b) {
        const y = 0.299 * r + 0.587 * g + 0.114 * b;
        const u = -0.14713 * r - 0.28886 * g + 0.436 * b + 128;
        const v = 0.615 * r - 0.51499 * g - 0.10001 * b + 128;
        return [y, u, v];
    },

    fourierTransform: function(real) {
        const N = real.length;
        const output = [];
        for (let k = 0; k < N; k++) {
            let re = 0;
            let im = 0;
            for (let n = 0; n < N; n++) {
                const angle = (2 * Math.PI * k * n) / N;
                re += real[n] * Math.cos(angle);
                im -= real[n] * Math.sin(angle);
            }
            output.push({ re, im, mag: Math.sqrt(re * re + im * im) });
        }
        return output;
    },

    checkerboard: function(width, height, size, color1, color2) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        for (let y = 0; y < height; y += size) {
            for (let x = 0; x < width; x += size) {
                ctx.fillStyle = (Math.floor(x / size) + Math.floor(y / size)) % 2 === 0 ? color1 : color2;
                ctx.fillRect(x, y, size, size);
            }
        }
        return canvas.toDataURL();
    }
};
