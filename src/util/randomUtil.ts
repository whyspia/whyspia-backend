import { generateUsername } from 'unique-username-generator'

export function getRandomString() {
  const maxLength = getRandomIntegerInInterval(5, 15)
  return generateUsername('', 2, maxLength)
}

function getRandomIntegerInInterval(min: number, max: number) {
  const minInt = Math.ceil(min)
  const maxInt = Math.floor(max)
  return Math.floor(Math.random() * (maxInt - minInt + 1) + minInt)
}

export function generateRandomNDigitNumber(digits: number) {
  return Math.floor(10 ** (digits - 1) + Math.random() * 9 * 10 ** (digits - 1))
}
