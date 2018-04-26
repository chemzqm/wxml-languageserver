/******************************************************************
MIT License http://www.opensource.org/licenses/mit-license.php
Author Qiming Zhao <chemzqm@gmail> (https://github.com/chemzqm)
*******************************************************************/
'use strict'

import {createScanner} from './wxmlScanner'
import {findFirst} from '../utils/arrays'
import {isEmptyElement} from './wxmlTags'
import {TokenType, ErrorItem} from '../wxmlLanguageTypes'

function isValidTagName(tag: string): boolean {
  return /^[a-z]([a-z]|\d|-|_)*$/.test(tag)
}

function isValidAttribute(attr: string): boolean {
  return /^[a-zA-Z](:|\.|-|_|\w)*$/.test(attr)
}

export interface WXMLDocument {
  roots: Node[]
  errors: ErrorItem[]
  findNodeBefore(offset: number): Node
  findNodeAt(offset: number): Node
}

export class Node {
  public tag: string | undefined
  public closed = false
  public endTagStart: number | undefined
  public attributes: {[name: string]: string | null} | undefined
  public textContents: string [] = []
  public get attributeNames(): string[] {
    return this.attributes ? Object.keys(this.attributes).map(s => s.replace(/\|\d+$/, '')) : []
  }
  constructor(
    public start: number,
    public end: number,
    public children: Node[],
    public parent?: Node,
  ) {}
  public isSameTag(tagInLowerCase: string): boolean {
    if (!this.tag || !tagInLowerCase) {
      return false
    }
    return (
      this.tag.length === tagInLowerCase.length &&
      this.tag.toLowerCase() === tagInLowerCase
    )
  }
  public getAttributeAtOffset(offset: number): string | null {
    if (!this.attributes) return null
    for (let attr of Object.keys(this.attributes)) {
      let parts = attr.split('|')
      if (parts.length < 2) continue
      let start = parseInt(parts[1], 10)
      let end = start + parts[0].length
      if (offset >= start && offset <= end) {
        return attr
      }
    }
    return null
  }
  public getAttributeOffsets(name: string): number[] {
    if (!this.attributes) return []
    let res: number[] = []
    for (let attr of Object.keys(this.attributes)) {
      let parts = attr.split('|')
      if (parts[0] == name) {
        res.push(parseInt(parts[1], 10))
      }
    }
    return res
  }
  public getDuplicatedAttrs(): string[] {
    let names = this.attributeNames
    let res: string[] = []
    for (let name of names) {
      if (res.indexOf(name) === -1 && names.indexOf(name) !== names.lastIndexOf(name)) {
        res.push(name)
      }
    }
    return res
  }
  public getValueOffset(attributeName: string): number | null {
    if (!this.attributes) return null
    for (let attr of Object.keys(this.attributes)) {
      let parts = attr.split('|')
      if (attributeName === parts[0]) {
        let value = this.attributes[attr]
        if (value || value == '') {
          return parseInt(parts[1], 10) + attributeName.length + 2
        }
      }
    }
    return null
  }
  public getAttributeValue(attributeName: string): string | null {
    if (!this.attributes) return null
    for (let attr of Object.keys(this.attributes)) {
      let parts = attr.split('|')
      if (attributeName === parts[0]) {
        let value = this.attributes[attr]
        return value
      }
    }
    return null
  }
  public get isEmpty(): boolean {
    return this.children.length === 0 && this.textContents.length === 0
  }
  public get firstChild(): Node | undefined {
    return this.children[0]
  }
  public get lastChild(): Node | undefined {
    return this.children.length
      ? this.children[this.children.length - 1]
      : void 0
  }

  public findNodeBefore(offset: number): Node {
    let idx = findFirst(this.children, c => offset <= c.start) - 1
    if (idx >= 0) {
      let child = this.children[idx]
      if (offset > child.start) {
        if (offset < child.end) {
          return child.findNodeBefore(offset)
        }
        let lastChild = child.lastChild
        if (lastChild && lastChild.end === child.end) {
          return child.findNodeBefore(offset)
        }
        return child
      }
    }
    return this
  }

  public findNodeAt(offset: number): Node {
    let idx = findFirst(this.children, c => offset <= c.start) - 1
    if (idx >= 0) {
      let child = this.children[idx]
      if (offset > child.start && offset <= child.end) {
        return child.findNodeAt(offset)
      }
    }
    return this
  }
}

