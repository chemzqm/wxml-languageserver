<!-- https://developers.weixin.qq.com/miniprogram/dev/component/navigator.html -->

#### navigator

页面链接。

  属性名                   |  类型      |  默认值            |  说明                                       | 最低版本 
---------------------------|------------|--------------------|---------------------------------------------|----------
  url                      |  String    |                    |  应用内的跳转链接                           |          
  open-type                |  String    |  navigate          |  跳转方式                                   |          
  delta                    |  Number    |                    |当 open-type 为 'navigateBack' 时有效，表示回退的层数|          
  hover-class              |  String    |  navigator-hover   |指定点击时的样式类，当`hover-class="none"`时，没有点击态效果|          
  hover-stop-propagation   |  Boolean   |  false             |  指定是否阻止本节点的祖先节点出现点击态     |  1.5.0   
  hover-start-time         |  Number    |  50                |  按住后多久出现点击态，单位毫秒             |          
  hover-stay-time          |  Number    |  600               |  手指松开后点击态保留时间，单位毫秒         |          

**open-type 有效值：**

  值             |  说明                       | 最低版本 
-----------------|-----------------------------|----------
  navigate       | 对应 `wx.navigateTo` 的功能 |          
  redirect       | 对应 `wx.redirectTo` 的功能 |          
  switchTab      |  对应 `wx.switchTab` 的功能 |          
  reLaunch       |  对应 `wx.reLaunch` 的功能  |  1.1.0   
  navigateBack   |对应 `wx.navigateBack` 的功能|  1.1.0   

**注：`navigator-hover` 默认为 `{background-color: rgba(0, 0, 0, 0.1); opacity: 0.7;}`, `<navigator/>` 的子节点背景色应为透明色**

**示例代码：**

[在开发者工具中预览效果](wechatide://minicode/2Ec11cmI6BY1)

    /** wxss **/
    /** 修改默认的navigator点击态 **/
    .navigator-hover {
        color:blue;
    }
    /** 自定义其他点击态样式类 **/
    .other-navigator-hover {
        color:red;
    }
    

    <!-- sample.wxml -->
    <view class="btn-area">
      <navigator url="/page/navigate/navigate?title=navigate" hover-class="navigator-hover">跳转到新页面</navigator>
      <navigator url="../../redirect/redirect/redirect?title=redirect" open-type="redirect" hover-class="other-navigator-hover">在当前页打开</navigator>
      <navigator url="/page/index/index" open-type="switchTab" hover-class="other-navigator-hover">切换 Tab</navigator>
    </view>
    

    <!-- navigator.wxml -->
    <view style="text-align:center"> {{title}} </view>
    <view> 点击左上角返回回到之前页面 </view>
    

    <!-- redirect.wxml -->
    <view style="text-align:center"> {{title}} </view>
    <view> 点击左上角返回回到上级页面 </view>
    

    // redirect.js navigator.js
    Page({
      onLoad: function(options) {
        this.setData({
          title: options.title
        })
      }
    })
