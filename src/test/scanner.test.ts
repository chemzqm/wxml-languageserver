/******************************************************************
MIT License http://www.opensource.org/licenses/mit-license.php
Author Qiming Zhao <chemzqm@gmail> (https://github.com/chemzqm)
*******************************************************************/
'use strict'

import * as assert from 'assert'
import {createScanner} from '../parser/wxmlScanner'
import {TokenType, ScannerState} from '../wxmlLanguageTypes'

suite('WXML Scanner', () => {
  interface Token {
    offset: number
    type: TokenType
    content?: string
  }

  function assertTokens(tests: {input: string; tokens: Token[]}[]): void {
    let scannerState = ScannerState.WithinContent
    for (let t of tests) {
      let scanner = createScanner(t.input, 0, scannerState)
      let tokenType = scanner.scan()
      let actual: Token[] = []
      while (tokenType !== TokenType.EOS) {
        let actualToken: Token = {
          offset: scanner.getTokenOffset(),
          type: tokenType,
        }
        if (
          tokenType === TokenType.StartTag ||
          tokenType === TokenType.EndTag
        ) {
          actualToken.content = t.input.substr(
            scanner.getTokenOffset(),
            scanner.getTokenLength(),
          )
        }
        actual.push(actualToken)
        tokenType = scanner.scan()
      }
      assert.deepEqual(actual, t.tokens)
      scannerState = scanner.getScannerState()
    }
  }

  test('Open Start Tag #1', () => {
    assertTokens([
      {
        input: '<abc',
        tokens: [
          {offset: 0, type: TokenType.StartTagOpen},
          {offset: 1, type: TokenType.StartTag, content: 'abc'},
        ],
      },
    ])
  })

  test('Open Start Tag #2', () => {
    assertTokens([
      {
        input: '<input',
        tokens: [
          {offset: 0, type: TokenType.StartTagOpen},
          {offset: 1, type: TokenType.StartTag, content: 'input'},
        ],
      },
    ])
  })

  test('Open Start Tag with Invalid Tag', () => {
    assertTokens([
      {
        input: '< abc',
        tokens: [
          {offset: 0, type: TokenType.StartTagOpen},
          {offset: 1, type: TokenType.Whitespace},
          {offset: 2, type: TokenType.StartTag, content: 'abc'},
        ],
      },
    ])
  })

  test('Open Start Tag #3', () => {
    assertTokens([
      {
        input: '< abc>',
        tokens: [
          {offset: 0, type: TokenType.StartTagOpen},
          {offset: 1, type: TokenType.Whitespace},
          {offset: 2, type: TokenType.StartTag, content: 'abc'},
          {offset: 5, type: TokenType.StartTagClose},
        ],
      },
    ])
  })

  test('Open Start Tag #4', () => {
    assertTokens([
      {
        input: 'i <len;',
        tokens: [
          {offset: 0, type: TokenType.Content},
          {offset: 2, type: TokenType.StartTagOpen},
          {offset: 3, type: TokenType.StartTag, content: 'len'},
          {offset: 6, type: TokenType.Unknown},
        ],
      },
    ])
  })

  test('Open Start Tag #5', () => {
    assertTokens([
      {
        input: '<',
        tokens: [{offset: 0, type: TokenType.StartTagOpen}],
      },
    ])
  })

  test('Open End Tag', () => {
    assertTokens([
      {
        input: '</a',
        tokens: [
          {offset: 0, type: TokenType.EndTagOpen},
          {offset: 2, type: TokenType.EndTag, content: 'a'},
        ],
      },
    ])
  })

  test('Complete Start Tag', () => {
    assertTokens([
      {
        input: '<abc>',
        tokens: [
          {offset: 0, type: TokenType.StartTagOpen},
          {offset: 1, type: TokenType.StartTag, content: 'abc'},
          {offset: 4, type: TokenType.StartTagClose},
        ],
      },
    ])
  })

  test('Complete Start Tag with Whitespace', () => {
    assertTokens([
      {
        input: '<abc >',
        tokens: [
          {offset: 0, type: TokenType.StartTagOpen},
          {offset: 1, type: TokenType.StartTag, content: 'abc'},
          {offset: 4, type: TokenType.Whitespace},
          {offset: 5, type: TokenType.StartTagClose},
        ],
      },
    ])
  })

  test('Complete Start Tag with Namespaceprefix', () => {
    assertTokens([
      {
        input: '<foo:bar>',
        tokens: [
          {offset: 0, type: TokenType.StartTagOpen},
          {offset: 1, type: TokenType.StartTag, content: 'foo:bar'},
          {offset: 8, type: TokenType.StartTagClose},
        ],
      },
    ])
  })

  test('Complete End Tag', () => {
    assertTokens([
      {
        input: '</abc>',
        tokens: [
          {offset: 0, type: TokenType.EndTagOpen},
          {offset: 2, type: TokenType.EndTag, content: 'abc'},
          {offset: 5, type: TokenType.EndTagClose},
        ],
      },
    ])
  })

  test('Complete End Tag with Whitespace', () => {
    assertTokens([
      {
        input: '</abc  >',
        tokens: [
          {offset: 0, type: TokenType.EndTagOpen},
          {offset: 2, type: TokenType.EndTag, content: 'abc'},
          {offset: 5, type: TokenType.Whitespace},
          {offset: 7, type: TokenType.EndTagClose},
        ],
      },
    ])
  })

  test('Empty Tag', () => {
    assertTokens([
      {
        input: '<abc />',
        tokens: [
          {offset: 0, type: TokenType.StartTagOpen},
          {offset: 1, type: TokenType.StartTag, content: 'abc'},
          {offset: 4, type: TokenType.Whitespace},
          {offset: 5, type: TokenType.StartTagSelfClose},
        ],
      },
    ])
  })

  test('Embedded wxs #1', () => {
    assertTokens([
      {
        input: '<wxs module="m1">var msg = "hello world";</wxs>',
        tokens: [
          {offset: 0, type: TokenType.StartTagOpen},
          {offset: 1, type: TokenType.StartTag, content: 'wxs'},
          {offset: 4, type: TokenType.Whitespace},
          {offset: 5, type: TokenType.AttributeName},
          {offset: 11, type: TokenType.DelimiterAssign},
          {offset: 12, type: TokenType.AttributeValue},
          {offset: 16, type: TokenType.StartTagClose},
          {offset: 17, type: TokenType.Script},
          {offset: 41, type: TokenType.EndTagOpen},
          {offset: 43, type: TokenType.EndTag, content: 'wxs'},
          {offset: 46, type: TokenType.EndTagClose},
        ],
      },
    ])
  })

  test('Embedded Content #2', () => {
    assertTokens([
      {
        input: '<wxs module="m1">',
        tokens: [
          {offset: 0, type: TokenType.StartTagOpen},
          {offset: 1, type: TokenType.StartTag, content: 'wxs'},
          {offset: 4, type: TokenType.Whitespace},
          {offset: 5, type: TokenType.AttributeName},
          {offset: 11, type: TokenType.DelimiterAssign},
          {offset: 12, type: TokenType.AttributeValue},
          {offset: 16, type: TokenType.StartTagClose},
        ],
      },
      {
        input: 'var i= 10;',
        tokens: [{offset: 0, type: TokenType.Script}],
      },
      {
        input: '</wxs>',
        tokens: [
          {offset: 0, type: TokenType.EndTagOpen},
          {offset: 2, type: TokenType.EndTag, content: 'wxs'},
          {offset: 5, type: TokenType.EndTagClose},
        ],
      },
    ])
  })

  test('Tag with Attribute', () => {
    assertTokens([
      {
        input: '<abc foo="bar">',
        tokens: [
          {offset: 0, type: TokenType.StartTagOpen},
          {offset: 1, type: TokenType.StartTag, content: 'abc'},
          {offset: 4, type: TokenType.Whitespace},
          {offset: 5, type: TokenType.AttributeName},
          {offset: 8, type: TokenType.DelimiterAssign},
          {offset: 9, type: TokenType.AttributeValue},
          {offset: 14, type: TokenType.StartTagClose},
        ],
      },
    ])
  })

  test('Tag with Empty Attribute Value', () => {
    assertTokens([
      {
        input: '<view hidden>',
        tokens: [
          {offset: 0, type: TokenType.StartTagOpen},
          {offset: 1, type: TokenType.StartTag, content: 'view'},
          {offset: 5, type: TokenType.Whitespace},
          {offset: 6, type: TokenType.AttributeName},
          {offset: 12, type: TokenType.StartTagClose},
        ],
      },
    ])
  })

  test('Tag with empty attributes', () => {
    assertTokens([
      {
        input: '<abc foo="">',
        tokens: [
          {offset: 0, type: TokenType.StartTagOpen},
          {offset: 1, type: TokenType.StartTag, content: 'abc'},
          {offset: 4, type: TokenType.Whitespace},
          {offset: 5, type: TokenType.AttributeName},
          {offset: 8, type: TokenType.DelimiterAssign},
          {offset: 9, type: TokenType.AttributeValue},
          {offset: 11, type: TokenType.StartTagClose},
        ],
      },
    ])
  })

  test('Tag with Attributes', () => {
    assertTokens([
      {
        input: '<abc foo="bar" bar="foo">',
        tokens: [
          {offset: 0, type: TokenType.StartTagOpen},
          {offset: 1, type: TokenType.StartTag, content: 'abc'},
          {offset: 4, type: TokenType.Whitespace},
          {offset: 5, type: TokenType.AttributeName},
          {offset: 8, type: TokenType.DelimiterAssign},
          {offset: 9, type: TokenType.AttributeValue},
          {offset: 14, type: TokenType.Whitespace},
          {offset: 15, type: TokenType.AttributeName},
          {offset: 18, type: TokenType.DelimiterAssign},
          {offset: 19, type: TokenType.AttributeValue},
          {offset: 24, type: TokenType.StartTagClose},
        ],
      },
    ])
  })

  test('Tag with Attributes, no quotes, self close', () => {
    assertTokens([
      {
        input: '<abc foo=bar/>',
        tokens: [
          {offset: 0, type: TokenType.StartTagOpen},
          {offset: 1, type: TokenType.StartTag, content: 'abc'},
          {offset: 4, type: TokenType.Whitespace},
          {offset: 5, type: TokenType.AttributeName},
          {offset: 8, type: TokenType.DelimiterAssign},
          {offset: 9, type: TokenType.AttributeValue},
          {offset: 12, type: TokenType.StartTagSelfClose},
        ],
      },
    ])
  })

  test('Tag with Name-Only-Attribute #1', () => {
    assertTokens([
      {
        input: '<abc foo>',
        tokens: [
          {offset: 0, type: TokenType.StartTagOpen},
          {offset: 1, type: TokenType.StartTag, content: 'abc'},
          {offset: 4, type: TokenType.Whitespace},
          {offset: 5, type: TokenType.AttributeName},
          {offset: 8, type: TokenType.StartTagClose},
        ],
      },
    ])
  })

  test('Tag with Name-Only-Attribute #2', () => {
    assertTokens([
      {
        input: '<abc foo bar>',
        tokens: [
          {offset: 0, type: TokenType.StartTagOpen},
          {offset: 1, type: TokenType.StartTag, content: 'abc'},
          {offset: 4, type: TokenType.Whitespace},
          {offset: 5, type: TokenType.AttributeName},
          {offset: 8, type: TokenType.Whitespace},
          {offset: 9, type: TokenType.AttributeName},
          {offset: 12, type: TokenType.StartTagClose},
        ],
      },
    ])
  })

  test('Tag with Interesting Attribute Name #1', () => {
    assertTokens([
      {
        input: '<abc bind:tap="bar">',
        tokens: [
          {offset: 0, type: TokenType.StartTagOpen},
          {offset: 1, type: TokenType.StartTag, content: 'abc'},
          {offset: 4, type: TokenType.Whitespace},
          {offset: 5, type: TokenType.AttributeName},
          {offset: 13, type: TokenType.DelimiterAssign},
          {offset: 14, type: TokenType.AttributeValue},
          {offset: 19, type: TokenType.StartTagClose},
        ],
      },
    ])
  })

  test('Tag with 1nteresting Attribute Name #2', () => {
    assertTokens([
      {
        input: '<abc bind.tap="bar">',
        tokens: [
          {offset: 0, type: TokenType.StartTagOpen},
          {offset: 1, type: TokenType.StartTag, content: 'abc'},
          {offset: 4, type: TokenType.Whitespace},
          {offset: 5, type: TokenType.AttributeName},
          {offset: 13, type: TokenType.DelimiterAssign},
          {offset: 14, type: TokenType.AttributeValue},
          {offset: 19, type: TokenType.StartTagClose},
        ],
      },
    ])
  })

  test('Tag with Invalid Attribute Value', () => {
    assertTokens([
      {
        input: '<abc foo=">',
        tokens: [
          {offset: 0, type: TokenType.StartTagOpen},
          {offset: 1, type: TokenType.StartTag, content: 'abc'},
          {offset: 4, type: TokenType.Whitespace},
          {offset: 5, type: TokenType.AttributeName},
          {offset: 8, type: TokenType.DelimiterAssign},
          {offset: 9, type: TokenType.AttributeValue},
        ],
      },
    ])
  })

  test('Simple Comment 1', () => {
    assertTokens([
      {
        input: '<!--a-->',
        tokens: [
          {offset: 0, type: TokenType.StartCommentTag},
          {offset: 4, type: TokenType.Comment},
          {offset: 5, type: TokenType.EndCommentTag},
        ],
      },
    ])
  })

  test('Simple Comment 2', () => {
    assertTokens([
      {
        input: '<!--a>foo bar</a -->',
        tokens: [
          {offset: 0, type: TokenType.StartCommentTag},
          {offset: 4, type: TokenType.Comment},
          {offset: 17, type: TokenType.EndCommentTag},
        ],
      },
    ])
  })

  test('Multiline Comment', () => {
    assertTokens([
      {
        input: '<!--a>\nfoo \nbar</a -->',
        tokens: [
          {offset: 0, type: TokenType.StartCommentTag},
          {offset: 4, type: TokenType.Comment},
          {offset: 19, type: TokenType.EndCommentTag},
        ],
      },
    ])
  })

  test('Incomplete', () => {
    assertTokens([
      {
        input: '    ',
        tokens: [{offset: 0, type: TokenType.Content}],
      },
    ])
    assertTokens([
      {
        input: '<!---   ',
        tokens: [
          {offset: 0, type: TokenType.StartCommentTag},
          {offset: 4, type: TokenType.Comment},
        ],
      },
    ])
    assertTokens([
      {
        input: '<wxs>var msg = "hello"',
        tokens: [
          {offset: 0, type: TokenType.StartTagOpen},
          {offset: 1, type: TokenType.StartTag, content: 'wxs'},
          {offset: 4, type: TokenType.StartTagClose},
          {offset: 5, type: TokenType.Script},
        ],
      },
    ])
  })
})
