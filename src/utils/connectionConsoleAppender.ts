/******************************************************************
MIT License http://www.opensource.org/licenses/mit-license.php
Author Qiming Zhao <chemzqm@gmail> (https://github.com/chemzqm)
*******************************************************************/

import {IConnection} from 'vscode-languageserver'

function appender(config: {connection: IConnection}, layouts: any):any {
  const {connection} = config

  return (loggingEvent: any): void => {
    connection.console.log(layouts.basicLayout(loggingEvent))
  }
}

exports.configure = appender
