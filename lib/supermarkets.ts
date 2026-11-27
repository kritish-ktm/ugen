// Official, evergreen destinations: the retailer owns prices and offer validity.
export const supermarkets = [
  { id: 'netto', name: 'Netto', kind: 'discount', offers: 'https://netto.dk/netto-avisen/', da: 'Ugens Netto-avis og Netto+ tilbud', en: 'Weekly leaflet and Netto+ offers' },
  { id: 'rema', name: 'REMA 1000', kind: 'discount', offers: 'https://shop.rema1000.dk/avisvarer', da: 'Aktuelle avisvarer hos REMA 1000', en: 'Current advertised products at REMA 1000' },
  { id: 'lidl', name: 'Lidl', kind: 'discount', offers: 'https://www.lidl.dk/c/tilbudsavis/s10013730', da: 'Tilbudsaviser og Lidl Plus-tilbud', en: 'Leaflets and Lidl Plus offers' },
  { id: '365', name: '365discount', kind: 'discount', offers: 'https://365discount.coop.dk/365avis/', da: 'Den aktuelle 365avis', en: 'The current 365 leaflet' },
  { id: 'foetex', name: 'føtex', kind: 'supermarket', offers: 'https://www.foetex.dk/foetex-avis/', da: 'Ugens føtex-avis og kataloger', en: 'Weekly føtex leaflet and catalogues' },
  { id: 'bilka', name: 'Bilka', kind: 'supermarket', offers: 'https://www.bilka.dk/bilkaavisen/', da: 'Bilka-avisen og sæsonens kataloger', en: 'Bilka leaflet and seasonal catalogues' },
  { id: 'brugsen', name: 'SuperBrugsen', kind: 'supermarket', offers: 'https://superbrugsen.coop.dk/avis/', da: 'Ugens avis fra SuperBrugsen', en: 'This week’s SuperBrugsen leaflet' },
  { id: 'meny', name: 'MENY', kind: 'supermarket', offers: 'https://meny.dk/ugensavis', da: 'Ugens avis fra MENY', en: 'This week’s MENY leaflet' },
] as const
