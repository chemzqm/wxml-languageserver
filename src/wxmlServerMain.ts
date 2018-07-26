import {createServer} from './server'
import connectionFromOptions from './utils/connectionFromOptions'

const argv = process.argv.slice(2)
if (argv.indexOf('-h') !== -1) {
  process.stdout.write(`
    wxml Language Service Command-Line Interface.

    Usage: wxml [args]

    -h --help         show this help
    --stdio           Use stdio to communicate with the server, default behaviour
    --node-ipc        Use node-ipc to communicate with the server. Useful for calling from a node.js client
    --socket [port]   Use a socket (with a port number like --socket 5051) to communicate with the server
  `)
  process.exit()
}

const options:any = {}
const methods = ['node-ipc', 'stdio', 'socket']
const method = argv.find(m => methods.indexOf(m.slice(2)) !== -1)
options.method = method ? method.slice(2) : 'stdio'

if (options.method === 'socket') {
  let idx = argv.findIndex(m => m == '--socket')
  options.port = argv[idx + 1]

  cliInvariant(options.port, '--socket option requires port.')
}

const connection = connectionFromOptions(options)
if (connection) {
  console.log = connection.console.log.bind(connection.console)
  console.error = connection.console.error.bind(connection.console)
  createServer(connection).listen()
}

function cliInvariant(condition, ...msgs):void {
  if (!condition) {
    /* eslint-disable no-console */
    console.error('ERROR:', ...msgs)
    /* eslint-enable */
    process.exit(1)
  }
}

process.on('uncaughtException', e => console.error('uncaughtException:' + e.message))
process.on('unhandledRejection', e => console.error('unhandledRejection:' + e.message))
