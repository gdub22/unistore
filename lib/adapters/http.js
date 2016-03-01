import RESTAdapter from './rest'

let http, https, url
if (typeof window === 'undefined' && typeof require !== 'undefined') {
  http = require('http')
  https = require('https')
  url = require('url')
}

class HTTPAdapter extends RESTAdapter {
  fetch (type, params, opts = {}) {
    return new Promise((resolve, reject) => {
      const endpoint = this.endpointFor(type, params)
      const parsedUrl = url.parse(endpoint)
      const httpModule = parsedUrl.protocol === 'https:' ? https : http

      for (let prop in parsedUrl) {
        if (parsedUrl.hasOwnProperty(prop)) {
          opts[prop] = parsedUrl[prop]
        }
      }

      const request = httpModule.request(opts, (response) => {
        const status = response.statusCode
        let body = ''

        // normalizes 'status' property with other adapters
        response.status = status

        if (this.isSuccess(status)) {
          response.on('data', function (data) { body += data })
          response.on('end', function () {
            try {
              resolve(JSON.parse(body))
            } catch (e) {
              reject(e)
            }
          })
        } else {
          reject(response)
        }
      })

      request.on('error', reject)
      request.write(JSON.stringify(params))
      request.end()
    })
  }
}

export default HTTPAdapter
