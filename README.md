# @chriskjaer/react-intl-webpack-plugin

Thanks to @Ognian and @jdcrensh for their previous work on this.

This plugin helps when using react-intl for internationalization of react apps.

## Fork

This fork adds a few options for generating the JSON output:

* Changes JSON output to be simple key-value pairs
* Orders outputted keys alphabetically
* Removes all whitespace from values, i.e. spaces and newlines in multiline ES6 strings.
* Custom filename
* Custom output path
* Pretty printing
* Prepend folder name to id

## Workflow

1. Use `<FormattedMessage id="newItem" defaultMessage="Add item" />` for adding text in your react components.
2. Use the babel plugin `babel-plugin-react-intl` to extract them from your source code.
3. Use `react-intl-webpack-plugin` to combine them into one message file called `reactIntlMessages.json` and put this file into the webpack output path.

## Installation

- this works only with babel-loader >= 6.4.0
- you will need also the babel plugin `babel-plugin-react-intl`

webpack.config.js:
- add the plugin
```javascript
var ReactIntlPlugin = require('react-intl-webpack-plugin');
// ...
plugins: [
  // ...
  new ReactIntlPlugin({
    // see options section
  })
],
```
- modify your babel-loader to contain the `metadataSubscribers` option
```javascript
module: {
  // ...
  rules: [
    // ...
    {
      test: /\.jsx?$/,
      use: [{
        loader: 'babel-loader',
        options: {
          presets: [['es2015', { 'modules': false }], 'react', 'stage-0'],
          plugins: [
            ['react-intl', {
              messagesDir: path.resolve(__dirname, 'dist', 'i18n')
            }]
          ],
          metadataSubscribers: [ReactIntlPlugin.metadataContextFunctionName],
          cacheDirectory: true
        }
      }]
    }
  ]
}
```

- the generated file is called `<options.path || .>/reactIntlMessages.json`

## Options

`sortKeys` (boolean, default `true`): If true, sorts JSON output by message id

`flatOutput` (boolean, default `false`): If true, outputs as a simple key-value pair, i.e. `{'key1': 'text', 'key2': 'text'}`

`collapseWhitespace` (boolean, default `false`): If true, collapses all inner whitespace and newlines. Useful for ES6 multiline template literals.

`path` (string, default `.`): defines the output path

`filename` (string, default `reactIntlMessages.json`): the filename of the
messages file

`prettyPrint`: (boolean, default `true`): Pretty prints the json file

`prependFolderNameToID`: (boolean, default `false`): finds the folder name of
the file and prepends that to the ID. 
e.g. an ID inside the component folder `Footer` with an id of: `.button` will be
converted to `Footer.button`. The feature have been made opt-in with the use of
`.`. This enables the feature to gradually added, and allows developers to opt
out in case of a folder rename.

Make sure `extractSourceLocation` is set to `true` when using this feature


## Notes

- Keep in mind that as long as you use webpack-dev-server all assets are generated in memory. To access those assets use either:
    - the browser an check http://localhost:devServerPort/reactIntlMessages.json
    - or, add a script to package.json like `"trans:refreshJsonDEV": "curl localhost:3100/reactIntlMessages.json >./dist/reactIntlMessages.json"`
    - or start your webpack build to generate the assets into the build directory.

- If no messages are generated it could be helpful to cleanup the `cacheDirectory` of the babel-loader, or set `"cacheDirectory": false` temporarily

## License

MIT (http://www.opensource.org/licenses/mit-license.php)
