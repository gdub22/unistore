# unistore [![Build Status](https://travis-ci.org/gdub22/unistore.svg)](https://travis-ci.org/gdub22/unistore)

unistore is simple isomorphic data fetching store and identity map.  It allows you to get external data from REST endpoints, and cache the results locally. In the browser, it uses window.fetch (if available) with a fallback to xhr.  In node, the http(s) module.

## Example
http://jsbin.com/wejizi/edit?js,output

## Install
`npm install unistore`  

## API

### create
```js
import { Store } from 'unistore'
let store = new Store()
```

### register
Restister a resource type to store:
```js
store.register('person')
```
Here, you also register metadata with the type:
```js
store.register('person', {
  // internal meta
  primaryKey: 'name', // defaults to 'id'
  endpoints: {        // for adapter external data fetching
    one:  'https://api.example.com/person/:name',
    many: 'https://api.example.com/person/all'
  },

  // any other custom metadata
  klass: Person,
  foo: 'bar'
})
```

### find / fetch
`store.find` first looks in the store for cached records, and then if they don't exist, fetches them externally via the adapter and caches them. You can call `fetch` directly if you want to bypass looking for cached records in the store.  Both methods return Promises.
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
#### Responses and error handling
find/fetch Promises are expected to resolve with records.  Therefore, any non successful http status codes will reject the Promise.  Errors will be normalized between the different adapters.

### get
Gets cached records directly from the store (without attempting to use adapters).
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

### transform
Registers a function to transform data before pushing into store.

For example, if you want to store records as model class instances instead of just raw data. Or if your find many request doesnt directly return an array: 
```js
store.transform(function(data, typeMeta, requestType) {
  // typeMeta is any metadata added during `store.register`
  // requestType is a string 'one' or 'many'
  if (requestType === 'one') {
    return typeMeta.klass.create(data)
  } else if (requestType === 'many') {
    return data.persons
  }
})

store.push('person', { id: 1, name: 'John' })
store.get('person', 1) // => Person instance
```

### Immutablilty
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
