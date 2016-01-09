import RESTAdapter from './rest'

class XHRAdapter extends RESTAdapter {
  get (type, params) {
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

      xhr.open('GET', url)
      xhr.send()
    })
  }
}

export default XHRAdapter
