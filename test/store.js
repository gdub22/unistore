import assert from 'assert'
import { Store } from '../dist/unistore'

const preloadData = [
  { id: 1, name: 'John' },
  { id: 2, name: 'Jane' },
  { id: 3, name: 'Jim' }
]

function preloadStore (store) {
  store = store || new Store()
  store.register('person')
  store.push('person', preloadData)
  return store
}

function Person (data) {
  return {
    id: 'id_' + data.id,
    name: data.name.toUpperCase()
  }
}

describe('Store', function () {
  it('can create instances', function () {
    const store1 = new Store()
    const store2 = new Store()

    assert.ok(store1 instanceof Store)
    assert.ok(store2 instanceof Store)
    assert.notEqual(store1, store2)
  })

  it('can register and lookup types', function () {
    const store = new Store()
    const Foo = {}

    store.register('person', Person)
    store.register('foo', Foo)
    store.register('bar')

    assert.deepEqual(store.lookup('person'), Person)
    assert.deepEqual(store.lookup('foo'), Foo)
    assert.deepEqual(store.lookup('bar'), {})
  })

  it('can update registry', function () {
    const store = new Store()
    store.register('person')
    assert.deepEqual(store.lookup('person'), {})

    store.push('person', preloadData)

    store.register('person', { foo: 'bar' })
    assert.deepEqual(store.lookup('person'), { foo: 'bar' })
    assert.deepEqual(store.get('person'), preloadData)
  })

  it('can be cleared of data', function () {
    const store = preloadStore()
    store.clear()

    assert.equal(undefined, store.get('person', 1))
    assert.equal(0, store.get('person').length)
    assert.notEqual(undefined, store.lookup('person')) // registry still exists
  })

  it('can push records', function () {
    const store = new Store()
    store.register('person')

    let result = store.push('person', preloadData[0])
    assert.deepEqual(result, preloadData[0])
    assert.equal(1, store.get('person').length)
    assert.equal('John', store.get('person', 1).name)

    result = store.push('person', preloadData)
    assert.deepEqual(result, preloadData)
    assert.equal(3, store.get('person').length)
  })

  it('can get records', function () {
    const store = preloadStore()
    assert.deepEqual(preloadData[0], store.get('person', 1))
    assert.deepEqual(preloadData, store.get('person'))
  })

  it('returns an empty array when explictly requesting multiple records but has no results', function () {
    const store = new Store()
    assert.equal(undefined, store.get('person'))
    store.register('person')
    assert.deepEqual([], store.get('person'))
    assert.deepEqual([], store.get('person', { limit: 10 }))
  })

  it('data is not directly mutable', function () {
    const store = preloadStore()
    let record = store.get('person', 1)
    record.name = 'Bob'
    assert.equal('John', store.get('person', 1).name)

    const records = store.get('person')
    records[0].name = 'Rick'
    assert.equal('John', store.get('person', 1).name)

    record = store.push('person', { id: 4, name: 'Susan' })
    record.name = 'Sue'
    assert.equal('Susan', store.get('person', 4).name)
  })

  it('can update records via push', function () {
    const store = preloadStore()
    const record = store.get('person', 1)
    record.name = 'Bob'
    store.push('person', record)
    assert.equal('Bob', store.get('person', 1).name)
  })

  it('can register functions to transform records before storing', function () {
    const store = new Store()

    store.onTransformOne((type, data) => {
      return store.lookup(type)(data)
    })

    store.register('person', Person)

    store.push('person', preloadData[0])
    assert.equal(1, store.get('person').length)
    assert.equal('JOHN', store.get('person', 'id_1').name)

    store.push('person', preloadData)
    assert.equal(3, store.get('person').length)
    assert.equal('JANE', store.get('person', 'id_2').name)
  })

  it('can correctly register one or many transforms', function () {
    const store = new Store()
    let count = 0

    store.onTransformOne((type, data) => {
      count++
      return data
    })

    store.onTransformMany((type, data) => {
      count++
      return data
    })

    store.register('person')
    store.push('person', preloadData)
    assert.equal(count, 4)
  })

  it('can manually run transforms without pushing to store', function () {
    const store = new Store()
    store.register('person', Person)

    store.onTransformOne((type, data) => {
      return store.lookup(type)(data)
    })

    const record = store.transform('person', preloadData[0])
    assert.equal('JOHN', record.name)
    assert.equal('id_1', record.id)
    assert.equal(0, store.get('person').length)
  })

  it('throws when calling a non-existant adapter', function () {
    const store = new Store({ adapter: null })
    return store.find('person', 99999).catch(function (e) {
      assert(true)
    })
  })

  it('can find a cached record', function () {
    const store = preloadStore()
    return store.find('person', 1).then(function (record) {
      assert.deepEqual(preloadData[0], record)
    })
  })

  it('can find many cached records', function () {
    const store = preloadStore()
    return store.find('person').then(function (records) {
      assert.deepEqual(preloadData, records)
    })
  })

  it('can change the primaryKey for all types', function () {
    const store = preloadStore(new Store({ primaryKey: 'name' }))
    assert.deepEqual(preloadData[0], store.get('person', 'John'))
    assert.deepEqual(undefined, store.get('person', 1))
  })

  it('can change the primaryKey for a single type', function () {
    const store = new Store()
    store.register('person', { primaryKey: 'name' })
    store.push('person', preloadData)
    assert.deepEqual(preloadData[0], store.get('person', 'John'))
    assert.deepEqual(undefined, store.get('person', 1))
  })
})
