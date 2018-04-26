import {
  Position,
  TextDocument,
  Hover,
  Diagnostic,
  CompletionList,
} from 'vscode-languageserver-types'
import {parse} from './parser/wxmlParser'
import {WXMLDocument} from './parser/wxmlParser'
import doDiagnostic from './services/wxmlDiagnostic'
import doComplete from './services/wxmlComplete'
import doHover from './services/wxmlHover'

interface WXMLDocumentCache {
  [uri: string]: WXMLDocument
}

let cache: WXMLDocumentCache = {}

export interface Manager {
  getWxmlDocument(document: TextDocument): WXMLDocument
  parse(document: TextDocument):WXMLDocument
  removeDocument(uri: string):void
  doDiagnostic(document: TextDocument):Diagnostic[]
  doHover(document: TextDocument, position: Position): Hover | null
  doComplete(document: TextDocument, position: Position):CompletionList
}

export function getManager():Manager {
  return {
    getWxmlDocument(document: TextDocument): WXMLDocument {
      let {uri} = document
      let doc = cache[uri]
      if (doc) return doc
      return this.parse(document)
    },
    parse(document: TextDocument):WXMLDocument {
      let {uri} = document
      let doc = parse(document.getText())
      cache[uri] = doc
      return doc
    },
    removeDocument(uri: string):void {
      delete cache[uri]
    },
    doDiagnostic(document: TextDocument):Diagnostic[] {
      let doc = this.parse(document)
      return doDiagnostic(document, doc)
    },
    doHover(document: TextDocument, position: Position):Hover|null {
      let doc = this.getWxmlDocument(document)
      return doHover(document, position, doc)
    },
    doComplete(document: TextDocument, position: Position):CompletionList {
      let doc = this.getWxmlDocument(document)
      return doComplete(document, position, doc)
    }
  }
}
