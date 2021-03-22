function removeDiacritics(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}

function contains(s1, s2) {
  return removeDiacritics(s1).includes(removeDiacritics(s2))
}

function containsIgnoreCase(s1, s2) {
  return contains(s1.toLowerCase(), s2.toLowerCase())
}

export {contains, containsIgnoreCase}
