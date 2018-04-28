/******************************************************************
MIT License http://www.opensource.org/licenses/mit-license.php
Author Qiming Zhao <chemzqm@gmail> (https://github.com/chemzqm)
*******************************************************************/
'use strict'

import * as assert from 'assert'
import {parse} from '../parser/wxmlParser'
import {TextDocument} from 'vscode-languageserver-types'
import doHover from '../services/wxmlHover'
import { MarkupContent } from 'vscode-languageserver-types'

suite('HTML Hover', () => {
  function assertHover(
    value: string,
    expectedString: string | undefined,
    expectedHoverOffset: number | undefined,
  ): void {
    let offset = value.indexOf('|')
    value = value.substr(0, offset) + value.substr(offset + 1)

    let document = TextDocument.create(
      'test://test/test.wxml',
      'wxml',
      0,
      value,
    )

    let position = document.positionAt(offset)
    let wxmlDoc = parse(document.getText())

    let hover = doHover(document, position, wxmlDoc)
    if (expectedString) {
      assert(hover && hover.contents && (hover.contents as MarkupContent).value.indexOf(expectedString) !== -1)
      assert.equal(
        hover && document.offsetAt(hover.range!.start),
        expectedHoverOffset,
      )
    } else {
      assert(hover === null)
    }
  }

  test('Tag hover', (): any => {
    assertHover('|<view></view>', void 0, void 0)
    assertHover('<|view></view>', 'view', 1)
    assertHover('<v|iew></view>', 'view', 1)
    assertHover('<vie|w></view>', 'view', 1)
    assertHover('<view|></view>', 'view', 1)
    assertHover('<view>|</view>', void 0, void 0)
    assertHover('<view><|/view>', void 0, void 0)
    assertHover('<view></|view>', 'view', 8)
    assertHover('<view></v|iew>', 'view', 8)
    assertHover('<view></vi|ew>', 'view', 8)
    assertHover('<view></vie|w>', 'view', 8)
    assertHover('<view></view|>', 'view', 8)
    assertHover('<view></view>|', void 0, void 0)
  })

  test('Attribute hover #1', (): void => {
    assertHover('<text s|pace=""></view>', 'space', 6)
    assertHover('<text space=|""></view>', void 0, void 0)
  })

  test('Attribute hover #2', (): void => {
    assertHover('<text selecta|ble></view>', 'text', 6)
  })
})
