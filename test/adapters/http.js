import nock from 'nock'
import { HTTPAdapter } from '../../dist/unistore'
import RESTAdapterSpecs from './rest-specs'

function shimResponse (opts) {
  nock('https://api.example.com').get(/.*/).reply(opts.status, opts.data)
}

function unshimResponse () {
  nock.isDone()
  nock.cleanAll()
}

describe('HTTPAdapter', function () {
  RESTAdapterSpecs(new HTTPAdapter(), shimResponse, unshimResponse)
})
