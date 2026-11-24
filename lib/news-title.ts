// Older saved feeds and some RSS title fields contain literal numeric references.
export function decodeHeadline(title: string) {
  return title.replace(/&#(\d+|x[0-9a-f]+);/gi, (reference, digits: string) => {
    const hex = digits[0].toLowerCase() === 'x'
    const value = Number.parseInt(hex ? digits.slice(1) : digits, hex ? 16 : 10)
    return value >= 32 && value <= 0x10ffff && (value < 0xd800 || value > 0xdfff)
      ? String.fromCodePoint(value)
      : reference
  }).trim()
}
