// @ts-ignore
interface Array<T> {
  unique(): Array<T>
}

Array.prototype.unique = function() {
  return this.filter((value, index, array) => array.indexOf(value) === index)
}