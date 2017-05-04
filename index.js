var sortBy = require('lodash.sortby')

function collapseWhitespace(str) {
  return str.replace(/[\s\n]+/g, ' ')
}

function ReactIntlPlugin(options) {
  this.options = options || {}
  if (this.options.sortKeys == null) {
    this.options.sortKeys = true
  }
  if (this.options.collapseWhitespace == null) {
    this.options.collapseWhitespace = false
  }
  if (this.options.filename == null) {
    this.options.filename = 'reactIntlMessages'
  }
}

ReactIntlPlugin.prototype.apply = function(compiler) {
  var messages = []
  var options = this.options

  compiler.plugin('compilation', function(compilation) {
    compilation.plugin('normal-module-loader', function(context) {
      context.metadataReactIntlPlugin = function(metadata) {
        messages = messages.concat(metadata['react-intl'].messages)
      }
    })
  })

  compiler.plugin('emit', function(compilation, callback) {
    messages = options.sortKeys ? sortBy(messages, 'id') : messages
    var jsonMessages = messages.reduce(function(result, m) {
      if (m.defaultMessage) {
        m.defaultMessage = m.defaultMessage.trim()
        if (options.collapseWhitespace) {
          m.defaultMessage = collapseWhitespace(m.defaultMessage)
        }
        result[m.id] = m.defaultMessage
      }
      return result
    }, {})

    var jsonString = JSON.stringify(jsonMessages, undefined, 2)

    compilation.assets[options.filename + '.json'] = {
      source: function() {
        return jsonString
      },
      size: function() {
        return jsonString.length
      },
    }

    callback()
  })
}

module.exports = ReactIntlPlugin
module.exports.metadataContextFunctionName = 'metadataReactIntlPlugin'
