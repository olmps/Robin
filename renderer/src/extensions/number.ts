/* eslint-disable no-extend-native */
// @ts-ignore
interface Number {
  sizeFormatted(): string
}

Number.prototype.sizeFormatted = function() {
  if (this === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(<number>this) / Math.log(k));

  return parseFloat((<number>this / Math.pow(k, i)).toFixed(0)) + ' ' + sizes[i];
}