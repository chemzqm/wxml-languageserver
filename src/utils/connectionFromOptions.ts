/******************************************************************
MIT License http://www.opensource.org/licenses/mit-license.php
Author Qiming Zhao <chemzqm@gmail> (https://github.com/chemzqm)
*******************************************************************/
import { IConnection } from 'vscode-languageserver'

import {IPCMessageReader, IPCMessageWriter} from 'vscode-jsonrpc'
import {createConnection} from 'vscode-languageserver'

import net = require('net')
import stream = require('stream')

export interface ConnOptions {
  method: 'socket' | 'stdio' | 'node-ipc'
  port? : number
}

export default function connectionFromOptions(options: ConnOptions): IConnection | null {
  let reader: any
  let writer: any

  switch (options.method) {
    case 'socket':
      // For socket connection, the message connection needs to be
      // established before the server socket starts listening.
      // Do that, and return at the end of this block.
      writer = new stream.PassThrough()
      reader = new stream.PassThrough()
      let server = net
        .createServer(socket => {
          server.close()
          socket.pipe(reader)
          writer.pipe(socket)
        })
        .listen(options.port)
      break
    case 'node-ipc':
      reader = new IPCMessageReader(process)
      writer = new IPCMessageWriter(process)
      break
    case 'stdio':
    default:
      reader = process.stdin
      writer = process.stdout
      break
  }

  return createConnection(reader, writer)
}
