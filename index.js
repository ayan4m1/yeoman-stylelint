import stylelint from 'stylelint';
import { Transform } from 'readable-stream';
import { readFile, writeFile } from 'fs/promises';

const { lint } = stylelint;

export default function (options) {
  return new Transform({
    objectMode: true,
    async transform(file, encoding, callback) {
      const lintOptions = {
        ...options,
        code: file.contents.toString(encoding),
        codeFilename: file.path
      };

      try {
        const result = await lint(lintOptions);
        const lintResult = result.results.shift();

        if (lintResult && lintResult.errored) {
          // we need to write the file to disk before Yeoman does
          // so that stylelint can run in fix mode
          await writeFile(file.path, file.contents);

          // now we are asking stylelint to fix the file we just wrote
          const fixOptions = Object.assign({}, options, {
            files: file.path,
            syntax: 'scss',
            fix: true
          });

          await lint(fixOptions);

          // the fix is applied in-place, so Yeoman will overwrite
          // it with the incorrect version - so we have to read it
          // back and update the contents passed to Yeoman
          readFile(file.path, (err, data) => {
            if (err) {
              return callback(err);
            }

            file.contents = data;
            callback(null, file);
          });
        } else {
          // no need to lint the file
          callback(null, file);
        }
      } catch (error) {
        callback(error);
      }
    }
  });
}
