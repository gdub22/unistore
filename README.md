# unistore [![Build Status](https://travis-ci.org/gdub22/unistore.svg)](https://travis-ci.org/gdub22/unistore)

unistore is simple isomorphic data fetching store and identity map.  It allows you to get external data from REST endpoints, and cache the results locally. In the browser, it uses window.fetch (if available) with a fallback to xhr.  In node, the http(s) module.

## Example
http://jsbin.com/wejizi/edit?js,output

## Install
`npm install unistore`  

## API

```js
import { Store } from 'unistore'
let store = new Store()
```

### register
Restister a resource type to store:
```js
store.register('person')
```
Here, you'll also typically register any arbitrary metadata you want with the type. `primaryKey` and `endpoints` are internal properties you can define to adapt to your REST service.
```js
store.register('person', {
  primaryKey: 'name', // default: 'id'
  endpoints: {
    one:  'https://api.example.com/person/:name',
    many: 'https://api.example.com/person/all'
  }
})
```

### lookup
Returns previously registered metadata for a resource type
```js
store.lookup('person')
```

### get
Gets cached records directly from the store (without attempting to fetch them externally).
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
`find` returns a Promise to resolve record(s). It first looks in the store for cached records (`get`), and if they don't exist, fetches them externally via the adapter and caches them. The Promises are expected to resolve with records, therefore, any non-successful http status codes during an adapter fetch will result in a rejected Promise.

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

**find/fetch also take a 3rd param for modifying request options:**
```js
store.fetch('person', 5, { method: 'POST' })
```

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
