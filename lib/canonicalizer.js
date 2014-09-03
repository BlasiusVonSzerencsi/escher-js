"use strict";

var crypto = require('crypto'),
    path = require('path'),
    url = require('url'),
    normalizeHeaders = require('./escherutil').normalizeHeaders;

var Canonicalizer = function () {
    // node 0.11 urlencodes caret as %5E
    var haveToFixCaretAtUrlParser = url.parse('^').href!=='^';

    // PRIVATE METHODS

    function canonicalizeHeaders(headers) {
        return Object.keys(headers).map(function(key){
            return key + ':' + headers[key];
        });
    }

    function canonicalizeSignedHeaders(headers) {
        return Object.keys(headers);
    }

    function canonicalizeQuery(query) {
        return Object.keys(query).map(function(key){
            var value = query[key];
            if (typeof value === "string") {
                return joinQueryKeyValue(key, value);
            } else {
                return value.sort().map(function(one_value){
                    return joinQueryKeyValue(key, one_value);
                }).join('&');
            }
        }).sort().join('&');
    }

    function joinQueryKeyValue(key, value) {
        if (haveToFixCaretAtUrlParser) {
            key = key.replace('%5E', '^');
            value = value.replace('%5E', '^');
        }
        return encodeURIComponent(key) + '=' + encodeURIComponent(value);
    }

    function prepareUri(uri) {
        // https://github.com/joyent/node/blob/4b59db008cec1bfcca2783f4b27c630c9c3fdd73/lib/url.js#L113-L117
        return uri.replace('#', '%23').replace('\\', '%5C');
    }

    function canonicalizePath(pathname) {
        return path.normalize(pathname);
    }

    // PUBLIC METHODS

    function canonicalizeRequest(requestOptions, body, headersToSign) {
        var parsedUrl = url.parse(prepareUri(requestOptions.uri), true);
        var headers = filterHeaders(normalizeHeaders(requestOptions.headers), headersToSign);
        return [
            requestOptions.method.toUpperCase(),
            canonicalizePath(parsedUrl.pathname),
            canonicalizeQuery(parsedUrl.query),
            canonicalizeHeaders(headers).join("\n"),
            '',
            canonicalizeSignedHeaders(headers).join(';'),
            crypto.createHash("sha256").update(body).digest("hex")
        ].join("\n");
    }

    function filterHeaders(headers, headersToSign) {
        var filteredHeaders = {};
        var normalizedSignedHeaders = headersToSign
            .map(Function.prototype.call, String.prototype.toLowerCase);

        Object.keys(headers).forEach(function (headerName) {
            if (normalizedSignedHeaders.indexOf(headerName) !== -1) {
                filteredHeaders[headerName] = headers[headerName];
            }
        });
        return filteredHeaders;
    }

    function getCanonicalizedSignedHeaders(headers, headersToSign) {
        var normalizedHeaders = filterHeaders(normalizeHeaders(headers), headersToSign);
        return canonicalizeSignedHeaders(normalizedHeaders);
    }

    return {
        canonicalizeRequest: canonicalizeRequest,
        getCanonicalizedSignedHeaders: getCanonicalizedSignedHeaders
    };

};

module.exports = Canonicalizer;
