import assert from 'assert'
import { Store, RESTAdapter } from '../../dist/unistore'

describe('RESTAdapter base class', function () {
  it('can not directly create instances', function () {
    assert.throws(function () {
      return new RESTAdapter()
    })
  })

  it('can be subclassed', function () {
    class FooAdapter extends RESTAdapter { }
    const adapter = new FooAdapter()
    assert.ok(adapter instanceof FooAdapter)
    assert.ok(adapter instanceof RESTAdapter)
  })

  it('can register endpoints', function () {
    class FooAdapter extends RESTAdapter { }
    const adapter = new FooAdapter()
    const endpoints = { one: 'foo', many: 'bar' }

    adapter.registerEndpoints('person', endpoints)
    assert.equal(endpoints.one, adapter.endpointFor('person', 1))
    assert.equal(endpoints.many, adapter.endpointFor('person'))
  })

  it('can register endpoints via store', function () {
    class FooAdapter extends RESTAdapter { }
    const adapter = new FooAdapter()
    const store = new Store({ adapter })
    const endpoints = { one: 'foo', many: 'bar' }

    store.register('person', { endpoints })
    assert.equal(endpoints.one, adapter.endpointFor('person', 1))
    assert.equal(endpoints.many, adapter.endpointFor('person'))
  })

  it('can lookup correct endpoints based on params', function () {
    class FooAdapter extends RESTAdapter { }
    const adapter = new FooAdapter()
    const endpoints = {
      one: 'http://foo.com/person/:id',
      many: 'http://foo.com/person'
    }
    adapter.registerEndpoints('person', endpoints)

    assert.equal(endpoints.many, adapter.endpointFor('person'))
    assert.equal('http://foo.com/person?limit=20&order=desc', adapter.endpointFor('person', { limit: 20, order: 'desc' }))
    assert.equal('http://foo.com/person/1', adapter.endpointFor('person', 1))
    assert.equal('http://foo.com/person/1?include=bio', adapter.endpointFor('person', { id: 1, include: 'bio' }))
  })

  it('can lookup correct endpoints when changing primary id', function () {
    class FooAdapter extends RESTAdapter { }
    const adapter = new FooAdapter()
    const endpoints = {
      one: 'http://foo.com/person/:name',
      many: 'http://foo.com/person'
    }
    const store = new Store({ adapter })
    store.register('person', { endpoints, primaryKey: 'name' })

    assert.equal('http://foo.com/person/joe', adapter.endpointFor('person', 'joe'))
  })

  it('can build query strings correctly', function () {
    class FooAdapter extends RESTAdapter { }
    const adapter = new FooAdapter()

    assert.equal('http://foo.com', adapter.buildUrl('http://foo.com'))
    assert.equal('http://foo.com', adapter.buildUrl('http://foo.com', {}))
    assert.equal('http://foo.com?foo=bar&baz=1', adapter.buildUrl('http://foo.com', { foo: 'bar', baz: 1 }))
    assert.equal('http://foo.com?foo=bar&baz=1', adapter.buildUrl('http://foo.com?', { foo: 'bar', baz: 1 }))
    assert.equal('http://foo.com?api_key=123&foo=bar&baz=1', adapter.buildUrl('http://foo.com?api_key=123', { foo: 'bar', baz: 1 }))
  })
})
