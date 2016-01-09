import RESTAdapter from './rest'

let http, https
if (typeof window === 'undefined' && typeof require !== 'undefined') {
  http = require('http')
  https = require('https')
}

function httpProtocolModuleForUrl (url) {
  return url.match(/^(?:http(s?)\:\/\/)?/i)[0] === 'https://' ? https : http
}

class HTTPAdapter extends RESTAdapter {
  get (type, params) {
    return new Promise((resolve, reject) => {
      const url = this.endpointFor(type, params)

      httpProtocolModuleForUrl(url).get(url, (response) => {
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
      }).on('error', reject)
    })
  }
}

export default HTTPAdapter
