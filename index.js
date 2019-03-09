const fs = require('fs');

const stylelint = require('stylelint');
const through = require('through2');

/**
 * This should not be as complicated as it is.
 * Because stylelint does not seem to return a "fixed" CSS string, we
 * have to play games with the filesystem aimed at getting this to work
 * in a Yeoman transform stream.
 */
module.exports = function(options) {
  return through.obj(function(file, encoding, callback) {
    const lintOptions = Object.assign({}, options, {
      code: file.contents.toString(encoding),
      codeFilename: file.path
    });

    try {
      // first, check to see if the file needs linting
      stylelint.lint(lintOptions).then(function(result) {
        const lintResult = result.results.shift();

        if (lintResult && lintResult.errored) {
          // we need to write the file to disk before Yeoman does
          // so that stylelint can run in fix mode
          fs.writeFile(file.path, file.contents, err => {
            if (err) {
              return callback(err);
            }

            // now we are asking stylelint to fix the file we just wrote
            const fixOptions = Object.assign({}, options, {
              files: file.path,
              syntax: 'scss',
              fix: true
            });

            stylelint.lint(fixOptions).then(function() {
              // the fix is applied in-place, so Yeoman will overwrite
              // it with the incorrect version - so we have to read it
              // back and update the contents passed to Yeoman
              fs.readFile(file.path, (err, data) => {
                if (err) {
                  return callback(err);
                }

                file.contents = data;
                callback(null, file);
              });
            });
          });
        } else {
          // no need to lint the file
          callback(null, file);
        }
      });
    } catch (error) {
      callback(error);
    }
  });
};
