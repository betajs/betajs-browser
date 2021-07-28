Scoped.define("module:Upload.S3MultipartSupport", [
    "base:Maths"
], function(Maths) {
    var MIN_CHUNK_SIZE = 5 * 1024 * 1024; // 5 MB
    var MAX_CHUNK_SIZE = 5 * 1024 * 1024 * 1024; // 5 GB
    var MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024 * 1024; // 5 TB
    var MAX_NUMBER_OF_CHUNKS = 10000;
    var DEFAULT_CHUNK_SIZE = 50 * 1024 * 1024; // 50 MB
    var MAX_FILE_SIZE_FOR_DEFAULT_CHUNK_SIZE = DEFAULT_CHUNK_SIZE * MAX_NUMBER_OF_CHUNKS;

    return {
        /**
         * Split file into multiple chunks that respect AWS limits for multipart upload.
         * @param {Blob | File} file
         * @param {Object} [options]
         * @param {number} options.numberOfChunks
         * @param {number} options.chunkSize
         * @returns {Blob[]} array of chunks
         */
        chunkFile: function(file, options) {
            if (!this.validateFileSize(file.size)) {
                return [];
            }

            var chunkSize = file.size > MAX_FILE_SIZE_FOR_DEFAULT_CHUNK_SIZE ? MAX_CHUNK_SIZE : DEFAULT_CHUNK_SIZE;
            
            if (options.chunkSize) {
                chunkSize = this.clampChunkSize(options.chunkSize);
                var numberOfChunks = this.calculateNumberOfChunks(file.size, chunkSize);
                if (options.numberOfChunks && numberOfChunks > this.clampNumberOfChunks(options.numberOfChunks)) {
                    // chunk size is too small for the current number of chunks, we are prioritizing number of chunks over chunk size
                    chunkSize = this.clampChunkSize(this.calculateChunkSize(file.size, this.clampNumberOfChunks(options.numberOfChunks)));
                }
            } else if (options.numberOfChunks) {
                chunkSize = this.clampChunkSize(this.calculateChunkSize(file.size, this.clampNumberOfChunks(options.numberOfChunks)));
            }

            var startPointer = 0;
            var endPointer = file.size;
            var chunks = [];
            while (startPointer < endPointer) {
                chunks.push(file.slice(startPointer, startPointer + chunkSize));
                startPointer = startPointer + chunkSize;
            }
            return chunks;
        },

        /**
         * Sort parts by part number, as AWS require them to be sent in order.
         * @param {Object[]} parts - list of parts
         * @param {string} parts[].ETag - the part's ETag response header, which is sent after successfull part upload
         * @param {number} parts[].PartNumber - the part's part number
         * @returns {Object[]}
         */
        sortParts: function(parts) {
            return parts.sort(function(prevPart, nextPart) {
                return prevPart.PartNumber < nextPart.PartNumber ? -1 : 1;
            });
        },

        /**
         * Validate whether file size is within AWS limits for multipart upload.
         * @param {number} fileSize - file size in bytes
         * @returns {boolean}
         */
        validateFileSize: function(fileSize) {
            return fileSize > 0 && fileSize <= MAX_FILE_SIZE;
        },

        /**
         * Validate whether chunk size is within AWS limits for multipart upload.
         * @param {number} chunkSize - chunk size in bytes
         * @returns {boolean}
         */
        validateChunkSize: function(chunkSize) {
            return chunkSize >= MIN_CHUNK_SIZE && chunkSize <= MAX_CHUNK_SIZE;
        },

        /**
         * Validate whether number of chunks is within AWS limits for multipart upload.
         * @param {number} numberOfChunks
         * @returns {boolean}
         */
        validateNumberOfChunks: function(numberOfChunks) {
            return numberOfChunks >= 1 && numberOfChunks <= MAX_NUMBER_OF_CHUNKS;
        },

        /**
         * Calculate chunk size, given the file size and number of chunks.
         * @param {number} fileSize - file size in bytes
         * @param {number} numberOfChunks
         * @returns {number} chunk size in bytes
         */
        calculateChunkSize: function(fileSize, numberOfChunks) {
            return Math.ceil(fileSize / numberOfChunks);
        },

        /**
         * Calculate number of chunks, given the file size and chunk size.
         * @param {number} fileSize - file size in bytes
         * @param {number} chunkSize - chunk size in bytes
         * @returns {number}
         */
        calculateNumberOfChunks: function(fileSize, chunkSize) {
            return Math.ceil(fileSize / (chunkSize || DEFAULT_CHUNK_SIZE));
        },

        /**
         * Clamp chunk size using AWS limits as upper and lower bounds.
         * @param {number} chunkSize
         * @returns {number} clamped chunk size
         */
        clampChunkSize: function(chunkSize) {
            return Maths.clamp(chunkSize, MIN_CHUNK_SIZE, MAX_CHUNK_SIZE);
        },

        /**
         * Clamp number of chunks using AWS limits as upper and lower bounds.
         * @param {number} numberOfChunks
         * @returns {number} clamped number of chunks
         */
        clampNumberOfChunks: function(numberOfChunks) {
            return Maths.clamp(numberOfChunks, 1, MAX_NUMBER_OF_CHUNKS);
        }
    };
});