import clone from './utils/clone'
import autoAdapter from './adapters/auto'

class Store {
  constructor (opts = {}) {
    this.primaryKey = opts.primaryKey || 'id'
    this.adapter = opts.adapter || autoAdapter()
    this._registry = {}
    this._data = {}
    this._transforms = []
  }

  register (name, opts) {
    const data = this._data
    const endpoints = opts && opts.endpoints

    this._registry[name] = opts || {}
    data[name] = data[name] || {}

    if (endpoints) {
      this.adapter.registerEndpoints(name, endpoints)
    }

    return this
  }

  lookup (name) {
    return this._registry[name]
  }

  transform (fnc) {
    if (typeof fnc === 'function') {
      this._transforms.push(fnc)
    }
  }

  get (type, params) {
    if (this._isManyRequest(type, params)) {
      return this._getMany(...arguments)
    }
    return this._getByKey(...arguments)
  }

  push (type, records) {
    if (Array.isArray(records)) {
      return this._pushMany(...arguments)
    }
    return this._pushOne(...arguments)
  }

  find (type, params) {
    if (this._isManyRequest(type, params)) {
      return this._findMany(...arguments)
    }
    return this._findByKey(...arguments)
  }

  fetch (type, params) {
    if (this._isManyRequest(type, params)) {
      return this._fetchMany(...arguments)
    }
    return this._fetchByKey(...arguments)
  }

  /**
   * Private
   */

  _isManyRequest (type, params) {
    const typeofParams = typeof params
    return typeofParams === 'undefined' ||
          (typeofParams === 'object' && !params[this._primaryKeyForType(type)])
  }

  _primaryKeyForType (type) {
    const typeOpts = this.lookup(type)
    return typeOpts && typeOpts.primaryKey || this.primaryKey
  }

  _getByKey (type, key) {
    const typeStore = this._data[type]
    const record = typeStore && typeStore[key]
    if (record) {
      return clone(record)
    }
  }

  _getMany (type, params) {
    const typeStore = this._data[type]
    if (typeStore) {
      const keys = Object.keys(typeStore)
      if (keys.length) {
        return keys.map(key => this._getByKey(type, key))
      }
    }
  }

  _pushOne (type, record) {
    record = this._applyTransforms(type, record, 'one')
    if (record) {
      let key = record[this._primaryKeyForType(type)]
      if (typeof key !== 'undefined') {
        key = key.toString()
        this._data[type][key] = record
        return this._getByKey(type, key)
      }
    }
  }

  _pushMany (type, records) {
    records = this._applyTransforms(type, records, 'many')
    if (records && records.length) {
      return records.map((record) => this._pushOne(type, record))
    }
  }

  _findByKey (type, key) {
    const cached = this._getByKey(type, key)
    if (cached) {
      return Promise.resolve(cached)
    }
    return this._fetchByKey(type, key)
  }

  _findMany (type, params) {
    const cached = this._getMany(type, params)
    if (cached && cached.length) {
      return Promise.resolve(cached)
    }
    return this._fetchMany(type, params)
  }

  _fetchByKey (type, key) {
    return this.adapter.get(type, key).then((data) => this._pushOne(type, data))
  }

  _fetchMany (type, params) {
    return this.adapter.get(type, params).then((data) => this._pushMany(type, data))
  }

  _applyTransforms (type, record, requestType) {
    if (this._transforms.length) {
      const typeMeta = this.lookup(type)
      this._transforms.forEach(function (fnc) {
        record = fnc(record, typeMeta, requestType)
      })
    }
    return record
  }
}

export default Store
