'use strict';

var Canonicalizer = require('../lib/canonicalizer'),
    testConfig = require('./test_config'),
    specHelper = require('./spec_helper'),
    using = specHelper.using,
    TestFileParser = specHelper.TestFileParser,
    readTestFile = specHelper.readTestFile;

describe('Canonicalizer', function () {
    describe('canonicalizeRequest', function () {
        Object.keys(testConfig).forEach(function (testSuite) {
            using(testSuite + ' test files', testConfig[testSuite].files, function (testFile) {
                it('should canonicalize the requests', function () {

                    var testFileParser = new TestFileParser(readTestFile(testSuite, testFile, 'req'));
                    var body = testFileParser.getBody();
                    var headers = testFileParser.getHeaders();

                    var options = {
                        method: testFileParser.getMethod(),
                        host: testFileParser.getHost(headers),
                        uri: testFileParser.getUri(),
                        headers: headers
                    };

                    var canonicalizedRequest = new Canonicalizer().canonicalizeRequest(options, body);

                    expect(canonicalizedRequest).toBe(readTestFile(testSuite, testFile, 'creq'));
                });
            });
        });
    });
});
