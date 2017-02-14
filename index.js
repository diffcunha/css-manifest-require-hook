var fs = require('fs');
var path = require('path');
var Module = require('module');
var parent = require('parent-package-json');

var parentPackageJson = parent(__dirname);
if (!parentPackageJson.path) {
  console.log('Could not find parent module');
  process.exit(0);
}

var cssManifest = parentPackageJson.parse().cssManifest;
if (!cssManifest || !cssManifest.path) {
  console.log('CSS manifest file is missing. Please set CSS_JSON_MANIFEST env variable or `cssManifest` property in package.json');
  process.exit(0);
}

var rootDir = path.dirname(parentPackageJson.path);
var manifestPath = path.join(rootDir, cssManifest.path);
var base = cssManifest.base ? path.join(rootDir, cssManifest.base) : rootDir;

var manifest = require(manifestPath);

var originalLoader = Module._load;

Module._load = function(request, parent) {
  if (!request.endsWith('.css')) {
    return originalLoader.apply(this, arguments);
  }

  var dirname = path.dirname(parent.filename);
  var filename = path.join(dirname, request);
  var key = path.relative(base, filename);

  if (!manifest[key]) {
    return originalLoader.apply(this, arguments);
  }

  return manifest[key];
};
