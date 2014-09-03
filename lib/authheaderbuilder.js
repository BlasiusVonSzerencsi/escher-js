'use strict';

var Signer = require('./signer'),
    Canonicalizer = require('./canonicalizer'),
    escherUtil = require('./escherutil'),
    url = require('url');

var AuthHeaderBuilder = function (signerConfig) {

    function buildAuthParts(requestOptions, requestBody) {
        var signer = new Signer(signerConfig);

        return {
            shortDate: escherUtil.toShortDate(signerConfig.date),
            signerConfig: signerConfig,
            signedHeaders: new Canonicalizer().getCanonicalizedSignedHeaders(requestOptions),
            signature: signer.calculateSignature(signer.getStringToSign(requestOptions, requestBody), signer.calculateSigningKey())
        };
    }

    function buildHeader(authParts) {
        return authParts.signerConfig.algoPrefix + '-HMAC-' + authParts.signerConfig.hashAlgo.toUpperCase() +
            ' Credential=' + generateFullCredentials(authParts.signerConfig, authParts.shortDate) +
            ', SignedHeaders=' + formatSignedHeaders(authParts.signedHeaders) +
            ', Signature=' + authParts.signature;
    }

    function generateHeader(requestOptions, body) {
        return buildHeader(buildAuthParts(requestOptions, body));
    }

    function generatePreSignedUrl(requestUrl, expires) {
        var parsedUrl = url.parse(requestUrl);
        var requestOptions = {
            host: parsedUrl.host,
            method: 'GET',
            uri: parsedUrl.path,
            headers: [['Host', parsedUrl.host]]
        };

        var params = {};
        params[getParamKey('Algorithm')] = [signerConfig.algoPrefix, 'HMAC', signerConfig.hashAlgo.toUpperCase()].join('-');
        params[getParamKey('Credentials')] = generateFullCredentials(signerConfig, escherUtil.toShortDate(signerConfig.date));
        params[getParamKey('Date')] = escherUtil.toLongDate(signerConfig.date);
        params[getParamKey('Expires')] = expires;
        params[getParamKey('SignedHeaders')] = formatSignedHeaders(new Canonicalizer().getCanonicalizedSignedHeaders(requestOptions));

        Object.keys(params).forEach(function (key) {
            requestUrl = appendQueryParamToUrl(requestUrl, key, params[key]);
        });

        var signer = new Signer(signerConfig);
        requestOptions.uri = url.parse(requestUrl).path;
        params[getParamKey('Signature')] = signer.calculateSignature(signer.getStringToSign(requestOptions, 'UNSIGNED-PAYLOAD'), signer.calculateSigningKey());
        return  appendQueryParamToUrl(requestUrl, getParamKey('Signature'), params[getParamKey('Signature')]);
    }

    function getParamKey(paramName) {
        return ['X', signerConfig.vendorKey, paramName].join('-');
    }

    function appendQueryParamToUrl(url, key, value) {
        if (url.indexOf('?' > -1)) {
            url = url + '&';
        } else {
            url = url + '?';
        }
        return url + encodeURIComponent(key) + '=' + encodeURIComponent(value);
    }

    function generateFullCredentials(signerConfig, shortDate) {
        return [signerConfig.accessKeyId, shortDate, signerConfig.credentialScope].join('/');
    }

    function formatSignedHeaders(signedHeaders) {
        return signedHeaders.map(Function.prototype.call, String.prototype.toLowerCase).sort().join(';');
    }

    function parseAuthHeader(authHeader, requestDate, keyDB) {
        var regex = new RegExp(signerConfig.algoPrefix.toUpperCase() + "-HMAC-([A-Z0-9\\,]+) Credential=([A-Za-z0-9\\-_]+)\/([0-9]{8})\/([A-Za-z0-9\\-_\/]+), SignedHeaders=([A-Za-z\\-;]+), Signature=([0-9a-f]+)$");
        var matches = authHeader.match(regex);

        if (!matches) {
            throw new Error('Could not parse auth header!');
        }

        var parsedSignerConfig = {
            algoPrefix: signerConfig.algoPrefix,
            date: requestDate,
            hashAlgo: matches[1].toLowerCase(),
            accessKeyId: matches[2],
            apiSecret: keyDB(matches[2]),
            credentialScope: matches[4]
        };


        return {
            shortDate: matches[3],
            signerConfig: parsedSignerConfig,
            signedHeaders: matches[5].split(';'),
            signature: matches[6]
        };

    }

    return {
        generateHeader: generateHeader,
        buildHeader: buildHeader,
        buildAuthParts: buildAuthParts,
        parseAuthHeader: parseAuthHeader,
        generatePreSignedUrl: generatePreSignedUrl
    };
};

module.exports = AuthHeaderBuilder;
