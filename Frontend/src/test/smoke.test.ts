import { expect, test } from 'vitest'

test('test environment is available', () => {
  expect(document.createElement('main').tagName).toBe('MAIN')
})
