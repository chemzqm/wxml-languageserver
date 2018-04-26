import {createScanner} from './parser/wxmlScanner'
import {parse} from './parser/wxmlParser'
import doComplete from './services/wxmlComplete'
import doDiagnostic from './services/wxmlDiagnostic'
import doHover from './services/wxmlHover'
import { TextDocument,
  Position,
  CompletionList,
  Hover,
  Diagnostic} from 'vscode-languageserver-types'
import {
  Scanner
} from './wxmlLanguageTypes'
import {WXMLDocument} from './parser/wxmlParser'

export * from './wxmlLanguageTypes'
export * from 'vscode-languageserver-types'
export {Node, WXMLDocument} from './parser/wxmlParser'

export interface LanguageService {
  createScanner(input: string, initialOffset?: number): Scanner
  parseWXMLDocument(document: TextDocument): WXMLDocument
  doComplete(document: TextDocument, position: Position, wxmlDocument: WXMLDocument): CompletionList
  doHover(document: TextDocument, position: Position, wxmlDocument: WXMLDocument): Hover | null
  doDiagnostic(document: TextDocument, wxmlDocument: WXMLDocument): Diagnostic[]
}

export function getLanguageService(): LanguageService {
  return {
    createScanner,
    parseWXMLDocument: document => parse(document.getText()),
    doComplete,
    doHover,
    doDiagnostic,
  }
}
