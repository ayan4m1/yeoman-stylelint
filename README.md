# yeoman-stylelint

This package seeks to solve a single problem. Using [gulp-stylelint](https://github.com/olegskl/gulp-stylelint) as a Yeoman transform stream causes a crash if there are any conflicts during the Yeoman run. I want to pre-lint my SCSS so that it doesn't come out of the tin broken.

## usage

First, require/import the module:

```js
const stylelint = require('yeoman-stylelint');

import stylelint from 'yeoman-stylelint';
```

Then, in your generator constructor, add something similar to:

```js
this.registerTransformStream(
  gulpIf(
    /\.scss$/,
    stylelint({ configFile: path.join(__dirname, '..', '.stylelintrc' }))
  )
);
```

Now, all `.scss` files that are written by Yeoman will be preprocessed with stylelint, automatically fixing what it can.
