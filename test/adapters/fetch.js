import fetchMock from 'fetch-mock'
import { FetchAdapter } from '../../dist/unistore'
import RESTAdapterSpecs from './rest-specs'

function shimResponse (opts) {
  fetchMock.mock(/https:\/\/api\.example\.com.*/i, { status: opts.status, headers: opts.headers, body: opts.data })
}

function unshimResponse () {
  fetchMock.restore()
}

describe('FetchAdapter', function () {
  RESTAdapterSpecs(new FetchAdapter(), shimResponse, unshimResponse)
})
