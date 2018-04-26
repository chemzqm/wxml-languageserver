模板
==

WXML提供模板（template），可以在模板中定义代码片段，然后在不同的地方调用。

### 定义模板

使用 name 属性，作为模板的名字。然后在`<template/>`内定义代码片段，如：

    <!--
      index: int
      msg: string
      time: string
    -->
    <template name="msgItem">
      <view>
        <text> {{index}}: {{msg}} </text>
        <text> Time: {{time}} </text>
      </view>
    </template>
    

### 使用模板

使用 is 属性，声明需要的使用的模板，然后将模板所需要的 data 传入，如：

    <template is="msgItem" data="{{...item}}"/>
    

    Page({
      data: {
        item: {
          index: 0,
          msg: 'this is a template',
          time: '2016-09-15'
        }
      }
    })
    

is 属性可以使用 Mustache 语法，来动态决定具体需要渲染哪个模板：

    <template name="odd">
      <view> odd </view>
    </template>
    <template name="even">
      <view> even </view>
    </template>
    
    <block wx:for="{{[1, 2, 3, 4, 5]}}">
        <template is="{{item % 2 == 0 ? 'even' : 'odd'}}"/>
    </block>
    

### 模板的作用域

模板拥有自己的作用域，只能使用 data 传入的数据以及模版定义文件中定义的 `<wxs />` 模块。
