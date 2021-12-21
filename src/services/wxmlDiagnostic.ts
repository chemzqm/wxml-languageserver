/******************************************************************
MIT License http://www.opensource.org/licenses/mit-license.php
Author Qiming Zhao <chemzqm@gmail> (https://github.com/chemzqm)
*******************************************************************/
'use strict'
import {
  TextDocument,
  DiagnosticSeverity,
  Diagnostic
} from 'vscode-languageserver-types'
import {
  WXMLDocument,
  Node
} from '../parser/wxmlParser'
import {
  isSubAttrTag,
  getWXMLTagProvider,
  EMPTY_ELEMENTS,
  WXMLAttribute
} from '../parser/wxmlTags'
import path = require('path')
import fs = require('fs')

interface AttributeItem {
  type: string,
  info?: WXMLAttribute,
}

function isDynamicValue(value: string): boolean {
  return /^\{\{.+\}\}$/.test(value)
}

function isNumberValue(value: string): boolean {
  if (!value) return true
  return /^-?\d+(?:\.\d+)?$/.test(value)
}

export default function doDiagnostic(document: TextDocument, wxmlDocument: WXMLDocument): Diagnostic[] {
  let errors = wxmlDocument.errors
  let result: Diagnostic[] = []
  for (let error of errors) {
    let range = {
      start: document.positionAt(error.offsetStart),
      end: document.positionAt(error.offeetEnd)
    }
    result.push({
      range,
      severity: DiagnosticSeverity.Error,
      message: `Parse error: ${error.message}`
    })
  }
  let provider = getWXMLTagProvider()
  let globalTags: string[] = []
  provider.collectTags(name => {
    globalTags.push(name)
  })
  let uri = document.uri
  function iterate(node: Node): void {
    let tag = node.tag
    if (tag == null) return
    if (EMPTY_ELEMENTS.indexOf(tag) !== -1 && !node.isEmpty) {
      result.push({
        range: {
          start: document.positionAt(node.start),
          end: document.positionAt(node.end)
        },
        severity: DiagnosticSeverity.Error,
        message: 'Empty tag should not have children'
      })
    }
    if (tag === 'text') {
      let find = node.children.find(o => o.tag !== 'text')
      if (find) {
        result.push({
          range: {
            start: document.positionAt(find.start),
            end: document.positionAt(find.end)
          },
          severity: DiagnosticSeverity.Error,
          message: `${find.tag} not allowed in <text>`
        })
      }
    }
    if (tag === 'include' || tag === 'import') {
      let srcValue = node.getAttributeValue('src')
      if (/^file:\/\//.test(uri) && srcValue) {
        let dir = path.dirname(uri.replace(/^file:\/\//, ''))
        let fullPath = path.resolve(dir, srcValue)
        if (!fs.existsSync(fullPath)) {
          let start = node.getValueOffset('src')
          if (start) {
            result.push({
              range: {
                start: document.positionAt(start),
                end: document.positionAt(start + srcValue.length - 1)
              },
              severity: DiagnosticSeverity.Error,
              message: `File ${fullPath} not exist`
            })
          }
        }
      }
    }
    // check duplicated attributes
    let duplicatedAttrs = node.getDuplicatedAttrs()
    if (duplicatedAttrs.length) {
      for (let attr of duplicatedAttrs) {
        let offsets = node.getAttributeOffsets(attr)
        for (let offset of offsets) {
          result.push({
            range: {
              start: document.positionAt(offset),
              end: document.positionAt(offset + attr.length)
            },
            severity: DiagnosticSeverity.Error,
            message: `Duplicated attribute "${attr}"`
          })
        }
      }
    }
    if (globalTags.indexOf(tag) !== -1) {
      let attributes = node.attributeNames
      let allowedAttrs: { [index: string]: AttributeItem } = {}
      provider.collectAttributes(tag, (name, type, info) => {
        allowedAttrs[name] = {
          type: type || 'string',
          info
        }
      })
      if (isSubAttrTag(tag)) {
        let mode = node.getAttributeValue('mode')
        if (mode) {
          provider.collectAttributes(`$${tag} ${mode}`, (name, type, info) => {
            allowedAttrs[name] = {
              type: type || 'string',
              info
            }
          })
        }
      }

      let allowedAttrsNames = Object.keys(allowedAttrs)
      for (let attr of attributes) {
        let value = node.getAttributeValue(attr)
        let offset = node.getAttributeOffsets(attr)[0]
        if (/data-/.test(attr)) continue
        if (allowedAttrsNames.indexOf(attr) === -1) {
          if (offset) {
            result.push({
              range: {
                start: document.positionAt(offset),
                end: document.positionAt(offset + attr.length)
              },
              severity: DiagnosticSeverity.Error,
              message: `Unknown attribute "${attr}"`
            })
          }
          continue
        }
        if (attr === 'wx:else') {
          if (value) {
            result.push({
              range: {
                start: document.positionAt(offset),
                end: document.positionAt(offset + attr.length)
              },
              severity: DiagnosticSeverity.Warning,
              message: `Unnecessary value for "${attr}"`
            })
          }
          continue
        }
        if (value && isDynamicValue(value)) continue
        let type = allowedAttrs[attr].type
        switch (type) {
          case 'logic':
          case 'iterate':
          case 'event':
          case 'function':
            if (!value) {
              result.push({
                range: {
                  start: document.positionAt(offset),
                  end: document.positionAt(offset + attr.length)
                },
                severity: DiagnosticSeverity.Error,
                message: `Value required for attribute "${attr}"`
              })
            } else if (['wx:for', 'wx:for-items'].indexOf(attr) !== -1) {
              result.push({
                range: {
                  start: document.positionAt(offset),
                  end: document.positionAt(offset + attr.length)
                },
                severity: DiagnosticSeverity.Error,
                message: `Expression required for attribute "${attr}"`
              })
            }
            break
          case 'boolean':
            if (value && ['true', 'false'].indexOf(value) === -1) {
              let valueOffset = node.getValueOffset(attr) || offset
              value = value || ''
              result.push({
                range: {
                  start: document.positionAt(valueOffset),
                  end: document.positionAt(valueOffset + (value.length || 1))
                },
                severity: DiagnosticSeverity.Error,
                message: `Invalid value for boolean attribute "${attr}"`
              })
            }
            break
          case 'number':
            if (value && !isNumberValue(value)) {
              let valueOffset = node.getValueOffset(attr) || offset
              result.push({
                range: {
                  start: document.positionAt(valueOffset),
                  end: document.positionAt(valueOffset + value.length)
                },
                severity: DiagnosticSeverity.Error,
                message: `Invalid value for number attribute "${attr}"`
              })
            }
            break
          default: {
            // checke values
            let allowedValues: string[] = []
            provider.collectValues(tag, attr, value => {
              if (allowedValues.indexOf(value) === -1) {
                allowedValues.push(value)
              }
            })
            let info = allowedAttrs[attr].info
            let defaultValue = info ? info.defaultValue : null
            if (defaultValue === '无' || defaultValue === 'false') defaultValue = null
            if (!defaultValue && !value) {
              let valueOffset = node.getValueOffset(attr) || offset
              result.push({
                range: {
                  start: document.positionAt(valueOffset),
                  end: document.positionAt(valueOffset + 1)
                },
                severity: DiagnosticSeverity.Error,
                message: `Value required for attribute "${attr}"`
              })
            }
            if (value && allowedValues.length && allowedValues.indexOf(value) === -1) {
              let valueOffset = node.getValueOffset(attr) || offset
              result.push({
                range: {
                  start: document.positionAt(valueOffset),
                  end: document.positionAt(valueOffset + value.length)
                },
                severity: DiagnosticSeverity.Error,
                message: `Invalid value for enum attribute "${attr}"`
              })
            }
          }
        }
      }
    }
    for (let child of node.children) {
      iterate(child)
    }
  }
  for (let child of wxmlDocument.roots) {
    iterate(child)
  }
  // validate tags
  return result
}
