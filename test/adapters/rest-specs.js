import assert from 'assert'
import { Store, RESTAdapter } from '../../dist/unistore'

const preloadData = [
  { id: 1, name: 'John' },
  { id: 2, name: 'Jane' },
  { id: 3, name: 'Jim' }
]

const remoteData = [
  { id: 4, name: 'Dan' }
]

function preloadStore (adapter, data) {
  const store = new Store({ adapter })
  store.register('person', {
    endpoints: {
      one: 'https://api.example.com/people/:id',
      many: 'https://api.example.com/people'
    }
  })
  store.push('person', data || preloadData)
  return store
}

export default function (adapter, shimResponse, unshimResponse) {
  afterEach(unshimResponse)

  function shimSuccess () {
    shimResponse({ status: 200, headers: { 'Content-Type': 'application/json' }, data: remoteData[0] })
  }

  it('can create instances', function () {
    assert.ok(adapter)
    assert.ok(adapter instanceof RESTAdapter)
  })

  it('can directly fetch a record and store it', function () {
    shimSuccess()
    const store = preloadStore(adapter)
    return store.fetch('person', 4).then(function (record) {
      assert.deepEqual(record, remoteData[0])
      assert.deepEqual(record, store.get('person', 4))
    })
  })

  it('can fetch a record when not found in the store', function () {
    shimSuccess()
    const store = preloadStore(adapter)
    return store.find('person', 4).then(function (record) {
      assert.deepEqual(record, remoteData[0])
      assert.deepEqual(record, store.get('person', 4))
    })
  })

  it('returns an empty array when explictly requesting multiple records but has no results', function () {
    shimSuccess()
    const store = preloadStore(adapter, [])
    return store.find('person').then(function (records) {
      assert.deepEqual(records, [])
    })
  })

  it('can get a record and bypass the store', function () {
    shimSuccess()
    const store = preloadStore(adapter)
    return adapter.get('person', 4).then(function (record) {
      assert.deepEqual(record, remoteData[0])
      assert.equal(undefined, store.get('person', 4))
    })
  })

  describe('Error handling', function () {
    it('reports http error status', function (done) {
      shimResponse({ status: 500 })
      adapter.get('person').then().catch(function (error) {
        assert.equal(error.status, 500)
        done()
      })
    })

    it('errors on non-200 response', function (done) {
      shimResponse({ status: 403 })
      const store = preloadStore(adapter)
      store.fetch('person').then().catch(function (error) {
        assert.equal(error.status, 403)
        done()
      })
    })

    it('errors with successful status but bad data', function (done) {
      shimResponse({ status: 200, data: '}{bad' })
      adapter.get('person').then().catch(function (error) {
        assert.ok(error)
        done()
      })
    })
  })
}
