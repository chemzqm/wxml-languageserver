/******************************************************************
MIT License http://www.opensource.org/licenses/mit-license.php
Author Qiming Zhao <chemzqm@gmail> (https://github.com/chemzqm)
*******************************************************************/
'use strict'

import * as assert from 'assert'
import {Node, parse} from '../parser/wxmlParser'

suite('WXML Parser', () => {
  function toJSON(node: Node): any {
    return {
      tag: node.tag,
      start: node.start,
      end: node.end,
      endTagStart: node.endTagStart,
      closed: node.closed,
      children: node.children.map(toJSON),
    }
  }

  function toJSONWithAttributes(node: Node): any {
    return {
      tag: node.tag,
      attributes: node.attributes,
      children: node.children.map(toJSONWithAttributes),
    }
  }

  function assertDocument(input: string, expected: any): void {
    let document = parse(input)
    assert.deepEqual(document.roots.map(toJSON), expected)
  }

  function assertDocumentError(input: string, expected: any): void {
    let document = parse(input)
    assert.deepEqual(document.errors, expected)
  }

  function assertNodeBefore(
    input: string,
    offset: number,
    expectedTag: string | undefined,
  ): void {
    let document = parse(input)
    let node = document.findNodeBefore(offset)
    assert.equal(node ? node.tag : '', expectedTag, 'offset ' + offset)
  }

  function assertAttributes(input: string, expected: any): void {
    let document = parse(input)
    assert.deepEqual(document.roots.map(toJSONWithAttributes), expected)
  }

  test('Simple', () => {
    assertDocument('<view></view>', [
      {
        tag: 'view',
        start: 0,
        end: 13,
        endTagStart: 6,
        closed: true,
        children: [],
      },
    ])
    assertDocument('<html><body></body></html>', [
      {
        tag: 'html',
        start: 0,
        end: 26,
        endTagStart: 19,
        closed: true,
        children: [
          {
            tag: 'body',
            start: 6,
            end: 19,
            endTagStart: 12,
            closed: true,
            children: [],
          },
        ],
      },
    ])
    assertDocument('<html><head></head><body></body></html>', [
      {
        tag: 'html',
        start: 0,
        end: 39,
        endTagStart: 32,
        closed: true,
        children: [
          {
            tag: 'head',
            start: 6,
            end: 19,
            endTagStart: 12,
            closed: true,
            children: [],
          },
          {
            tag: 'body',
            start: 19,
            end: 32,
            endTagStart: 25,
            closed: true,
            children: [],
          },
        ],
      },
    ])
  })

  test('SelfClose', () => {
    assertDocument('<input/>', [
      {
        tag: 'input',
        start: 0,
        end: 8,
        endTagStart: void 0,
        closed: true,
        children: [],
      },
    ])
    assertDocument('<div><br/><span></span></div>', [
      {
        tag: 'div',
        start: 0,
        end: 29,
        endTagStart: 23,
        closed: true,
        children: [
          {
            tag: 'br',
            start: 5,
            end: 10,
            endTagStart: void 0,
            closed: true,
            children: [],
          },
          {
            tag: 'span',
            start: 10,
            end: 23,
            endTagStart: 16,
            closed: true,
            children: [],
          },
        ],
      },
    ])
  })

  test('EmptyTag', () => {
    assertDocument('<icon>', [
      {
        tag: 'icon',
        start: 0,
        end: 6,
        endTagStart: void 0,
        closed: true,
        children: [],
      },
    ])
    assertDocument('<div><input type="button"><span></span></div>', [
      {
        tag: 'div',
        start: 0,
        end: 45,
        endTagStart: 39,
        closed: true,
        children: [
          {
            tag: 'input',
            start: 5,
            end: 26,
            endTagStart: void 0,
            closed: true,
            children: [],
          },
          {
            tag: 'span',
            start: 26,
            end: 39,
            endTagStart: 32,
            closed: true,
            children: [
            ],
          },
        ],
      },
    ])
  })

  test('MissingTags', () => {
    assertDocument('</meta>', [])
    assertDocument('<div></div></div>', [
      {
        tag: 'div',
        start: 0,
        end: 11,
        endTagStart: 5,
        closed: true,
        children: [],
      },
    ])
    assertDocument('<div><div></div>', [
      {
        tag: 'div',
        start: 0,
        end: 16,
        endTagStart: void 0,
        closed: false,
        children: [
          {
            tag: 'div',
            start: 5,
            end: 16,
            endTagStart: 10,
            closed: true,
            children: [],
          },
        ],
      },
    ])
    assertDocument('<title><div></title>', [
      {
        tag: 'title',
        start: 0,
        end: 20,
        endTagStart: 12,
        closed: true,
        children: [
          {
            tag: 'div',
            start: 7,
            end: 12,
            endTagStart: void 0,
            closed: false,
            children: [],
          },
        ],
      },
    ])
    assertDocument('<h1><div><span></h1>', [
      {
        tag: 'h1',
        start: 0,
        end: 20,
        endTagStart: 15,
        closed: true,
        children: [
          {
            tag: 'div',
            start: 4,
            end: 15,
            endTagStart: void 0,
            closed: false,
            children: [
              {
                tag: 'span',
                start: 9,
                end: 15,
                endTagStart: void 0,
                closed: false,
                children: [],
              },
            ],
          },
        ],
      },
    ])
  })

  test('FindNodeBefore', () => {
    let str = '<div><input type="button"><span><br><hr></span></div>'
    assertNodeBefore(str, 0, void 0)
    assertNodeBefore(str, 1, 'div')
    assertNodeBefore(str, 5, 'div')
    assertNodeBefore(str, 6, 'input')
    assertNodeBefore(str, 25, 'input')
    assertNodeBefore(str, 26, 'input')
    assertNodeBefore(str, 27, 'span')
    assertNodeBefore(str, 32, 'span')
    assertNodeBefore(str, 33, 'br')
    assertNodeBefore(str, 36, 'br')
    assertNodeBefore(str, 37, 'hr')
    assertNodeBefore(str, 40, 'hr')
    assertNodeBefore(str, 41, 'hr')
    assertNodeBefore(str, 42, 'hr')
    assertNodeBefore(str, 47, 'span')
    assertNodeBefore(str, 48, 'span')
    assertNodeBefore(str, 52, 'span')
    assertNodeBefore(str, 53, 'div')
  })

  test('FindNodeBefore - incomplete node', () => {
    let str = '<div><span><br></div>'
    assertNodeBefore(str, 15, 'br')
    assertNodeBefore(str, 18, 'br')
    assertNodeBefore(str, 21, 'div')
  })

  test('Attributes', () => {
    let str =
      '<div class="these are my-classes" id="test"><span aria-describedby="test"></span></div>'
    assertAttributes(str, [
      {
        tag: 'div',
        attributes: {
          'class|5': 'these are my-classes',
          'id|34': 'test',
        },
        children: [
          {
            tag: 'span',
            attributes: {
              'aria-describedby|50': 'test',
            },
            children: [],
          },
        ],
      },
    ])
  })

  test('Attributes without value', () => {
    let str = '<div checked id="test"></div>'
    assertAttributes(str, [
      {
        tag: 'div',
        attributes: {
          'checked|5': null,
          'id|13': 'test',
        },
        children: [],
      },
    ])
  })

  test('document error #1', () => {
    assertDocumentError('< view></view>', [{
      message: 'Tag name must directly follow the open bracket.',
      offsetStart: 1,
      offeetEnd: 2
    }])
  })

  test('document error #2', () => {
    assertDocumentError('<view>', [{
      message: 'Close tag not found for <view>',
      offsetStart: 1,
      offeetEnd: 4
    }])
  })

  test('document error #3', () => {
    assertDocumentError('</view>', [{
      message: 'Start tag not found for <view>',
      offsetStart: 2,
      offeetEnd: 6
    }])
  })

  test('document error #4', () => {
    assertDocumentError('<view><text>', [{
      message: 'Close tag not found for <view>',
      offsetStart: 1,
      offeetEnd: 4
    }, {
      message: 'Close tag not found for <text>',
      offsetStart: 7,
      offeetEnd: 10
    }])
  })

  test('document error #5', () => {
    assertDocumentError('<view></ view>', [{
      message: 'Tag name must directly follow the open bracket.',
      offsetStart: 8,
      offeetEnd: 9
    }])
  })

  test('Invalid tag name', () => {
    assertDocumentError('<view:for></view:for>', [{
      message: 'Only [a-z] _ - allowed for tag name',
      offsetStart: 1,
      offeetEnd: 9
    }])
  })

  test('Invalid value', () => {
    assertDocumentError('<view class=myclass></view>', [{
      message: 'Double quote required for value',
      offsetStart: 12,
      offeetEnd: 18
    }])
  })

  test('Invalid attribute', () => {
    assertDocumentError('<view x#y></view>', [{
      message: 'Invalid attribute x#y',
      offsetStart: 6,
      offeetEnd: 8
    }])
  })
})
