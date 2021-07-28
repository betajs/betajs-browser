QUnit.module("S3 Multipart Support", function() {

    QUnit.test("validate file size", function(assert) {
        assert.equal(false, BetaJS.Browser.Upload.S3MultipartSupport.validateFileSize(-1));
        assert.equal(false, BetaJS.Browser.Upload.S3MultipartSupport.validateFileSize(6 * 1024 * 1024 * 1024 * 1024));
        assert.equal(true, BetaJS.Browser.Upload.S3MultipartSupport.validateFileSize(10 * 1024 * 1024));
    });
    
    QUnit.test("validate chunk size", function(assert) {
        assert.equal(false, BetaJS.Browser.Upload.S3MultipartSupport.validateChunkSize(1));
        assert.equal(false, BetaJS.Browser.Upload.S3MultipartSupport.validateChunkSize(1024 * 1024 * 1024 * 1024));
        assert.equal(true, BetaJS.Browser.Upload.S3MultipartSupport.validateChunkSize(10 * 1024 * 1024));
    });
    
    QUnit.test("validate number of chunks", function(assert) {
        assert.equal(false, BetaJS.Browser.Upload.S3MultipartSupport.validateNumberOfChunks(-1));
        assert.equal(false, BetaJS.Browser.Upload.S3MultipartSupport.validateNumberOfChunks(10001));
        assert.equal(true, BetaJS.Browser.Upload.S3MultipartSupport.validateNumberOfChunks(100));
    });
    
    QUnit.test("calculate chunk size", function(assert) {
        assert.equal(10 * 1024 * 1024, BetaJS.Browser.Upload.S3MultipartSupport.calculateChunkSize(20 * 1024 * 1024, 2));
    });
    
    QUnit.test("calculate number of chunks", function(assert) {
        assert.equal(1, BetaJS.Browser.Upload.S3MultipartSupport.calculateNumberOfChunks(5 * 1024 * 1024, 5 * 1024 * 1024));
        assert.equal(2, BetaJS.Browser.Upload.S3MultipartSupport.calculateNumberOfChunks(10 * 1024 * 1024, 6 * 1024 * 1024));
        assert.equal(3, BetaJS.Browser.Upload.S3MultipartSupport.calculateNumberOfChunks(11 * 1024 * 1024, 5 * 1024 * 1024));
    });

    QUnit.test("clamp chunk size", function(assert) {
        minChunkSize = 5 * 1024 * 1024; // 5 MB
        maxChunkSize = 5 * 1024 * 1024 * 1024; // 5 GB
        assert.equal(minChunkSize, BetaJS.Browser.Upload.S3MultipartSupport.clampChunkSize(minChunkSize - 1000));
        assert.equal(maxChunkSize, BetaJS.Browser.Upload.S3MultipartSupport.clampChunkSize(maxChunkSize + 1000));
        assert.equal(50 * 1024 * 1024, BetaJS.Browser.Upload.S3MultipartSupport.clampChunkSize(50 * 1024 * 1024));
    });

    QUnit.test("clamp number of chunks", function(assert) {
        maxNumberOfChunks = 10000;
        assert.equal(1, BetaJS.Browser.Upload.S3MultipartSupport.clampNumberOfChunks(0));
        assert.equal(5, BetaJS.Browser.Upload.S3MultipartSupport.clampNumberOfChunks(5));
        assert.equal(maxNumberOfChunks, BetaJS.Browser.Upload.S3MultipartSupport.clampNumberOfChunks(maxNumberOfChunks + 10));
    });

    QUnit.test("chunk file", function(assert) {
        var fileSize = 1024 * 1024 * 1024; // 1 GB
        var file = new Blob([new ArrayBuffer(fileSize)], {type: "application/octet-stream"});

        var expectedChunkSize = 50 * 1024 * 1024; // 50 MB
        var chunks = BetaJS.Browser.Upload.S3MultipartSupport.chunkFile(file, {
            chunkSize: expectedChunkSize
        });
        assert.equal(true, BetaJS.Browser.Upload.S3MultipartSupport.validateNumberOfChunks(chunks.length));
        assert.equal(expectedChunkSize, chunks[0].size);
        assert.equal(true, chunks[0] instanceof Blob || chunks[0] instanceof File);

        var expectedNumberOfChunks = 5;
        chunks = BetaJS.Browser.Upload.S3MultipartSupport.chunkFile(file, {
            numberOfChunks: expectedNumberOfChunks
        });
        assert.equal(expectedNumberOfChunks, chunks.length);
        assert.equal(true, BetaJS.Browser.Upload.S3MultipartSupport.validateChunkSize(chunks[0].size));
        assert.equal(true, chunks[0] instanceof Blob || chunks[0] instanceof File);
    });

    QUnit.test("sort parts", function(assert) {
        var parts = [
            {"ETag":"4e242339fe4017e68b0a70d98a50e967","PartNumber":3},
            {"ETag":"a1e5e4f1a5628904520f5a48f32972c3","PartNumber":5},
            {"ETag":"0ce520d0272ced4e39321afcd797af2e","PartNumber":2},
            {"ETag":"93f4e29f079c02b28238a1268eec152a","PartNumber":4},
            {"ETag":"6bf096b251142fae7fbcca06d9dac26b","PartNumber":1}
        ];

        assert.deepEqual(BetaJS.Browser.Upload.S3MultipartSupport.sortParts(parts), [
            {"ETag":"6bf096b251142fae7fbcca06d9dac26b","PartNumber":1},
            {"ETag":"0ce520d0272ced4e39321afcd797af2e","PartNumber":2},
            {"ETag":"4e242339fe4017e68b0a70d98a50e967","PartNumber":3},
            {"ETag":"93f4e29f079c02b28238a1268eec152a","PartNumber":4},
            {"ETag":"a1e5e4f1a5628904520f5a48f32972c3","PartNumber":5}
        ]);
    });
});