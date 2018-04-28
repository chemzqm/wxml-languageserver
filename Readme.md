# Wxml-languageserver

微信小程序 wxml 的 language server。

## 主要功能

* 检查 wxml 完整性，各个节点标签名，属性，以及属性值是否满足要求
* 支持 doHover，方便查看标签和属性 markdown 文档
* 支持自动补全，包含标签名，属性，以及可枚举属性值
* 验证 import 和 include 中 src 定义的文件路径

## 本地使用

* clone 整个项目

    git clone https://github.com/chemzqm/wxml-langserver.git

* 安装依赖

    yarn install

* 执行 `yarn build` 编译 ts 文件
* 执行 `yarn test` 运行测试
* 执行 `gulp` 生成本地 markdown 文档
* 执行 `./bin/wxml-langserver` 运行服务

## 已知问题

* picker 没有正确处理, 应该根据 mode 进行验证和补全
* movable-view 属性补全

## TODO

* find refenences

## 感谢

本项目使用了 [qiu8310/minapp](https://github.com/qiu8310/minapp) 提供的
component.json 以及 [@miniapp/generator](https://github.com/qiu8310/minapp/tree/master/packages/minapp-generator)

本项目使用/参考了以下项目的部分代码：

* [Microsoft/vscode-html-languageservice](https://github.com/Microsoft/vscode-html-languageservice)
* [flowtype/flow-language-server](https://github.com/flowtype/flow-language-server)
* [vuejs/vetur](https://github.com/vuejs/vetur)

## 项目协议

MIT
