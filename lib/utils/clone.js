// https://github.com/sindresorhus/object-assign

let hasOwnProperty = Object.prototype.hasOwnProperty

function toObject (val) {
  if (val === null || val === undefined) {
    throw new TypeError('Object.assign cannot be called with null or undefined')
  }

  return Object(val)
}

const objectAssign = Object.assign || function (target, source) {
  let to = toObject(target)
  let from

  for (let s = 1, len = arguments.length; s < len; s++) {
    from = Object(arguments[s])

    for (let key in from) {
      if (hasOwnProperty.call(from, key)) {
        to[key] = from[key]
      }
    }
  }

  return to
}

export default function clone (object) {
  return objectAssign({}, object)
}
