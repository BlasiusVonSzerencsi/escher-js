'use strict';

var fs = require('fs');
var testConfig = require('./config');

function runTestFiles(topic, func) {
  testConfig.getTestSuites().forEach(function(testSuite) {
    using(testSuite, topic, func);
  });
}

function using(testSuite, topic, func) {
  /* jshint -W040 */
  var testFiles = testConfig.getTestFilesForSuite(testSuite, topic);
  for (var i = 0, count = testFiles.length; i < count; i++) {
    func.call(this, getTest(testSuite, testFiles[i]));
    jasmine.currentEnv_.currentSpec.description += ' (with "' + testSuite + '" using ' + testFiles[i] + ')';
  }
}

function getTest(testSuite, testFile) {
  var fileName = 'spec/' + testSuite + '_testsuite/' + testFile + '.json';
  var test = JSON.parse(fs.readFileSync(fileName, {
    encoding: 'utf-8'
  }));
  if (test.config.date) {
    test.config.date = new Date(test.config.date);
  }

  return test;
}

function createKeyDb(keyDBHash) {
  return function(accessKeyId) {
    return keyDBHash[accessKeyId];
  };
}

module.exports = {
  runTestFiles: runTestFiles,
  createKeyDb: createKeyDb
};
