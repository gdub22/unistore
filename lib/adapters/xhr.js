import RESTAdapter from './rest'

class XHRAdapter extends RESTAdapter {
  fetch (type, params, opts = {}) {
    return new Promise((resolve, reject) => {
      const url = this.endpointFor(type, params)
      const xhr = new XMLHttpRequest()

      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (this.isSuccess(xhr.status)) {
            try {
              resolve(JSON.parse(xhr.responseText))
            } catch (e) {
              reject(e)
            }
          } else {
            reject(xhr)
          }
        }
      }

      xhr.open(opts.method || 'GET', url)
      xhr.send(JSON.stringify(params))
    })
  }
}

export default XHRAdapter
