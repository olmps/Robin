// @ts-ignore
interface String {
  clippedTo(chars: number): String
}

String.prototype.clippedTo = function(chars: number) {
  if (this.length <= chars) { return this }
  return `${this.substring(0, chars - 3)}...`
}