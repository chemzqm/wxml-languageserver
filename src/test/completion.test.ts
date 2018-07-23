/******************************************************************
MIT License http://www.opensource.org/licenses/mit-license.php
Author Qiming Zhao <chemzqm@gmail> (https://github.com/chemzqm)
*******************************************************************/
'use strict'

import * as assert from 'assert'
import doComplete from '../services/wxmlComplete'
import {parse} from '../parser/wxmlParser'

import {
  CompletionList,
  TextDocument,
  CompletionItemKind,
} from 'vscode-languageserver-types'

export interface ItemDescription {
  label: string
  documentation?: string
  kind?: CompletionItemKind
  resultText?: string
  notAvailable?: boolean
}

suite('HTML Completion', () => {

  let assertCompletion = (
    completions: CompletionList,
    expected: ItemDescription,
    document: TextDocument,
    offset: number,
  ): void => {
    let matches = completions.items.filter(completion => completion.label === expected.label)
    if (expected.notAvailable) {
      assert.equal(
        matches.length,
        0,
        expected.label + ' should not existing is results',
      )
      return
    }
    assert.equal(
      matches.length,
      1,
      expected.label +
        ' should only existing once: Actual: ' +
        completions.items.map(c => c.label).join(', '),
    )
    let match = matches[0]
    if (expected.documentation) {
      assert.equal(match.documentation, expected.documentation)
    }
    if (expected.kind) {
      assert.equal(match.kind, expected.kind)
    }
    if (expected.resultText && match.textEdit) {
      assert.equal(
        TextDocument.applyEdits(document, [match.textEdit]),
        expected.resultText,
      )
    }
  }

  let testCompletionFor = (
    value: string,
    expected: {count?: number; items?: ItemDescription[]}
  ): void => {
    let offset = value.indexOf('|')
    value = value.substr(0, offset) + value.substr(offset + 1)

    let document = TextDocument.create(
      'test://test/test.html',
      'html',
      0,
      value,
    )
    let position = document.positionAt(offset)
    let wxmlDoc = parse(document.getText())
    let list = doComplete(document, position, wxmlDoc, {
      useSnippet: true,
      completeEvent: true
    })

    // no duplicate labels
    let labels = list.items.map(i => i.label).sort()
    let previous:any = null
    for (let label of labels) {
      assert.ok(
        previous !== label,
        `Duplicate label ${label} in ${labels.join(',')}`,
      )
      previous = label
    }
    if (expected.count) {
      assert.equal(list.items, expected.count)
    }
    if (expected.items) {
      for (let item of expected.items) {
        assertCompletion(list, item, document, offset)
      }
    }
  }

  test('Completion', (): any => {
    testCompletionFor('<|', {
      items: [
        {label: 'view', resultText: '<view'},
        {label: 'scroll-view', resultText: '<scroll-view'},
        {label: 'text', resultText: '<text'},
      ],
    })

    testCompletionFor('<tex|', {
      items: [
        {label: 'text', resultText: '<text'}
      ],
    })
  })

  test('Completion attribute', (): void => {
    testCompletionFor('<text |', {
      items: [
        {label: 'selectable', resultText: '<text selectable'},
        {label: 'space', resultText: '<text space="$1"'},
        {label: 'decode', resultText: '<text decode'}
      ],
    })

    testCompletionFor('<text s|pa', {
      items: [
        {label: 'selectable', resultText: '<text selectable'},
        {label: 'space', resultText: '<text space="$1"'}
      ],
    })
  })

  test('Completion value', (): void => {
    testCompletionFor('<image mode="|"', {
      items: [
        {label: 'scaleToFill', resultText: '<image mode="scaleToFill"'},
        {label: 'aspectFit', resultText: '<image mode="aspectFit"'}
      ],
    })

    testCompletionFor('<image mode="|', {
      items: [
        {label: 'scaleToFill', resultText: '<image mode="scaleToFill'},
        {label: 'aspectFit', resultText: '<image mode="aspectFit'}
      ],
    })
  })

  test('Completion picker', (): void => {
    testCompletionFor('<picker mode="region" |', {
      items: [
        {label: 'custom-item', resultText: '<picker mode="region" custom-item="$1"'}
      ],
    })
  })

  test('Character entities', (): void => {
    testCompletionFor('<view>&|', {
      items: [
        {label: '&hookrightarrow;', resultText: '<view>&hookrightarrow;'},
        {label: '&plus;', resultText: '<view>&plus;'},
      ],
    })
    testCompletionFor('<view>Hello&|', {
      items: [
        {label: '&ZeroWidthSpace;', resultText: '<view>Hello&ZeroWidthSpace;'},
      ],
    })
    testCompletionFor('<view>Hello&gt|', {
      items: [{label: '&gtrdot;', resultText: '<view>Hello&gtrdot;'}],
    })
    testCompletionFor('<view &d|', {
      items: [{label: '&duarr;', notAvailable: true}],
    })
    testCompletionFor('<view&d|', {
      items: [{label: '&duarr;', notAvailable: true}],
    })
  })
})
