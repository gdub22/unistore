import RESTAdapter from './rest'

class FetchAdapter extends RESTAdapter {
  fetch (type, params, opts = {}) {
    const url = this.endpointFor(type, params)
    opts.body = JSON.stringify(opts.body || params)

    return fetch(url, opts).then(response => {
      return this.isSuccess(response.status) ? response.json() : Promise.reject(response)
    })
  }
}

export default FetchAdapter
