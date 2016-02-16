import RESTAdapter from './rest'

class FetchAdapter extends RESTAdapter {
  get (type, params) {
    const url = this.endpointFor(type, params)

    return fetch(url).then(response => {
      return this.isSuccess(response.status) ? response.json() : Promise.reject(response)
    })
  }
}

export default FetchAdapter
