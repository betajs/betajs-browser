Scoped.define("module:Canvas", [
    "base:Maths"
], function(Maths) {
    return {
        isCanvasBlack: function(canvas) {
            if (!canvas) throw Error("Missing canvas");
            var data = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
            var MAX_SAMPLE_SIZE = 10000;
            var sum = 0;
            var count = 0;
            if (canvas.width * canvas.height * 3 / 4 < MAX_SAMPLE_SIZE) { // sample all pixels
                sum = data.reduce(function(s, v, i) {
                    if (i && (i + 1) % 4 !== 0) {
                        s += v;
                        count++;
                    }
                    return s;
                });
                return sum / count < 10;
            } else { // random sampling
                count = MAX_SAMPLE_SIZE;
                for (var n = 0; n < MAX_SAMPLE_SIZE; n++) {
                    var i = Maths.randomInt(0, data.length);
                    while (i && (i + 1) % 4 === 0) i = Maths.randomInt(0, data.length);
                    sum += data[i];
                }
            }
            return sum / count < 10;
        },
        isImageBlack: function(image) {
            if (!image) throw Error("Missing image");
            var canvas = document.createElement("canvas");
            canvas.width = image.width;
            canvas.height = image.height;
            canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
            return this.isCanvasBlack(canvas);
        }
    };
});