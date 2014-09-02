'use strict';

var Signer = require('./signer'),
    Canonicalizer = require('./canonicalizer'),
    escherUtil = require('./escherutil');

var AuthHeaderBuilder = function (signerConfig) {

    function buildAuthParts(requestOptions, body) {
        var signer = new Signer(signerConfig);

        var signature = signer.calculateSignature(signer.getStringToSign(requestOptions, body), signer.calculateSigningKey());
        var signedHeaders = new Canonicalizer().getCanonicalizedSignedHeaders(requestOptions);
        var shortDate = escherUtil.toShortDate(signerConfig.date);

        return {
            signedHeaders: signedHeaders,
            shortDate: shortDate,
            signature: signature
        };
    }

    function buildAuthHeader(requestOptions, body) {
        var authParts = buildAuthParts(requestOptions, body);

        return signerConfig.algoPrefix + '-HMAC-' + signerConfig.hashAlgo.toUpperCase() +
            ' Credential=' + signerConfig.accessKeyId + '/' + authParts.shortDate + '/' + signerConfig.credentialScope +
            ', SignedHeaders=' + authParts.signedHeaders +
            ', Signature=' + authParts.signature;
    }

    return {
        build: buildAuthHeader
    };
};

module.exports = AuthHeaderBuilder;
