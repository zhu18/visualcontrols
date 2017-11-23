export function getArrayMax(arr) {
  let newArr = [];
  arr.forEach((v, i) => {
    newArr.push(parseInt(v))
  })
  if (Object.keys(newArr).length)
    return Math.max.apply(null, newArr)
  else
    return false
}