export function parse(text: string): WXMLDocument {
  let scanner = createScanner(text)

  let wxmlDocument = new Node(0, text.length, [], void 0)
  let curr = wxmlDocument
  let endTagStart = -1
  let pendingAttribute: string | null = null
  let token = scanner.scan()
  let errors: ErrorItem[] = []
  let tagStack: string[] = []
  let currOffset = -1

  while (token !== TokenType.EOS) {
    let errorMsg = scanner.getTokenError()
    if (errorMsg) {
      errors.push({
        message: errorMsg,
        offsetStart: scanner.getTokenOffset(),
        offeetEnd: scanner.getTokenEnd()
      })
    }
    // let text = scanner.getTokenType()
    // console.log(text)
    switch (token) {
      case TokenType.StartTagOpen:
        let child = new Node(scanner.getTokenOffset(), text.length, [], curr)
        curr.children.push(child)
        curr = child
        break
      case TokenType.StartTag:
        curr.tag = scanner.getTokenText()
        tagStack.push(`${curr.tag}|${scanner.getTokenOffset()}|${scanner.getTokenEnd()}`)
        if (!isValidTagName(curr.tag)) {
          errors.push({
            message: `Only [a-z] _ - allowed for tag name`,
            offsetStart: scanner.getTokenOffset(),
            offeetEnd: scanner.getTokenEnd()
          })
        }
        break
      case TokenType.StartTagClose:
        curr.end = scanner.getTokenEnd() // might be later set to end tag position
        if (curr.tag && isEmptyElement(curr.tag) && curr.parent) {
          curr.closed = true
          curr = curr.parent
        }
        break
      case TokenType.EndTagOpen:
        endTagStart = scanner.getTokenOffset()
        break
      case TokenType.EndTag:
        let closeTag = scanner.getTokenText().toLowerCase()
        while (!curr.isSameTag(closeTag) && curr.parent) {
          curr.end = endTagStart
          curr.closed = false
          curr = curr.parent
        }
        if (curr !== wxmlDocument) {
          curr.closed = true
          curr.endTagStart = endTagStart
        }
        let last = tagStack.pop()
        if (!last) {
          errors.push({
            message: `Start tag not found for <${closeTag}>`,
            offsetStart: scanner.getTokenOffset(),
            offeetEnd: scanner.getTokenEnd()
          })
        } else {
          let parts = last.toLowerCase().split('|')
          if (closeTag !== parts[0]) {
            errors.push({
              message: `Close tag not found for <${parts[0]}>`,
              offsetStart: parseInt(parts[1], 10),
              offeetEnd: parseInt(parts[2], 10),
            })
          }
        }
        break
      case TokenType.StartTagSelfClose:
        if (curr.parent) {
          curr.closed = true
          curr.end = scanner.getTokenEnd()
          curr = curr.parent
        }
        tagStack.pop()
        break
      case TokenType.EndTagClose:
        if (curr.parent) {
          curr.end = scanner.getTokenEnd()
          curr = curr.parent
        }
        break
      case TokenType.AttributeName: {
        pendingAttribute = scanner.getTokenText()
        if (!isValidAttribute(pendingAttribute)) {
          errors.push({
            message: `Invalid attribute ${pendingAttribute}`,
            offsetStart: scanner.getTokenOffset(),
            offeetEnd: scanner.getTokenEnd() - 1
          })
        }
        let attributes = curr.attributes
        if (!attributes) {
          curr.attributes = attributes = {}
        }
        currOffset = scanner.getTokenOffset()
        if (pendingAttribute) {
          attributes[pendingAttribute + `|${currOffset}`] = null // Support valueless attributes such as 'checked'
        }
        break
      }
      case TokenType.AttributeValue: {
        let value = scanner.getTokenText()
        if (!/^".*"$/.test(value)) {
          errors.push({
            message: `Double quote required for value`,
            offsetStart: scanner.getTokenOffset(),
            offeetEnd: scanner.getTokenEnd() - 1
          })
        }
        let attributes = curr.attributes
        if (attributes && pendingAttribute) {
          attributes[pendingAttribute + `|${currOffset}`] = value.replace(/^"/, '').replace(/"$/, '')
          pendingAttribute = null
        }
        break
      }
      case TokenType.Content: {
        let text = scanner.getTokenText().trim()
        if (text) {
          curr.textContents.push(text)
        }
        break
      }
    }
    token = scanner.scan()
  }
  while (curr.parent) {
    curr.end = text.length
    curr.closed = false
    curr = curr.parent
  }
  if (tagStack.length) {
    for (let item of tagStack) {
      let parts = item.toLowerCase().split('|')
      errors.push({
        message: `Close tag not found for <${parts[0]}>`,
        offsetStart: parseInt(parts[1], 10),
        offeetEnd: parseInt(parts[2], 10) - 1,
      })
    }
  }
  return {
    roots: wxmlDocument.children,
    findNodeBefore: wxmlDocument.findNodeBefore.bind(wxmlDocument),
    findNodeAt: wxmlDocument.findNodeAt.bind(wxmlDocument),
    errors,
  }
}
