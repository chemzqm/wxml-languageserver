/******************************************************************
MIT License http://www.opensource.org/licenses/mit-license.php
Author Qiming Zhao <chemzqm@gmail> (https://github.com/chemzqm)
 *******************************************************************/
'use strict'

import * as assert from 'assert'
import doDiagnostic from '../services/wxmlDiagnostic'
import {parse} from '../parser/wxmlParser'
import { TextDocument } from 'vscode-languageserver-types'

function isNumber(s: number): boolean {
  return Number(String(s)) === s
}

suite('WXML Diagnostic', () => {

  function assertDiagnostic(value: string, expectedErrorMessages: string[]): void {
    let document = TextDocument.create('test://test/test.html', 'html', 0, value)
    let wxmlDoc = parse(document.getText())
    let results = doDiagnostic(document, wxmlDoc)

    let i = 0
    assert.equal(results.length, expectedErrorMessages.length)
    for (let msg of expectedErrorMessages) {
      let {range} = results[i]
      let {start, end} = range
      assert(isNumber(start.line))
      assert(isNumber(start.character))
      assert(isNumber(end.line))
      assert(isNumber(end.character))
      assert.equal(results[i].message, msg)
      i++
    }
  }

  test('Empty tag #1', () => {
    assertDiagnostic('<video>abc</video>', ['Empty tag should not have children'])
  })

  test('Empty tag #2', () => {
    assertDiagnostic('<video></video>', [])
  })

  test('Duplicated attributes', () => {
    assertDiagnostic('<view id="a" id="b"></view>', ['Duplicated attribute "id"', 'Duplicated attribute "id"'])
  })

  test('Unknown attributes', () => {
    assertDiagnostic('<view abc="a"></view>', ['Unknown attribute "abc"'])
  })

  test('Expression required #1', () => {
    assertDiagnostic('<view bindtap=""></view>', ['Value required for attribute "bindtap"'])
  })

  test('Expression required #2', () => {
    assertDiagnostic('<view bindtap></view>', ['Value required for attribute "bindtap"'])
  })

  test('Expression required #3', () => {
    assertDiagnostic('<view wx:if="True"></view>', ['Invalid value for boolean attribute "wx:if"'])
  })

  test('Handler required #1', () => {
    assertDiagnostic('<view bindtap></view>', ['Value required for attribute "bindtap"'])
  })

  test('Invalid boolean attribute #2', () => {
    assertDiagnostic('<scroll-view scroll-x="False"></scroll-view>', ['Invalid value for boolean attribute "scroll-x"'])
  })

  test('Value required for enum', () => {
    assertDiagnostic('<text space></text>', ['Value required for attribute "space"'])
  })

  test('Invaid enum value', () => {
    assertDiagnostic('<text space="abc"></text>', ['Invalid value for enum attribute "space"'])
  })

  test('Invaid number value', () => {
    assertDiagnostic('<scroll-view scroll-top="abc"></scroll-view>', ['Invalid value for number attribute "scroll-top"'])
  })

  test('Express required for wx:for', () => {
    assertDiagnostic('<view wx:for="abc"></view>', ['Expression required for attribute "wx:for"'])
  })

  test('Value required for wx:key', () => {
    assertDiagnostic('<view wx:key></view>', ['Value required for attribute "wx:key"'])
  })

  test('bindtouchcancel', () => {
    assertDiagnostic('<view bindtouchcancel="onCancel"></view>', [])
  })
})
