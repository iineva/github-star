
export const stringToNumbers = (s: string) => {
  let arr: number[] = []
  for (var i = 0; i < s.length; i++) {
    arr.push(s.charCodeAt(i))
  }
  return arr
}

export const kFormatter = (num: number) => {
  // @ts-ignore
  return Math.abs(num) > 999 ? Math.sign(num) * ((Math.abs(num) / 1000).toFixed(1)) + 'k' : Math.sign(num) * Math.abs(num)
}