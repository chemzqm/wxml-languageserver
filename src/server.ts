import {
  createConnection,
  TextDocuments,
  TextDocumentChangeEvent,
  InitializeParams,
  InitializeResult,
} from 'vscode-languageserver'
import {TextDocument, Diagnostic} from 'vscode-languageserver-types'

import {getManager} from './manager'

// Create a connection for the server
const connection =
  process.argv.length <= 2
    ? createConnection(process.stdin, process.stdout) // no arg specified
    : createConnection()

console.log = connection.console.log.bind(connection.console)
console.error = connection.console.error.bind(connection.console)

// Create a simple text document manager. The text document manager
// supports full document sync only
const documents = new TextDocuments()
// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection)

// let config: any = {}
let manager = getManager()

// After the server has started the client sends an initilize request. The server receives
// in the passed params the rootPath of the workspace plus the client capabilites
connection.onInitialize((params: InitializeParams): InitializeResult => {
  console.log('wxml-langserver initialized')
  // const initializationOptions = params.initializationOptions
  // if (initializationOptions) {
  //   config = initializationOptions.config
  // }
  documents.onDidClose(e => {
    manager.removeDocument(e.document.uri)
  })

  const capabilities = {
    // Tell the client that the server works in FULL text document sync mode
    textDocumentSync: documents.syncKind,
    completionProvider: {
      resolveProvider: true,
    },
    hoverProvider: true,
  }

  return {capabilities}
})

// The settings have changed. Is send on server activation as well.
connection.onDidChangeConfiguration((change: any) => {
  // config = change.settings
  // TODO vls.configure(config)
  // Update formatting setting
  documents.all().forEach(triggerValidation)
})

const pendingValidationRequests: {[uri: string]: NodeJS.Timer} = {}
const validationDelayMs = 200

// When the text document first opened or when its content has changed.
documents.onDidChangeContent((change: TextDocumentChangeEvent) => {
  triggerValidation(change.document)
})

// A document has closed: clear all diagnostics
documents.onDidClose((event: TextDocumentChangeEvent) => {
  cleanPendingValidation(event.document)
  connection.sendDiagnostics({uri: event.document.uri, diagnostics: []})
})
function cleanPendingValidation(textDocument: TextDocument): void {
  const request = pendingValidationRequests[textDocument.uri]
  if (request) {
    clearTimeout(request)
    delete pendingValidationRequests[textDocument.uri]
  }
}

function triggerValidation(textDocument: TextDocument): void {
  cleanPendingValidation(textDocument)
  pendingValidationRequests[textDocument.uri] = setTimeout(() => {
    delete pendingValidationRequests[textDocument.uri]
    validateTextDocument(textDocument)
  }, validationDelayMs)
}

function validateTextDocument(textDocument: TextDocument): void {
  const diagnostics: Diagnostic[] = manager.doDiagnostic(textDocument)
  connection.sendDiagnostics({uri: textDocument.uri, diagnostics})
}

connection.onCompletion(textDocumentPosition => {
  const document = documents.get(textDocumentPosition.textDocument.uri)
  return manager.doComplete(document, textDocumentPosition.position)
})

connection.onCompletionResolve(item => {
  // TODO maybe need to support resolve
  return item
})

connection.onHover(textDocumentPosition => {
  const document = documents.get(textDocumentPosition.textDocument.uri)
  return manager.doHover(document, textDocumentPosition.position)
})

// Listen on the connection
connection.listen()
