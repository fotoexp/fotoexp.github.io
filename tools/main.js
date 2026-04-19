const CanvasLib = (function() {
    let canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');
    let layersList = [canvas];

    return {
        size: function(w, h) {
            canvas.width = w;
            canvas.height = h;
            return canvas;
        },

        paint: function(color) {
            ctx.fillStyle = color;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        },

        text: function(str, x, y, font, color) {
            ctx.font = font;
            ctx.fillStyle = color;
            ctx.fillText(str, x, y);
        },

        erase: function(x, y, w, h) {
            ctx.clearRect(x, y, w, h);
        },

        gradient: function(x0, y0, x1, y1, stops) {
            let grad = ctx.createLinearGradient(x0, y0, x1, y1);
            stops.forEach(s => grad.addColorStop(s.offset, s.color));
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        },

        transform2d: function(a, b, c, d, e, f) {
            ctx.setTransform(a, b, c, d, e, f);
        },

        zoom: function(scale, x, y) {
            ctx.translate(x, y);
            ctx.scale(scale, scale);
            ctx.translate(-x, -y);
        },

        layers: function(count) {
            layersList = Array.from({ length: count }, () => {
                let l = document.createElement('canvas');
                l.width = canvas.width;
                l.height = canvas.height;
                return l;
            });
            return layersList;
        },

        layersrgba: function(index, r, g, b, a) {
            let lCtx = layersList[index].getContext('2d');
            let data = lCtx.createImageData(canvas.width, canvas.height);
            for (let i = 0; i < data.data.length; i += 4) {
                data.data[i] = r;
                data.data[i + 1] = g;
                data.data[i + 2] = b;
                data.data[i + 3] = a;
            }
            lCtx.putImageData(data, 0, 0);
            ctx.drawImage(layersList[index], 0, 0);
        }
    };
})();
