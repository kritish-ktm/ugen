import assert from 'node:assert/strict'
import test from 'node:test'
import { wikimediaImage, creditText } from '../../lib/day-image.ts'

test('calendar pictures accept Wikimedia thumbnails and retain a usable credit page', () => {
  const picture = wikimediaImage('https://thumb.wikimedia.org/wikipedia/commons/thumb/9/95/SanktaLuciaProcession.jpg/330px-SanktaLuciaProcession.jpg?utm_source=wiki')
  assert.equal(picture.file, 'SanktaLuciaProcession.jpg')
  assert.equal(picture.url.includes('?'), false)
  assert.equal(picture.fileUrl, 'https://commons.wikimedia.org/wiki/File:SanktaLuciaProcession.jpg')
  assert.equal(wikimediaImage('https://upload.wikimedia.org/wikipedia/commons/a/a0/Test.jpg').file, 'Test.jpg')
  for (const url of ['javascript:alert(1)', 'https://evil.test/image.jpg', 'http://upload.wikimedia.org/wikipedia/commons/a/a0/Test.jpg', 'https://user:pass@upload.wikimedia.org/wikipedia/commons/a/a0/Test.jpg']) assert.equal(wikimediaImage(url),null)
  assert.equal(creditText('<a href="https://example.test">Photographer &amp; co.</a>'), 'Photographer & co.')
})
