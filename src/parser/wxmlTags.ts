/******************************************************************
MIT License http://www.opensource.org/licenses/mit-license.php
Author Qiming Zhao <chemzqm@gmail> (https://github.com/chemzqm)
*******************************************************************/
import * as arrays from '../utils/arrays'
import * as strings from '../utils/strings'
import fs = require('fs')
import path = require('path')

export const EMPTY_ELEMENTS: string[] = [
  'audio',
  'video',
  'camera',
  'checkbox',
  'cover-image',
  'icon',
  'image',
  'input',
  'live-player',
  'live-pusher',
  'map',
  'open-data',
  'progress',
  'radio',
  'slider',
  'switch',
]

export function isEmptyElement(e: string): boolean {
  return (
    !!e &&
    arrays.binarySearch(
      EMPTY_ELEMENTS,
      e.toLowerCase(),
      (s1: string, s2: string) => s1.localeCompare(s2),
    ) >= 0
  )
}

function getSubAttribute(spec: WXMLTagSpecification): WXMLAttribute | null {
  let attrs = spec.attrs
  if (!attrs) return null
  for (let attr of attrs) {
    if (attr.hasOwnProperty('subAttrs')) {
      return attr
    }
  }
  return null
}

export interface IWXMLTagProvider {
  getId(): string
  isApplicable(languageId: string): boolean
  collectTags(collector: (tag: string, info?: WXMLTagSpecification) => void): void
  collectAttributes(
    tag: string,
    collector: (attribute: string, type?: string, info?: WXMLAttribute) => void,
  ): void
  collectValues(
    tag: string,
    attribute: string,
    collector: (value: string, info?: EnumItem) => void,
  ): void
}

export interface ITagSet {
  [tag: string]: WXMLTagSpecification
}

export interface EnumItem {
  value: string
  desc?: string
  since?: string
}

export interface WXMLAttribute {
  name: string
  type: {
    name: string
  },
  enum?: EnumItem[]
  desc?: string[]
  defaultValue?: string
  since?: string
  subAttrs?: SubAttribute[]
}

export interface SubAttribute {
  equal: string
  attrs: WXMLAttribute[]
}

export class WXMLTagSpecification {
  public name: string
  public desc?: string[]
  public attrs: WXMLAttribute[] = []
  public tips?: string[]
  public demoImages?: string[]
  public docLink?: string
  public subAttr?: boolean
  [index: string]: any
  constructor(config: WXMLTagSpecification) {
    for (let key of Object.keys(config)) {
      this[key] = config[key]
    }
  }
}

export interface WXMLTagSpecification {
}

interface IValueSets {
  [tag: string]: string[]
}

export function isSubAttrTag(tag: string): boolean {
  for (let name of Object.keys(WXML_TAGS)) {
    if (name === tag) {
      return WXML_TAGS[name].subAttr === true
    }
  }
  return false
}

export const WXML_TAGS = (() => {
  let componentConfig = fs.readFileSync(path.resolve(__dirname, '../../components.json'), 'utf8')
  let componentList: WXMLTagSpecification[] = JSON.parse(componentConfig)
  let TAGS: ITagSet = {}
  for (let item of componentList) {
    TAGS[item.name] = new WXMLTagSpecification(item)
    let subAttr = getSubAttribute(item)
    if (subAttr) {
      TAGS[item.name].subAttr = true
      let attrs = subAttr.subAttrs!
      for (let attr of attrs) {
        let name = `$${item.name} ${attr.equal}`
        let spec = {
          name,
          attrs: attr.attrs,
        }
        TAGS[name] = new WXMLTagSpecification(spec)
      }
    }

    if (item.name === 'input' || item.name === 'textarea') {
      let spec = TAGS[item.name]
      spec.attrs.push({
        name: 'name',
        type: {
          name: 'string',
        },
        desc: ['field name']
      })
    }
  }
  TAGS.wxs = new WXMLTagSpecification({
    name: 'wxs',
    desc: ['WeiXin Script'],
    docLink: 'https://developers.weixin.qq.com/miniprogram/dev/framework/view/wxs/index.html',
    tips: ['WXS（WeiXin Script）是小程序的一套脚本语言，结合 WXML，可以构建出页面的结构。'],
    attrs: [{
      name: 'module',
      type: {
        name: 'string',
      },
      desc: [
        'global variable name'
      ],
    }]
  })
  return TAGS
})()

