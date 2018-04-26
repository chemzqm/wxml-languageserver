/******************************************************************
MIT License http://www.opensource.org/licenses/mit-license.php
Author Qiming Zhao <chemzqm@gmail> (https://github.com/chemzqm)
*******************************************************************/
'use strict'

export function startsWith(haystack: string, needle: string): boolean {
  if (haystack.length < needle.length) {
    return false
  }

  for (let i = 0; i < needle.length; i++) {
    if (haystack[i] !== needle[i]) {
      return false
    }
  }

  return true
}

/**
 * Determines if haystack ends with needle.
 */
export function endsWith(haystack: string, needle: string): boolean {
  let diff = haystack.length - needle.length
  if (diff > 0) {
    return haystack.lastIndexOf(needle) === diff
  } else if (diff === 0) {
    return haystack === needle
  } else {
    return false
  }
}

/**
 * @returns the length of the common prefix of the two strings.
 */
export function commonPrefixLength(a: string, b: string): number {
  let i: number
  let len = Math.min(a.length, b.length)

  for (i = 0; i < len; i++) {
    if (a.charCodeAt(i) !== b.charCodeAt(i)) {
      return i
    }
  }

  return len
}

export function repeat(value: string, count: number): string {
  let s = ''
  while (count > 0) {
    if ((count & 1) === 1) {
      s += value
    }
    value += value
    count = count >>> 1
  }
  return s
}

const _a = 'a'.charCodeAt(0)
const _z = 'z'.charCodeAt(0)
const _A = 'A'.charCodeAt(0)
const _Z = 'Z'.charCodeAt(0)
const _0 = '0'.charCodeAt(0)
const _9 = '9'.charCodeAt(0)

export function isLetterOrDigit(text: string, index: number): boolean {
  let c = text.charCodeAt(index)
  return (_a <= c && c <= _z) || (_A <= c && c <= _Z) || (_0 <= c && c <= _9)
}
