export default function objectToArray(obj) {
  return Object.keys(obj).map(item => obj[item]);
}
