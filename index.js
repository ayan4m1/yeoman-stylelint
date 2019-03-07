const stylelint = require('stylelint');
const through = require('through2');

module.exports = function(options) {
  return through.obj(function(file, encoding, callback) {
    const lintOptions = Object.assign({}, options, {
      code: file.contents.toString(encoding),
      codeFilename: file.path
    });

    try {
      stylelint.lint(lintOptions).then(function() {
        callback(null, file);
      });
    } catch (error) {
      callback(error);
    }
  });
};
