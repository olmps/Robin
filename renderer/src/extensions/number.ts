/* eslint-disable no-extend-native */
// @ts-ignore
interface Number {
  sizeFormatted(): string
}

Number.prototype.sizeFormatted = function() {
  const thisNumber = this as number

  if (thisNumber === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(thisNumber) / Math.log(k));

  return parseFloat((thisNumber / Math.pow(k, i)).toFixed(0)) + ' ' + sizes[i];
}