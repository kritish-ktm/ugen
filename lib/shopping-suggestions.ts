const everydayItems = [
  'Mælk', 'Mælk laktosefri', 'Arla mælk', 'Havremælk', 'Smør', 'Ost', 'Yoghurt', 'Æg',
  'Kaffe', 'Kaffebønner', 'Te', 'Rugbrød', 'Brød', 'Havregryn', 'Mel', 'Sukker',
  'Ris', 'Pasta', 'Kartofler', 'Tomater', 'Agurk', 'Bananer', 'Æbler', 'Appelsiner',
  'Kylling', 'Hakket oksekød', 'Hakket svinekød', 'Laks', 'Tun', 'Toiletpapir',
  'Vaskemiddel', 'Opvaskemiddel', 'Chokolade', 'Chips', 'Is', 'Sodavand', 'Pepsi Max',
  'Coca-Cola', 'Juice', 'Øl', 'Tuborg', 'Tuborg Classic', 'Carlsberg', 'Royal Pilsner',
  'Vin', 'Rødvin', 'Hvidvin', 'Rosé', 'Gin', 'Vodka', 'Cider',
]
const normalize = (text: string) => text.toLocaleLowerCase('da').replaceAll('æ','ae').replaceAll('ø','o').normalize('NFD').replace(/\p{Diacritic}/gu,'').trim()

// Local suggestions are search terms, not claims about current offers or availability.
export function shoppingSuggestions(input: string, productNames: string[] = []) {
  const query = normalize(input)
  if (!query) return []
  const words = query.split(/\s+/)
  const unique = new Map<string,string>()
  for (const item of [...everydayItems,...productNames]) {
    const title = item.trim(), key = normalize(title)
    if (!key || title.length>80 || unique.has(key)) continue
    if (words.every(word=>key.split(/\s+/).some(part=>part.startsWith(word)))) unique.set(key,title)
  }
  return [...unique].sort(([a],[b])=>Number(b.startsWith(query))-Number(a.startsWith(query))).slice(0,6).map(([,title])=>title)
}
