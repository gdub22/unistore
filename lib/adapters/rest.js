class RESTAdapter {
  constructor () {
    this._endpointMap = {}
    if (this.constructor.name === 'RESTAdapter') throw TypeError('RESTAdapter is a base class')
  }

  registerEndpoints (type, endpoints) {
    this._endpointMap[type] = endpoints
    return this
  }

  isSuccess (status) {
    return !!(status && status < 400)
  }

  endpointFor (type, params) {
    const typeEndpoints = this._endpointMap[type]

    if (typeEndpoints) {
      const endpointOne = typeEndpoints.one
      const endpointMany = typeEndpoints.many
      const typeofParams = typeof params
      let dynamicSegments, keySegment, keyName, keyValue

      if (typeofParams === 'undefined') {
        return endpointMany
      }

      if (endpointOne) {
        dynamicSegments = endpointOne.match(/:\w+/g)
        if (dynamicSegments) {
          keySegment = dynamicSegments[dynamicSegments.length - 1]
          keyName = keySegment.slice(1)
          keyValue = params[keyName]
        }
      }

      if (typeofParams === 'object') {
        if (keyValue === undefined) {
          return this.buildUrl(endpointMany, params)
        }

        delete params[keyName]
        return this.buildUrl(endpointOne.replace(keySegment, keyValue), params)
      }

      return endpointOne.replace(keySegment, params)
    }
  }

  buildUrl (url, data) {
    const query = []
    for (let prop in data) {
      if (data.hasOwnProperty(prop)) {
        query.push(encodeURIComponent(prop) + '=' + encodeURIComponent(data[prop]))
      }
    }

    if (query.length) {
      const indexOfQuestionMark = url.indexOf('?')
      if (indexOfQuestionMark === -1) {
        url += '?'
      } else if (indexOfQuestionMark !== url.length - 1) {
        url += '&'
      }

      url += query.join('&')
    }
    return url
  }
}

export default RESTAdapter
