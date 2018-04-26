组件模版和样式
=======

类似于页面，自定义组件拥有自己的 `wxml` 模版和 `wxss` 样式。

### 组件模版

组件模版的写法与页面模板相同。组件模版与组件数据结合后生成的节点树，将被插入到组件的引用位置上。

在组件模板中可以提供一个 `<slot>` 节点，用于承载组件引用时提供的子节点。

**代码示例：**

    <!-- 组件模板 -->
    <view class="wrapper">
      <view>这里是组件的内部节点</view>
      <slot></slot>
    </view>
    

    <!-- 引用组件的页面模版 -->
    <view>
      <component-tag-name>
        <!-- 这部分内容将被放置在组件 <slot> 的位置上 -->
        <view>这里是插入到组件slot中的内容</view>
      </component-tag-name>
    </view>
    

注意，在模版中引用到的自定义组件及其对应的节点名需要在 `json` 文件中显式定义，否则会被当作一个无意义的节点。除此以外，节点名也可以被声明为[抽象节点](../plugin/generics.md)。

### 组件wxml的slot

在组件的wxml中可以包含 `slot` 节点，用于承载组件使用者提供的wxml结构。

默认情况下，一个组件的wxml中只能有一个slot。需要使用多slot时，可以在组件js中声明启用。

    Component({
      options: {
        multipleSlots: true // 在组件定义时的选项中启用多slot支持
      },
      properties: { /* ... */ },
      methods: { /* ... */ }
    })
    

此时，可以在这个组件的wxml中使用多个slot，以不同的 `name` 来区分。

    <!-- 组件模板 -->
    <view class="wrapper">
      <slot name="before"></slot>
      <view>这里是组件的内部细节</view>
      <slot name="after"></slot>
    </view>
    

使用时，用 `slot` 属性来将节点插入到不同的slot上。

    <!-- 引用组件的页面模版 -->
    <view>
      <component-tag-name>
        <!-- 这部分内容将被放置在组件 <slot name="before"> 的位置上 -->
        <view slot="before">这里是插入到组件slot name="before"中的内容</view>
        <!-- 这部分内容将被放置在组件 <slot name="after"> 的位置上 -->
        <view slot="after">这里是插入到组件slot name="after"中的内容</view>
      </component-tag-name>
    </view>
    

### 组件样式

组件对应 `wxss` 文件的样式，只对组件wxml内的节点生效。编写组件样式时，需要注意以下几点：

*   组件和引用组件的页面不能使用id选择器（`#a`）、属性选择器（`[a]`）和标签名选择器，请改用class选择器。
*   组件和引用组件的页面中使用后代选择器（`.a .b`）在一些极端情况下会有非预期的表现，如遇，请避免使用。
*   子元素选择器（`.a>.b`）只能用于 `view` 组件与其子节点之间，用于其他组件可能导致非预期的情况。
*   继承样式，如 `font` 、 `color` ，会从组件外继承到组件内。
*   除继承样式外， `app.wxss` 中的样式、组件所在页面的的样式对自定义组件无效。

    #a { } /* 在组件中不能使用 */
    [a] { } /* 在组件中不能使用 */
    button { } /* 在组件中不能使用 */
    .a > .b { } /* 除非 .a 是 view 组件节点，否则不一定会生效 */
    

除此以外，组件可以指定它所在节点的默认样式，使用 `:host` 选择器（需要包含基础库 [1.7.2](../compatibility.html "基础库 1.7.2 开始支持，低版本需做兼容处理。") 或更高版本的开发者工具支持）。

**代码示例：**

    /* 组件 custom-component.wxss */
    :host {
      color: yellow;
    }
    

    <!-- 页面的 WXML -->
    <custom-component>这段文本是黄色的</custom-component>
    

### 外部样式类

有时，组件希望接受外部传入的样式类（类似于 `view` 组件的 `hover-class` 属性）。此时可以在 `Component` 中用 `externalClasses` 定义段定义若干个外部样式类。这个特性从小程序基础库版本 [1.9.90](../compatibility.html "基础库 1.9.90 开始支持，低版本需做兼容处理。") 开始支持。

**代码示例：**

    /* 组件 custom-component.js */
    Component({
      externalClasses: ['my-class']
    })
    

    <!-- 组件 custom-component.wxml -->
    <custom-component class="my-class">这段文本的颜色由组件外的 class 决定</custom-component>
    

这样，组件的使用者可以指定这个样式类对应的 class ，就像使用普通属性一样。

**代码示例：**

    <!-- 页面的 WXML -->
    <custom-component my-class="red-text" />
    

    .red-text {
      color: red;
    }
