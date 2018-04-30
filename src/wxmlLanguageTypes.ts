/******************************************************************
MIT License http://www.opensource.org/licenses/mit-license.php
Author Qiming Zhao <chemzqm@gmail> (https://github.com/chemzqm)
*******************************************************************/
'use strict'

export interface CompletionConfig {
  useSnippet: boolean
  completeEvent: boolean
}

export interface WXMLConfig {
  complete: CompletionConfig
}

export enum TokenType {
  StartCommentTag,
  Comment,
  EndCommentTag,
  StartTagOpen,
  StartTagClose,
  StartTagSelfClose,
  StartTag,
  EndTagOpen,
  EndTagClose,
  EndTag,
  DelimiterAssign,
  AttributeName,
  AttributeValue,
  Content,
  Whitespace,
  Unknown,
  Script,
  EOS,
}

export enum ScannerState {
  WithinContent,
  AfterOpeningStartTag,
  AfterOpeningEndTag,
  WithinDoctype,
  WithinTag,
  WithinEndTag,
  WithinComment,
  WithinScriptContent,
  WithinStyleContent,
  AfterAttributeName,
  BeforeAttributeValue,
}

export interface Scanner {
  scan(): TokenType
  getTokenType(): TokenType
  getTokenOffset(): number
  getTokenLength(): number
  getTokenEnd(): number
  getTokenText(): string
  getTokenError(): string | undefined
  getScannerState(): ScannerState
}

export interface DocumentContext {
  resolveReference(ref: string, base?: string): string
}

export interface ErrorItem {
  message: string
  offsetStart: number
  offeetEnd: number
}
