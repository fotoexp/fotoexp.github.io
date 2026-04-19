const ImageFilters = {
    huesat: function(data, hue, saturation) {
        const h = hue / 360;
        const s = saturation / 100;
        for (let i = 0; i < data.length; i += 4) {
            let r = data[i] / 255, g = data[i + 1] / 255, b = data[i + 2] / 255;
            const max = Math.max(r, g, b), min = Math.min(r, g, b);
            let l = (max + min) / 2;
            let d = max - min;
            let h_val, s_val = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
            if (d === 0) h_val = 0;
            else if (max === r) h_val = ((g - b) / d) % 6;
            else if (max === g) h_val = (b - r) / d + 2;
            else h_val = (r - g) / d + 4;
            h_val = (h_val * 60 + hue) % 360;
            if (h_val < 0) h_val += 360;
            s_val = Math.min(1, Math.max(0, s_val + s));
            const c = (1 - Math.abs(2 * l - 1)) * s_val;
            const x = c * (1 - Math.abs((h_val / 60) % 2 - 1));
            const m = l - c / 2;
            let nr, ng, nb;
            if (h_val < 60) [nr, ng, nb] = [c, x, 0];
            else if (h_val < 120) [nr, ng, nb] = [x, c, 0];
            else if (h_val < 180) [nr, ng, nb] = [0, c, x];
            else if (h_val < 240) [nr, ng, nb] = [0, x, c];
            else if (h_val < 300) [nr, ng, nb] = [x, 0, c];
            else [nr, ng, nb] = [c, 0, x];
            data[i] = (nr + m) * 255;
            data[i + 1] = (ng + m) * 255;
            data[i + 2] = (nb + m) * 255;
        }
        return data;
    },

    invert: function(data) {
        for (let i = 0; i < data.length; i += 4) {
            data[i] = 255 - data[i];
            data[i + 1] = 255 - data[i + 1];
            data[i + 2] = 255 - data[i + 2];
        }
        return data;
    },

    tint: function(data, color, strength) {
        const rT = parseInt(color.substring(1, 3), 16);
        const gT = parseInt(color.substring(3, 5), 16);
        const bT = parseInt(color.substring(5, 7), 16);
        const s = strength / 100;
        for (let i = 0; i < data.length; i += 4) {
            data[i] = data[i] * (1 - s) + rT * s;
            data[i + 1] = data[i + 1] * (1 - s) + gT * s;
            data[i + 2] = data[i + 2] * (1 - s) + bT * s;
        }
        return data;
    },

    tritone: function(data, shadow, mid, high) {
        const parse = (hex) => [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
        const s = parse(shadow), m = parse(mid), h = parse(high);
        for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            if (avg < 128) {
                const t = avg / 128;
                data[i] = s[0] + (m[0] - s[0]) * t;
                data[i + 1] = s[1] + (m[1] - s[1]) * t;
                data[i + 2] = s[2] + (m[2] - s[2]) * t;
            } else {
                const t = (avg - 128) / 127;
                data[i] = m[0] + (h[0] - m[0]) * t;
                data[i + 1] = m[1] + (h[1] - m[1]) * t;
                data[i + 2] = m[2] + (h[2] - m[2]) * t;
            }
        }
        return data;
    },

    quadtone: function(data, c1, c2, c3, c4) {
        const parse = (hex) => [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
        const p = [parse(c1), parse(c2), parse(c3), parse(c4)];
        for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            const idx = Math.min(2, Math.floor(avg / 85));
            const t = (avg % 85) / 85;
            data[i] = p[idx][0] + (p[idx + 1][0] - p[idx][0]) * t;
            data[i + 1] = p[idx][1] + (p[idx + 1][1] - p[idx][1]) * t;
            data[i + 2] = p[idx][2] + (p[idx + 1][2] - p[idx][2]) * t;
        }
        return data;
    },

    thermal: function(data) {
        for (let i = 0; i < data.length; i += 4) {
            const g = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i] = Math.max(0, Math.min(255, (g < 128) ? 0 : (g - 128) * 2));
            data[i + 1] = Math.max(0, Math.min(255, (g < 64) ? g * 4 : (g < 192) ? 255 : (255 - g) * 4));
            data[i + 2] = Math.max(0, Math.min(255, (g < 128) ? 255 - (g * 2) : 0));
        }
        return data;
    },

    channelmixer: function(data, rr, rg, rb, gr, gg, gb, br, bg, bb) {
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i], g = data[i + 1], b = data[i + 2];
            data[i] = r * rr + g * rg + b * rb;
            data[i + 1] = r * gr + g * gg + b * gb;
            data[i + 2] = r * br + g * bg + b * bb;
        }
        return data;
    },

    contrast: function(data, value) {
        const factor = (259 * (value + 255)) / (255 * (259 - value));
        for (let i = 0; i < data.length; i += 4) {
            data[i] = factor * (data[i] - 128) + 128;
            data[i + 1] = factor * (data[i + 1] - 128) + 128;
            data[i + 2] = factor * (data[i + 2] - 128) + 128;
        }
        return data;
    },

    brightness: function(data, value) {
        for (let i = 0; i < data.length; i += 4) {
            data[i] += value;
            data[i + 1] += value;
            data[i + 2] += value;
        }
        return data;
    }
};
