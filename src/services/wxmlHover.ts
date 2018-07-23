/******************************************************************
MIT License http://www.opensource.org/licenses/mit-license.php
Author Qiming Zhao <chemzqm@gmail> (https://github.com/chemzqm)
*******************************************************************/
'use strict'

import {createScanner} from '../parser/wxmlScanner'
import {
  TextDocument,
  Range,
  Position,
  Hover
} from 'vscode-languageserver-types'
import {TokenType} from '../wxmlLanguageTypes'
import {
  WXMLDocument
} from '../parser/wxmlParser'
import {getWXMLTagProvider} from '../parser/wxmlTags'
import path = require('path')
import fs = require('fs')

const BASE_DIR = path.resolve(__dirname, '../..')

export default function doHover(
  document: TextDocument,
  position: Position,
  wxmlDocument: WXMLDocument,
): Hover | null {
  let offset = document.offsetAt(position)
  let node = wxmlDocument.findNodeAt(offset)
  if (!node || !node.tag) return null
  let provider = getWXMLTagProvider()
  let attr = node.getAttributeAtOffset(offset)

  function getTagHover(tag: string, range: Range): Hover | null {
    tag = tag.toLowerCase()
    let hover:any = null
    provider.collectTags((t, _label) => {
      if (t === tag) {
        let file = path.join(BASE_DIR, `gen/${tag}.md`)
        if (fs.existsSync(file)) {
          let content = fs.readFileSync(file, 'utf8')
          hover = {
            contents: {
              kind: 'markdown',
              value: content
            },
            range,
          }
        }
      }
    })
    return hover || null
  }

  function getTagNameRange(
    tokenType: TokenType,
    startOffset: number,
  ): Range | null {
    let scanner = createScanner(document.getText(), startOffset)
    let token = scanner.scan()
    while (
      token !== TokenType.EOS &&
      (scanner.getTokenEnd() < offset ||
        (scanner.getTokenEnd() === offset && token !== tokenType))
    ) {
      token = scanner.scan()
    }
    if (token === tokenType && offset <= scanner.getTokenEnd()) {
      return {
        start: document.positionAt(scanner.getTokenOffset()),
        end: document.positionAt(scanner.getTokenEnd()),
      }
    }
    return null
  }

  if (attr) {
    let parts = attr.split('|')
    let file = path.join(BASE_DIR, `gen/${node.tag}/${parts[0]}.md`)
    let exists = fs.existsSync(file)
    if (exists) {
      let content = fs.readFileSync(file, 'utf8')
      let start = parseInt(parts[1], 10)
      let range = {
        start: document.positionAt(start),
        end: document.positionAt(start + parts[0].length),
      }
      return {
        contents: {
          kind: 'markdown',
          value: content
        },
        range,
      }
    } else {
      // show tag hover
      let start = parseInt(parts[1], 10)
      return getTagHover(node.tag, {
        start: document.positionAt(start),
        end: document.positionAt(start + parts[0].length)
      })
    }
  }

  if (node.endTagStart && offset >= node.endTagStart) {
    let tagRange = getTagNameRange(TokenType.EndTag, node.endTagStart)
    if (tagRange) {
      return getTagHover(node.tag, tagRange)
    }
    return null
  }

  let tagRange = getTagNameRange(TokenType.StartTag, node.start)
  if (tagRange) {
    return getTagHover(node.tag, tagRange)
  }
  return null
}
