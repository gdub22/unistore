import FakeXMLHttpRequest from 'fake-xml-http-request'
import { XHRAdapter } from '../../dist/unistore'
import RESTAdapterSpecs from './rest-specs'

const originalSend = FakeXMLHttpRequest.prototype.send

function shimResponse (opts) {
  FakeXMLHttpRequest.prototype.send = function () {
    originalSend.apply(this, arguments)
    setTimeout(() => { // simulate a request
      const responseText = typeof opts.data === 'object' ? JSON.stringify(opts.data) : opts.data
      this.respond(opts.status, opts.headers, responseText)
    }, 1)
  }
  global.XMLHttpRequest = FakeXMLHttpRequest
}

function unshimResponse () {
  global.XMLHttpRequest = undefined
}

describe('XHRAdapter', function () {
  RESTAdapterSpecs(new XHRAdapter(), shimResponse, unshimResponse)
})
