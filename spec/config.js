var config = {
  aws4: {
    signature: [
      'get-vanilla',
      'post-vanilla',
      'get-vanilla-query',
      'post-vanilla-query',
      'get-vanilla-empty-query-key',
      'post-vanilla-empty-query-value',
      'get-vanilla-query-order-key',
      'post-x-www-form-urlencoded',
      'post-x-www-form-urlencoded-parameters',
      'get-header-value-trim',
      'post-header-key-case',
      'post-header-key-sort',
      'post-header-value-case',
      'get-vanilla-query-order-value',
      'get-vanilla-query-order-key-case',
      'get-unreserved',
      'get-vanilla-query-unreserved',
      'get-vanilla-ut8-query',
      'get-utf8',
      'get-space',
      'post-vanilla-query-space',
      'post-vanilla-query-nonunreserved',
      'get-slash',
      'get-slashes',
      'get-slash-dot-slash',
      'get-slash-pointless-dot',
      'get-relative',
      'get-relative-relative'
    ],
    authenticate: []
  },
  emarsys: {
    signature: [
      'get-header-key-duplicate',
      'get-header-value-order',
      'post-header-key-order',
      'post-header-value-spaces',
      'post-header-value-spaces-within-quotes',
      'post-payload-utf8'
    ],
    authenticate: [
      'valid-authentication-datein-expiretime',
      'valid-get-vanilla-empty-query'
    ]
  }
};

function getTestSuites() {
  return Object.keys(config);
}

function getTestFilesForSuite(testSuite, topic) {
  return config[testSuite][topic];
}

module.exports = {
  getTestSuites: getTestSuites,
  getTestFilesForSuite: getTestFilesForSuite
};
