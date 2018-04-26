/******************************************************************
MIT License http://www.opensource.org/licenses/mit-license.php
Author Qiming Zhao <chemzqm@gmail> (https://github.com/chemzqm)
*******************************************************************/
/*
 * 生成 component 的 markdown 文件，然后拷贝到公共目录下
 */
const shell = require('gulp-shell')
const gulp = require('gulp')
const gulpSequence = require('gulp-sequence')
const path = require('path')
let TurndownService = require('turndown')
const flatten = require('gulp-flatten')
const getWXMLTagProvider = require('./lib/parser/wxmlTags').getWXMLTagProvider
const glob = require('glob')
const fs = require('fs')

gulp.task('generate', shell.task([
  'node node_modules/@minapp/generator/dist/cli/cmd.js tpl -m'
]))

gulp.task('copy', () => {
  let glob = path.join(__dirname, 'node_modules/@minapp/generator/gen/tpl', '**/*.md')
  return gulp.src(glob)
    .pipe(flatten())
    .pipe(gulp.dest('./gen'))
})

const attrRegex = /^\*\*\s*([^\s*]+)\s有效值/

gulp.task('inner', cb => {
  let provider = getWXMLTagProvider()
  let tags = []
  provider.collectTags(tag => {
    tags.push(tag)
  })

  function generateAttributeMarkdown(tag, attrs, lines, start) {
    let ms = lines[start].match(attrRegex)
    if (!ms) return
    let attr = ms[1]
    if (attrs.indexOf(attr) == -1) return
    let list = []
    for (let i = start, l = lines.length; i < l; i++) {
      let line = lines[i]
      if (i === start || !/^(#|\*)/.test(line)) {
        list.push(line)
      } else {
        break
      }
    }
    if (!fs.existsSync(`gen/${tag}`)) {
      fs.mkdirSync(`gen/${tag}`)
    }
    fs.writeFileSync(`gen/${tag}/${attr}.md`, list.join('\n'), 'utf8')
  }

  let files = glob.sync('gen/*.md')
  for (let file of files) {
    let newFile = null
    let newFileLines = []

    let attrs = []
    let lines = fs.readFileSync(file, 'utf8').split('\n')
    let name = path.basename(file, '.md')
    let i = 0
    provider.collectAttributes(name, n => {
      attrs.push(n)
    })
    for (let line of lines) {
      let ms = line.match(/^#{3,5}\s+([\w|-]+)/)
      if (ms) {
        let title = ms[1]
        if (name !== title && tags.indexOf(title) !== -1) {
          if (newFile) {
            fs.writeFileSync(newFile, newFileLines.join('\n'), 'utf8')
            newFileLines = []
          }
          newFile = `gen/${title}.md`
        }
      }
      if (newFile) {
        newFileLines.push(line)
      }
      if (attrRegex.test(line)) {
        generateAttributeMarkdown(name, attrs, lines, i)
      }
      i++
    }
    if (newFile) {
      fs.writeFileSync(newFile, newFileLines.join('\n'), 'utf8')
    }
  }
  cb()
})

gulp.task('check', cb => {
  let provider = getWXMLTagProvider()
  let tags = []
  provider.collectTags(tag => {
    tags.push(tag)
  })
  for (let tag of tags) {
    let file = path.join(__dirname, `gen/${tag}.md`)
    let exists = fs.existsSync(file)
    if (!exists) {
      console.log(tag)
    }
  }
  cb()
})

// html to markdown
gulp.task('convert', cb => {
  // change name when used
  let name = 'block'
  let content = fs.readFileSync(`./gen/${name}.html`, 'utf8')
  let turndownService = new TurndownService()
  let markdown = turndownService.turndown(content)
  fs.writeFileSync(`./gen/${name}.md`, markdown, 'utf8')
  cb()
})

gulp.task('default', cb => {
  gulpSequence('generate', 'copy', 'inner', 'check', cb)
})
