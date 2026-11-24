import assert from 'node:assert/strict'
import test from 'node:test'
import { dateFromWeek, danishToday, isoWeek, weeksInYear } from '../../lib/iso-week.ts'
import { easterSunday } from '../../lib/easter.ts'
import { dateKey, holidays, nextHoliday } from '../../lib/holidays.ts'
import { amountValue, convert } from '../../lib/currency.ts'
import { parseRss } from '../../lib/rss.ts'
import { travelLink } from '../../lib/travel.ts'

const date = (year, month, day) => new Date(year, month - 1, day, 12)
test('ISO week-year spans New Year and starts on Monday', () => {
  assert.deepEqual(isoWeek(date(2026, 12, 31)), { year: 2026, week: 53 })
  assert.deepEqual(isoWeek(date(2027, 1, 1)), { year: 2026, week: 53 })
  assert.deepEqual(isoWeek(date(2027, 1, 4)), { year: 2027, week: 1 })
  assert.equal(dateKey(dateFromWeek(2026, 53)), '2026-12-28')
  assert.equal(weeksInYear(2027), 52)
  assert.throws(() => dateFromWeek(2027, 53), RangeError)
})
test('the calendar rolls over at Copenhagen midnight', () => {
  assert.equal(danishToday(new Date('2026-11-10T23:30:00Z')), '2026-11-11')
  assert.equal(danishToday(new Date('2026-07-10T22:05:00Z')), '2026-07-11')
})
test('computus and derived Danish holidays', () => {
  assert.equal(dateKey(easterSunday(2026)), '2026-04-05')
  assert.equal(dateKey(easterSunday(2027)), '2027-03-28')
  const days = holidays(2026)
  assert.equal(dateKey(days.find(item => item.da === 'Skærtorsdag').date), '2026-04-02')
  assert.equal(dateKey(days.find(item => item.da === 'Kristi himmelfartsdag').date), '2026-05-14')
  assert.equal(dateKey(days.find(item => item.da === '2. pinsedag').date), '2026-05-25')
  assert.equal(days.find(item => item.da === 'Grundlovsdag').public, false)
  assert.equal(days.find(item => item.da === 'Juleaften').public, false)
  assert.equal(days.find(item => item.da === '2. juledag').flag, false)
  assert.equal(days.find(item => item.da === 'Dronning Marys fødselsdag').flag, true)
  assert.ok(!days.some(item => item.da === 'Store bededag'))
  assert.ok(holidays(2023).some(item => item.da === 'Store bededag' && dateKey(item.date) === '2023-05-05'))
  assert.equal(nextHoliday(date(2026, 12, 31)).remaining, 1)
})
test('currency conversion works in both directions and rejects invalid rates', () => {
  assert.equal(amountValue('10,5'), 10.5)
  assert.ok(Math.abs(convert(100, .134) - 13.4) < 1e-10)
  assert.equal(convert(13.4, .134, true), 100)
  assert.equal(convert(0, .134), 0)
  assert.equal(convert(100, 0, true), null)
  assert.equal(convert(Infinity, 1), null)
})
test('RSS parsing returns headlines and safe original article links only', () => {
  const [article] = parseRss('<rss><channel><item><title>Fodbold &amp; håndbold</title><link>https://example.org/sport/a</link><description>Private body</description><pubDate>Tue, 10 Nov 2026 11:00:00 GMT</pubDate></item><item><title>Bad</title><link>javascript:alert(1)</link></item></channel></rss>', 'DR')
  assert.deepEqual(article, { title: 'Fodbold & håndbold', url: 'https://example.org/sport/a', source: 'DR', published: '2026-11-10T11:00:00.000Z', category: 'sport' })
  assert.throws(() => parseRss('<html></html>', 'DR'))
})
test('RSS decodes numeric headline references and reads publisher images', () => {
  const [politiken, dr, textOnly] = parseRss(`<rss xmlns:media="http://search.yahoo.com/mrss/"><channel>
    <item><title xml:lang="da">Ny &#248;l er inspireret af verdens l&#xE6;ngste sl&#230;derejse</title>
      <link>https://politiken.dk/rejser/art11048670</link>
      <pubDate>Tue, 10 Nov 2026 16:06:27 +0100</pubDate>
      <enclosure type="audio/mpeg" url="https://politiken.dk/audio.mp3"/>
      <enclosure type="image/jpeg" url="https://politiken.dk/incoming/beer"/>
    </item>
    <item><title><![CDATA[Bl&#229; himmel]]></title>
      <link>https://www.dr.dk/nyheder/indland/a</link>
      <pubDate>Tue, 10 Nov 2026 16:06:27 +0100</pubDate>
      <media:thumbnail url="javascript:alert(1)"/>
      <media:content medium="image" url="https://asset.dr.dk/photo.jpg?x=1&amp;y=2"/>
    </item>
    <item><title>Kun tekst</title>
      <link>https://www.dr.dk/nyheder/indland/b</link>
      <pubDate>Tue, 10 Nov 2026 16:06:27 +0100</pubDate>
      <enclosure type="video/mp4" url="https://asset.dr.dk/video.mp4"/>
    </item>
  </channel></rss>`, 'News')
  assert.equal(politiken.title, 'Ny øl er inspireret af verdens længste slæderejse')
  assert.equal(politiken.imageUrl, 'https://politiken.dk/incoming/beer')
  assert.equal(dr.title, 'Blå himmel')
  assert.equal(dr.imageUrl, 'https://asset.dr.dk/photo.jpg?x=1&y=2')
  assert.equal(textOnly.imageUrl, undefined)
})

test('official Rejseplan link carries the user’s route and time', () => {
  const url = new URL(travelLink({ from: 'København H', to: 'Aarhus H', date: '2026-11-10', time: '10:30' }, 'da'))
  assert.equal(url.host, 'www.rejseplan.dk')
  assert.equal(url.searchParams.get('S'), 'København H')
  assert.equal(url.searchParams.get('Z'), 'Aarhus H')
  assert.equal(url.searchParams.get('date'), '10.11.2026')
})




test('Danish events include cross-year seasons, movable traditions and market weekends', async () => {
  const { denmarkEvents, eventsBetween } = await import('../../lib/denmark-events.ts')
  const events2026 = denmarkEvents(2026)
  const events2027 = denmarkEvents(2027)
  assert.ok(eventsBetween(events2027, '2027-01-03').some(event => event.da === 'Jul i Tivoli'))
  assert.ok(!eventsBetween(events2027, '2027-01-04').some(event => event.da === 'Jul i Tivoli'))
  assert.ok(eventsBetween(events2027, '2027-02-07').some(event => event.da === 'Fastelavn'))
  assert.ok(eventsBetween(events2026, '2026-11-29').some(event => event.da === 'Første søndag i advent'))
  assert.ok(eventsBetween(events2026, '2026-12-06').some(event => event.city === 'Odense'))
  assert.ok(!eventsBetween(events2026, '2026-12-07').some(event => event.city === 'Odense'))
})
