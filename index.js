const stylelint = require('stylelint');
const through = require('through2');

module.exports = function(options) {
  return through.obj(function(file, _, callback) {
    const lintOptions = Object.assign({}, options, {
      code: file.contents,
      codeFilename: file.path,
      fix: true
    });

    stylelint.lint(lintOptions).then(function() {
      callback(null, file);
    }, callback);
  });
};
