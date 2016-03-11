# unistore [![Build Status](https://travis-ci.org/gdub22/unistore.svg)](https://travis-ci.org/gdub22/unistore)

unistore is simple in-memory data store and identity map.  You can also add adapters to fetch data from an external source.

## Install
`npm install unistore`  

## API

```js
import Store from 'unistore'
let store = new Store()
```

### register
Restister a resource type to store:
```js
store.register('person')
```
Here, you'll also typically register any arbitrary metadata you want with the type, e.g. a `primaryKey`
```js
store.register('person', {
  primaryKey: 'name', // default: 'id'
})
```

### lookup
Returns previously registered metadata for a resource type
```js
store.lookup('person')
```

### get
Gets cached records directly from the store (without attempting to fetch them from an adapter).
```js
store.get('person', 1) // => 'person' record with primary key `1`
store.get('person') // => Array of all 'person' records
store.get('dog', 1) // => undefined
```

### push
Manually push records into the store. You can push a single record, or an array of records:
```js
let record = { id: 1, name: 'John' }
store.push('person', record)

var records = [
  { id: 2, name: 'Jane' },
  { id: 3, name: 'Jim' }
]
store.push('person', records)
store.get('person').length // => 3
```

### clear
Clears all data from the local cache
```js
store.clear()
```

### find
`find` returns a Promise to resolve record(s). It first looks in the store for cached records (`get`), and if they don't exist, fetches them externally via the adapter and caches them.

```js
store.find('person').then((records) => {
  // records: Array of all 'person' records
})

store.find('person', 1).then((record) => {
  // record: 'person' record with primary key `1`
})

store.find('person', { limit: 20 }).then((records) => {
  // records: Array of filtered 'person' records
})
```
**You can call `fetch` directly if you want to bypass first looking for cached records in the store.**

### onTransformOne / onTransformMany
Register a function to transform data before pushing into the store.  
```js
// Example 1: Storing models, instead of raw data in the store
function Person () { ... }
store.register('person', { modelClass: Person })

store.onTransformOne(function(type, data) {
  let Model = store.lookup(type).modelClass
  return new Model(data)
})

store.push('person', { id: 1, name: 'John' })
store.get('person', 1) // => Person instance

// Example 2: Your backend does not directly return an array when fetching many records:
store.onTransformMany(function(type, data) {
  return data.people
})
```

## Immutability
Store data is only mutable by itself internally, or through the `store.push` method.  For example:
```js
let person = store.get('person', 1) // => { id: 1, name: 'John' }
person.name = 'Bob'

store.get('person', 1) // => { id: 1, name: 'John' }

store.push('person', person)
store.get('person', 1) // => { id: 1, name: 'Bob' }
```

## Build
```shell
npm run build
```

## Test
```shell
npm test
```
