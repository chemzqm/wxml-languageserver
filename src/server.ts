import {
  TextDocuments,
  TextDocumentChangeEvent,
  InitializeParams,
  InitializeResult,
} from 'vscode-languageserver'
import {IConnection} from 'vscode-languageserver'
import {
  DidChangeConfigurationParams,
  MessageType
} from 'vscode-languageserver-protocol'
import {TextDocument, Diagnostic} from 'vscode-languageserver-types'
import {getManager} from './manager'
import {getLogger} from 'log4js'
import uuid = require('uuid')

export function createServer(connection: IConnection): { listen():void } {
  const logger = getLogger('server')
  const documents = new TextDocuments()
  const manager = getManager()
  let shouldShutdown = false

  connection.onShutdown(() => {
    shouldShutdown = true
  })

  process.on('exit', code => {
    if (code !== 0) {
      connection.sendNotification('window/showMessage', {
        type: MessageType.Error,
        message: `wxml language server abnormal exit with code ${code}`
      })
    }
  })

  connection.onExit(() => {
    connection.sendNotification('window/showMessage', {
      type: MessageType.Info,
      message: 'wxml service exited'
    })
    if (shouldShutdown) {
      process.exit()
    } else {
      process.exit(1)
    }
  })

  connection.onInitialize((params: InitializeParams): InitializeResult => {
    logger.info('server initialized')
    const initializationOptions = params.initializationOptions
    if (initializationOptions) {
      const {textDocument} = params.capabilities
      logger.debug(JSON.stringify(params))
      // TODO it should only receive options of wxml
      let {wxml} = initializationOptions
      // make useSnippet false if client not support it
      if (wxml
        && wxml.complete
        && textDocument
        && textDocument.completion
        && textDocument.completion.completionItem
        && textDocument.completion.completionItem.snippetSupport === false) {
        // the client said no snippet
        wxml.complete.useSnippet = false
      }
      logger.debug(`Config: ${JSON.stringify(wxml)}`)
      if (wxml) manager.setConfig(wxml)
    }
    documents.onDidClose(e => {
      manager.removeDocument(e.document.uri)
    })

    const capabilities = {
      // Tell the client that the server works in FULL text document sync mode
      textDocumentSync: documents.syncKind,
      completionProvider: {
        resolveProvider: false,
      },
      hoverProvider: true,
    }

    connection.sendRequest('client/registerCapability', {
      registrations: [{
        id: uuid.v4(),
        method: 'textDocument/didOpen',
        documentSelector: [{pattern: '*.wxml'}]
      }]
    }).then(() => {
    }, err => {
      logger.error(err)
    })

    return {capabilities}
  })

  // The settings have changed. Is send on server activation as well.
  connection.onDidChangeConfiguration((change: DidChangeConfigurationParams) => {
    let config = change.settings
    manager.setConfig(config)
  })

  const pendingValidationRequests: {[uri: string]: NodeJS.Timer} = {}
  const validationDelayMs = 100

  documents.onDidOpen((change: TextDocumentChangeEvent) => {
    triggerValidation(change.document)
  })

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
    if (!document) return null
    return manager.doComplete(document, textDocumentPosition.position)
  })

  connection.onCompletionResolve(item => {
    // TODO maybe need to support resolve, vim not supported
    return item
  })

  connection.onHover(textDocumentPosition => {
    const document = documents.get(textDocumentPosition.textDocument.uri)
    if (!document) return null
    return manager.doHover(document, textDocumentPosition.position)
  })

  return {
    listen():void {
      documents.listen(connection)
      connection.listen()
    }
  }
}
