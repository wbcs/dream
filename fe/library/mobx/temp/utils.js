export const isPlainObject = (obj) => {
  return obj && typeof obj === 'object' && (obj.__proto__ === null || obj.__proto__ === Object.prototype)
}

export const isArray = arr => Array.isArray(arr)
