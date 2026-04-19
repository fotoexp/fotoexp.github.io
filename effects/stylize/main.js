const EdgeFilters = {
    convolve: function(data, width, height, kernel) {
        const side = Math.round(Math.sqrt(kernel.length));
        const halfSide = Math.floor(side / 2);
        const output = new Uint8ClampedArray(data.length);

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const dstOff = (y * width + x) * 4;
                let r = 0, g = 0, b = 0;

                for (let ky = 0; ky < side; ky++) {
                    for (let kx = 0; kx < side; kx++) {
                        const sy = y + ky - halfSide;
                        const sx = x + kx - halfSide;
                        if (sy >= 0 && sy < height && sx >= 0 && sx < width) {
                            const srcOff = (sy * width + sx) * 4;
                            const wt = kernel[ky * side + kx];
                            r += data[srcOff] * wt;
                            g += data[srcOff + 1] * wt;
                            b += data[srcOff + 2] * wt;
                        }
                    }
                }
                output[dstOff] = r;
                output[dstOff + 1] = g;
                output[dstOff + 2] = b;
                output[dstOff + 3] = data[dstOff + 3];
            }
        }
        return output;
    },

    edgedetect: function(data, width, height) {
        const kernel = [-1, -1, -1, -1, 8, -1, -1, -1, -1];
        return this.convolve(data, width, height, kernel);
    },

    Kirsch: function(data, width, height) {
        const output = new Uint8ClampedArray(data.length);
        const kernels = [
            [5, 5, 5, -3, 0, -3, -3, -3, -3],
            [5, 5, -3, 5, 0, -3, -3, -3, -3],
            [5, -3, -3, 5, 0, -3, 5, -3, -3],
            [-3, -3, -3, 5, 0, -3, 5, 5, 5],
            [-3, -3, -3, -3, 0, -3, 5, 5, 5],
            [-3, -3, -3, -3, 0, 5, -3, 5, 5],
            [-3, -3, 5, -3, 0, 5, -3, -3, 5],
            [-3, 5, 5, -3, 0, 5, -3, -3, -3]
        ];

        for (let i = 0; i < data.length; i += 4) {
            let max = 0;
            kernels.forEach(k => {
                const res = this.convolve(data.slice(i, i + 36), 3, 3, k);
                max = Math.max(max, res[4]);
            });
            output[i] = output[i+1] = output[i+2] = max;
            output[i+3] = data[i+3];
        }
        return output;
    },

    Laplace: function(data, width, height) {
        const kernel = [0, 1, 0, 1, -4, 1, 0, 1, 0];
        return this.convolve(data, width, height, kernel);
    },

    Prewitt: function(data, width, height) {
        const kx = [-1, 0, 1, -1, 0, 1, -1, 0, 1];
        const ky = [-1, -1, -1, 0, 0, 0, 1, 1, 1];
        const resX = this.convolve(data, width, height, kx);
        const resY = this.convolve(data, width, height, ky);
        const output = new Uint8ClampedArray(data.length);
        for (let i = 0; i < data.length; i++) {
            output[i] = Math.sqrt(resX[i] * resX[i] + resY[i] * resY[i]);
        }
        return output;
    },

    Roberts: function(data, width, height) {
        const k1 = [1, 0, 0, -1];
        const k2 = [0, 1, -1, 0];
        const output = new Uint8ClampedArray(data.length);
        for (let y = 0; y < height - 1; y++) {
            for (let x = 0; x < width - 1; x++) {
                const i = (y * width + x) * 4;
                const i1 = i, i2 = i + 4, i3 = i + (width * 4), i4 = i + (width * 4) + 4;
                const g1 = data[i1] - data[i4];
                const g2 = data[i2] - data[i3];
                const val = Math.sqrt(g1 * g1 + g2 * g2);
                output[i] = output[i+1] = output[i+2] = val;
                output[i+3] = data[i+3];
            }
        }
        return output;
    },

    Robertison: function(data, width, height) {
        return this.Roberts(data, width, height);
    },

    ConvolutionKernel: function(data, width, height, kernel) {
        return this.convolve(data, width, height, kernel);
    },

    Scharr: function(data, width, height) {
        const kx = [-3, 0, 3, -10, 0, 10, -3, 0, 3];
        const ky = [-3, -10, -3, 0, 0, 0, 3, 10, 3];
        const resX = this.convolve(data, width, height, kx);
        const resY = this.convolve(data, width, height, ky);
        const output = new Uint8ClampedArray(data.length);
        for (let i = 0; i < data.length; i++) {
            output[i] = Math.sqrt(resX[i] * resX[i] + resY[i] * resY[i]);
        }
        return output;
    }
};
