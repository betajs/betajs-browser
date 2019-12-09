Scoped.define("module:Geometry", [], function() {
    return {
        /**
         *
         * @param videoWidth
         * @param videoHeight
         * @param embedWidth
         * @param embedHeight
         */
        padFitBoxInBox: function(videoWidth, videoHeight, embedWidth, embedHeight) {
            var videoAR = videoWidth / videoHeight;
            var embedAR = embedWidth / embedHeight;
            var scale = videoAR > embedAR ? (embedWidth / videoWidth) : (embedHeight / videoHeight);
            return {
                scale: scale,
                offsetX: videoAR < embedAR ? (embedWidth - videoWidth * scale) / 2 : 0,
                offsetY: videoAR > embedAR ? (embedHeight - videoHeight * scale) / 2 : 0
            };
        }
    }
});