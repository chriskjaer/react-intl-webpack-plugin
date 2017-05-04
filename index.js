var sortBy = require('lodash.sortby')
var merge = require('lodash.merge')
var createOutputWriter = require('./lib/createOutputWriter')
var createQueuedWriter = require('./lib/createQueuedWriter')

function collapseWhitespace(str) {
  return str.replace(/[\s\n]+/g, ' ')
}

function ReactIntlPlugin(options) {
  this.options = merge(
    {},
    {
      path: '.',
      prettyPrint: true,
      sortKeys: true,
      collapseWhitespace: false,
      filename: 'reactIntlMessages.json',
    },
    options
  )
  this.writer = createQueuedWriter(createOutputWriter(this.options))
}

ReactIntlPlugin.prototype = {
  constructor: ReactIntlPlugin,

  apply: function(compiler) {
    var messages = []
    var options = this.options
    var writer = this.writer

    compiler.plugin('compilation', function(compilation) {
      compilation.plugin('normal-module-loader', function(context) {
        context.metadataReactIntlPlugin = function(metadata) {
          messages = messages.concat(metadata['react-intl'].messages)
        }
      })
    })

    compiler.plugin('emit', function(compilation, callback) {
      messages = options.sortKeys ? sortBy(messages, 'id') : messages
      var output = messages.reduce(function(result, m) {
        if (m.defaultMessage) {
          m.defaultMessage = m.defaultMessage.trim()
          if (options.collapseWhitespace) {
            m.defaultMessage = collapseWhitespace(m.defaultMessage)
          }
          result[m.id] = m.defaultMessage
        }
        return result
      }, {})

      writer(output, function(err) {
        if (err) {
          compilation.errors.push(err)
        }
        callback()
      })
    })
  },
}

module.exports = ReactIntlPlugin
module.exports.metadataContextFunctionName = 'metadataReactIntlPlugin'
