
export const stringToNumbers = (s: string) => {
  let arr: number[] = []
  for (var i = 0; i < s.length; i++) {
    arr.push(s.charCodeAt(i))
  }
  return arr
}
