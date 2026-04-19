const ImageFilters = {
    shear: function(data, width, height, factorX, factorY) {
        const copy = new Uint8ClampedArray(data);
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const nx = Math.floor(x + factorX * y);
                const ny = Math.floor(y + factorY * x);
                if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                    const target = (y * width + x) * 4;
                    const source = (ny * width + nx) * 4;
                    data[target] = copy[source];
                    data[target + 1] = copy[source + 1];
                    data[target + 2] = copy[source + 2];
                    data[target + 3] = copy[source + 3];
                }
            }
        }
        return data;
    },

    wave: function(data, width, height, amplitude, wavelength) {
        const copy = new Uint8ClampedArray(data);
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const xs = Math.floor(x + amplitude * Math.sin((2 * Math.PI * y) / wavelength));
                const ys = y;
                const target = (y * width + x) * 4;
                if (xs >= 0 && xs < width && ys >= 0 && ys < height) {
                    const source = (ys * width + xs) * 4;
                    data[target] = copy[source];
                    data[target + 1] = copy[source + 1];
                    data[target + 2] = copy[source + 2];
                    data[target + 3] = copy[source + 3];
                }
            }
        }
        return data;
    },

    swirl: function(data, width, height, centerX, centerY, radius, angle) {
        const copy = new Uint8ClampedArray(data);
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const dx = x - centerX;
                const dy = y - centerY;
                const d = Math.sqrt(dx * dx + dy * dy);
                if (d < radius) {
                    const a = Math.atan2(dy, dx) + (angle * (radius - d)) / radius;
                    const xs = Math.floor(centerX + d * Math.cos(a));
                    const ys = Math.floor(centerY + d * Math.sin(a));
                    if (xs >= 0 && xs < width && ys >= 0 && ys < height) {
                        const target = (y * width + x) * 4;
                        const source = (ys * width + xs) * 4;
                        data[target] = copy[source];
                        data[target + 1] = copy[source + 1];
                        data[target + 2] = copy[source + 2];
                        data[target + 3] = copy[source + 3];
                    }
                }
            }
        }
        return data;
    },

    melt: function(data, width, height, density) {
        for (let x = 0; x < width; x++) {
            const offset = Math.floor(Math.random() * density);
            for (let y = height - 1; y >= offset; y--) {
                const target = (y * width + x) * 4;
                const source = ((y - offset) * width + x) * 4;
                data[target] = data[source];
                data[target + 1] = data[source + 1];
                data[target + 2] = data[source + 2];
                data[target + 3] = data[source + 3];
            }
        }
        return data;
    },

    polarCoordinates: function(data, width, height) {
        const copy = new Uint8ClampedArray(data);
        const centerX = width / 2;
        const centerY = height / 2;
        const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY);
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const dx = x - centerX;
                const dy = y - centerY;
                const r = Math.sqrt(dx * dx + dy * dy);
                const a = Math.atan2(dy, dx) + Math.PI;
                const xs = Math.floor((a / (2 * Math.PI)) * (width - 1));
                const ys = Math.floor((r / maxRadius) * (height - 1));
                const target = (y * width + x) * 4;
                const source = (ys * width + xs) * 4;
                data[target] = copy[source];
                data[target + 1] = copy[source + 1];
                data[target + 2] = copy[source + 2];
                data[target + 3] = copy[source + 3];
            }
        }
        return data;
    },

    kaleidoscope: function(data, width, height, segments) {
        const copy = new Uint8ClampedArray(data);
        const centerX = width / 2;
        const centerY = height / 2;
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const dx = x - centerX;
                const dy = y - centerY;
                const r = Math.sqrt(dx * dx + dy * dy);
                let a = Math.atan2(dy, dx);
                const segmentAngle = (2 * Math.PI) / segments;
                a = ((a % segmentAngle) + segmentAngle) % segmentAngle;
                if (a > segmentAngle / 2) a = segmentAngle - a;
                const xs = Math.floor(centerX + r * Math.cos(a));
                const ys = Math.floor(centerY + r * Math.sin(a));
                const target = (y * width + x) * 4;
                const source = (Math.min(height - 1, Math.max(0, ys)) * width + Math.min(width - 1, Math.max(0, xs))) * 4;
                data[target] = copy[source];
                data[target + 1] = copy[source + 1];
                data[target + 2] = copy[source + 2];
                data[target + 3] = copy[source + 3];
            }
        }
        return data;
    },

    mirror: function(data, width, height, horizontal) {
        const copy = new Uint8ClampedArray(data);
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let xs = x;
                let ys = y;
                if (horizontal && x > width / 2) xs = width - x;
                if (!horizontal && y > height / 2) ys = height - y;
                const target = (y * width + x) * 4;
                const source = (ys * width + xs) * 4;
                data[target] = copy[source];
                data[target + 1] = copy[source + 1];
                data[target + 2] = copy[source + 2];
                data[target + 3] = copy[source + 3];
            }
        }
        return data;
    },

    zigZag: function(data, width, height, amplitude, period) {
        const copy = new Uint8ClampedArray(data);
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const offset = amplitude * Math.abs((x % period) - period / 2);
                const ys = Math.floor(y + offset);
                if (ys < height) {
                    const target = (y * width + x) * 4;
                    const source = (ys * width + x) * 4;
                    data[target] = copy[source];
                    data[target + 1] = copy[source + 1];
                    data[target + 2] = copy[source + 2];
                    data[target + 3] = copy[source + 3];
                }
            }
        }
        return data;
    }
};
