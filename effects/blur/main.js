const ImageFilters = {
    gblur: function(pixels, width, height, radius) {
        const out = new Uint8ClampedArray(pixels.length);
        const rs = Math.ceil(radius * 2.57);
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let r = 0, g = 0, b = 0, a = 0, wsum = 0;
                for (let iy = y - rs; iy < y + rs + 1; iy++) {
                    for (let ix = x - rs; ix < x + rs + 1; ix++) {
                        const x1 = Math.min(width - 1, Math.max(0, ix));
                        const y1 = Math.min(height - 1, Math.max(0, iy));
                        const dsq = (ix - x) * (ix - x) + (iy - y) * (iy - y);
                        const wts = Math.exp(-dsq / (2 * radius * radius)) / (Math.PI * 2 * radius * radius);
                        const idx = (y1 * width + x1) * 4;
                        r += pixels[idx] * wts;
                        g += pixels[idx + 1] * wts;
                        b += pixels[idx + 2] * wts;
                        a += pixels[idx + 3] * wts;
                        wsum += wts;
                    }
                }
                const resIdx = (y * width + x) * 4;
                out[resIdx] = r / wsum;
                out[resIdx + 1] = g / wsum;
                out[resIdx + 2] = b / wsum;
                out[resIdx + 3] = a / wsum;
            }
        }
        return out;
    },

    boxblur: function(pixels, width, height, radius) {
        const out = new Uint8ClampedArray(pixels.length);
        const size = radius * 2 + 1;
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let r = 0, g = 0, b = 0, a = 0, count = 0;
                for (let iy = y - radius; iy <= y + radius; iy++) {
                    for (let ix = x - radius; ix <= x + radius; ix++) {
                        if (ix >= 0 && ix < width && iy >= 0 && iy < height) {
                            const idx = (iy * width + ix) * 4;
                            r += pixels[idx];
                            g += pixels[idx + 1];
                            b += pixels[idx + 2];
                            a += pixels[idx + 3];
                            count++;
                        }
                    }
                }
                const resIdx = (y * width + x) * 4;
                out[resIdx] = r / count;
                out[resIdx + 1] = g / count;
                out[resIdx + 2] = b / count;
                out[resIdx + 3] = a / count;
            }
        }
        return out;
    },

    sharpen: function(pixels, width, height, amount) {
        const out = new Uint8ClampedArray(pixels.length);
        const matrix = [0, -1, 0, -1, 5 + amount, -1, 0, -1, 0];
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                let r = 0, g = 0, b = 0;
                for (let sy = 0; sy < 3; sy++) {
                    for (let sx = 0; sx < 3; sx++) {
                        const idx = ((y + sy - 1) * width + (x + sx - 1)) * 4;
                        const wt = matrix[sy * 3 + sx];
                        r += pixels[idx] * wt;
                        g += pixels[idx + 1] * wt;
                        b += pixels[idx + 2] * wt;
                    }
                }
                const resIdx = (y * width + x) * 4;
                out[resIdx] = Math.min(255, Math.max(0, r));
                out[resIdx + 1] = Math.min(255, Math.max(0, g));
                out[resIdx + 2] = Math.min(255, Math.max(0, b));
                out[resIdx + 3] = pixels[resIdx + 3];
            }
        }
        return out;
    },

    unsharp: function(pixels, width, height, radius, amount) {
        const blurred = this.gblur(pixels, width, height, radius);
        const out = new Uint8ClampedArray(pixels.length);
        for (let i = 0; i < pixels.length; i += 4) {
            for (let j = 0; j < 3; j++) {
                const diff = pixels[i + j] - blurred[i + j];
                out[i + j] = Math.min(255, Math.max(0, pixels[i + j] + diff * amount));
            }
            out[i + 3] = pixels[i + 3];
        }
        return out;
    },

    OpticsCompensation: function(pixels, width, height, strength) {
        const out = new Uint8ClampedArray(pixels.length);
        const centerX = width / 2;
        const centerY = height / 2;
        const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const dx = x - centerX;
                const dy = y - centerY;
                const dist = Math.sqrt(dx * dx + dy * dy) / maxDist;
                const factor = 1 + strength * (dist * dist);
                const srcX = Math.floor(centerX + dx * factor);
                const srcY = Math.floor(centerY + dy * factor);
                const resIdx = (y * width + x) * 4;
                if (srcX >= 0 && srcX < width && srcY >= 0 && srcY < height) {
                    const srcIdx = (srcY * width + srcX) * 4;
                    out[resIdx] = pixels[srcIdx];
                    out[resIdx + 1] = pixels[srcIdx + 1];
                    out[resIdx + 2] = pixels[srcIdx + 2];
                    out[resIdx + 3] = pixels[srcIdx + 3];
                } else {
                    out[resIdx + 3] = 0;
                }
            }
        }
        return out;
    },

    RadialBlur: function(pixels, width, height, strength, centerX, centerY) {
        const out = new Uint8ClampedArray(pixels.length);
        const samples = 10;
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let r = 0, g = 0, b = 0, a = 0;
                for (let i = 0; i < samples; i++) {
                    const t = i / (samples - 1);
                    const scale = 1 - strength * t;
                    const srcX = Math.floor((x - centerX) * scale + centerX);
                    const srcY = Math.floor((y - centerY) * scale + centerY);
                    if (srcX >= 0 && srcX < width && srcY >= 0 && srcY < height) {
                        const idx = (srcY * width + srcX) * 4;
                        r += pixels[idx];
                        g += pixels[idx + 1];
                        b += pixels[idx + 2];
                        a += pixels[idx + 3];
                    }
                }
                const resIdx = (y * width + x) * 4;
                out[resIdx] = r / samples;
                out[resIdx + 1] = g / samples;
                out[resIdx + 2] = b / samples;
                out[resIdx + 3] = a / samples;
            }
        }
        return out;
    },

    LinearBlur: function(pixels, width, height, length, angle) {
        const out = new Uint8ClampedArray(pixels.length);
        const dx = Math.cos(angle);
        const dy = Math.sin(angle);
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let r = 0, g = 0, b = 0, a = 0, count = 0;
                for (let i = -length; i <= length; i++) {
                    const srcX = Math.floor(x + dx * i);
                    const srcY = Math.floor(y + dy * i);
                    if (srcX >= 0 && srcX < width && srcY >= 0 && srcY < height) {
                        const idx = (srcY * width + srcX) * 4;
                        r += pixels[idx];
                        g += pixels[idx + 1];
                        b += pixels[idx + 2];
                        a += pixels[idx + 3];
                        count++;
                    }
                }
                const resIdx = (y * width + x) * 4;
                out[resIdx] = r / count;
                out[resIdx + 1] = g / count;
                out[resIdx + 2] = b / count;
                out[resIdx + 3] = a / count;
            }
        }
        return out;
    },

    motionblur: function(pixels, width, height, velocityX, velocityY) {
        const out = new Uint8ClampedArray(pixels.length);
        const samples = 15;
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let r = 0, g = 0, b = 0, a = 0;
                for (let i = 0; i < samples; i++) {
                    const srcX = Math.floor(x - (velocityX * i) / samples);
                    const srcY = Math.floor(y - (velocityY * i) / samples);
                    if (srcX >= 0 && srcX < width && srcY >= 0 && srcY < height) {
                        const idx = (srcY * width + srcX) * 4;
                        r += pixels[idx];
                        g += pixels[idx + 1];
                        b += pixels[idx + 2];
                        a += pixels[idx + 3];
                    }
                }
                const resIdx = (y * width + x) * 4;
                out[resIdx] = r / samples;
                out[resIdx + 1] = g / samples;
                out[resIdx + 2] = b / samples;
                out[resIdx + 3] = a / samples;
            }
        }
        return out;
    }
};
