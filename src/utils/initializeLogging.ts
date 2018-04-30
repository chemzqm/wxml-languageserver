/******************************************************************
MIT License http://www.opensource.org/licenses/mit-license.php
Author Qiming Zhao <chemzqm@gmail> (https://github.com/chemzqm)
 *******************************************************************/
import os = require('os')
import path = require('path')
import log4js = require('log4js')
import {IConnection} from 'vscode-languageserver'

const MAX_LOG_SIZE = 1024 * 1024
const MAX_LOG_BACKUPS = 10
const LOG_FILE_PATH = path.join(os.tmpdir(), 'wxml-language-server.log')

const level = process.argv.includes('--debug') ? 'DEBUG' : 'WARN'

export default function initializeLogging(connection: IConnection): void {
  log4js.configure({
    appenders: {
      out: {
        type: 'file',
        filename: LOG_FILE_PATH,
        maxLogSize: MAX_LOG_SIZE,
        backups: MAX_LOG_BACKUPS,
        layout: {
          type: 'pattern',
          // Format log in following pattern:
          // yyyy-MM-dd HH:mm:ss.mil $Level (pid:$pid) $categroy - $message.
          pattern: `%d{ISO8601} %p (pid:${process.pid}) %c - %m`,
        },
      },
      connection: {
        connection,
        type: path.join(__dirname, 'connectionConsoleAppender'),
      }
    },
    categories: {
      default: { appenders: [ 'out', 'connection' ], level}
    }
  })

  const logger = log4js.getLogger('wxml-language-server')
  process.on('uncaughtException', e => logger.error('uncaughtException', e))
  process.on('unhandledRejection', e => logger.error('unhandledRejection', e))

  // don't let anything write to the true stdio as it could break JSON RPC
  global.console.log = connection.console.log.bind(connection.console)
  global.console.error = connection.console.error.bind(connection.console)
}
