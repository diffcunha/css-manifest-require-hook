var fs = require('fs');
var path = require('path');
var parent = require('parent-package-json');

var parentPackageJson = parent(__dirname);
if (!parentPackageJson.path) {
  console.log('Could not find parent module');
  process.exit(0);
}

var manifestPath = process.env.CSS_MANIFEST || parentPackageJson.parse().cssManifest;
if (!manifestPath) {
  console.log('CSS manifest file is missing. Please set CSS_JSON_MANIFEST env variable or `cssManifest` property in package.json');
  process.exit(0);
}

var rootPath = path.dirname(parentPackageJson.path);
var manifestAbsolutePath = path.join(rootPath, manifestPath);
var manifest = require(manifestAbsolutePath);

var existingHook = require.extensions['.css'];
require.extensions['.css'] = function cssManifestHook(m, filename) {
  var key = path.relative(rootPath, filename);
  var obj = manifest[key];
  return m._compile(`module.exports = ${JSON.stringify(obj)}`, filename);
}