export function getWXMLTagProvider(): IWXMLTagProvider {
  let globalAttributes = [
    'id:string',
    'class:string',
    'style:string',
    'hidden:boolean'
  ]
  let eventNames = ['tap', 'touchstart', 'touchmove', 'touchcancel', 'touchend',
    'longpress', 'longtap', 'transitionend', 'animationstart',
    'animationiteration', 'animationend', 'touchforcechange']

  let eventHandlers: string[] = []
  let logicAttributes = ['wx:if' , 'wx:elif' , 'wx:else']
  let iterateAttributes = ['wx:for', 'wx:item', 'wx:index', 'wx:key', 'wx:for-item', 'wx:for-index', 'wx:for-items']
  for (let name of eventNames) {
    eventHandlers.push(`bind:${name}`, `catch:${name}`, `catch${name}`, `bind${name}`)
  }

  let valueSets: IValueSets = {
    boolean: ['true', 'false']
  }

  return {
    getId: () => 'wxml',
    isApplicable: () => true,
    collectTags: (collector: (tag: string, info?: WXMLTagSpecification) => void) =>
      collectTagsDefault(collector, WXML_TAGS),
    collectAttributes: (
      tag: string,
      collector: (attribute: string, type?: string, info?: WXMLAttribute) => void,
    ) => {
      collectAttributesDefault(tag, collector, WXML_TAGS, globalAttributes)
      for (let handler of eventHandlers) {
        collector(handler, 'event')
      }
      for (let attr of logicAttributes) {
        if (['wx:if', 'wx:elif'].indexOf(attr) !== -1) {
          collector(attr, 'boolean')
        } else {
          collector(attr, 'logic')
        }
      }
      for (let attr of iterateAttributes) {
        collector(attr, 'iterate')
      }
    },
    collectValues: (
      tag: string,
      attribute: string,
      collector: (value: string, info?: EnumItem) => void,
    ) =>
      collectValuesDefault(
        tag,
        attribute,
        collector,
        WXML_TAGS,
        globalAttributes,
        valueSets,
      ),
  }
}

function collectTagsDefault(
  collector: (tag: string, info?: WXMLTagSpecification) => void,
  tagSet: ITagSet,
): void {
  for (let tag of Object.keys(tagSet)) {
    // tag of sub attr
    if (tag[0] !== '$') {
      collector(tag, tagSet[tag])
    }
  }
}

function collectAttributesDefault(
  tagName: string,
  collector: (attribute: string, type?: string, info?: WXMLAttribute) => void,
  tagSet: ITagSet,
  globalAttributes: string[],
): void {
  if (tagName) {
    let tag = tagSet[tagName]
    if (tag) {
      for (let attr of tag.attrs) {
        collector(attr.name, attr.type.name, attr)
      }
    }
  }
  for (let attr of globalAttributes) {
    let segments = attr.split(':')
    collector(segments[0], segments[1])
  }
}

function collectValuesDefault(
  tagName: string,
  attribute: string,
  collector: (value: string, info?: EnumItem) => void,
  tagSet: ITagSet,
  globalAttributes: string[],
  valueSets: IValueSets,
): void {
  let prefix = attribute + ':'
  for (let attr of globalAttributes) {
    if (attr.length > prefix.length && strings.startsWith(attr, prefix)) {
      let typeInfo = attr.substr(prefix.length)
      let values = valueSets[typeInfo]
      if (values) {
        for (let value of values) {
          collector(value)
        }
      }
      return
    }
  }

  if (tagName) {
    let tag = tagSet[tagName]
    if (tag) {
      let attr = tag.attrs.find(o => o.name === attribute)
      if (attr) {
        if (attr.type.name === 'boolean') {
          let values = valueSets.boolean
          for (let value of values) {
            collector(value)
          }
        }
        if (Array.isArray(attr.enum)) {
          for (let item of attr.enum) {
            collector(item.value, item)
          }
        }
      }
    }
  }

}
