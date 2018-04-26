#### swiper-item

仅可放置在`<swiper/>`组件中，宽高自动设置为100%。

  属性名    |  类型     | 默认值 |  说明                 | 最低版本 
------------|-----------|--------|-----------------------|----------
  item-id   |  String   |  ""    |该 swiper-item 的标识符|  1.9.0   

**示例代码：**

    <swiper indicator-dots="{{indicatorDots}}"
      autoplay="{{autoplay}}" interval="{{interval}}" duration="{{duration}}">
      <block wx:for="{{imgUrls}}">
        <swiper-item>
          <image src="{{item}}" class="slide-image" width="355" height="150"/>
        </swiper-item>
      </block>
    </swiper>
    <button bindtap="changeIndicatorDots"> indicator-dots </button>
    <button bindtap="changeAutoplay"> autoplay </button>
    <slider bindchange="intervalChange" show-value min="500" max="2000"/> interval
    <slider bindchange="durationChange" show-value min="1000" max="10000"/> duration
    

    Page({
      data: {
        imgUrls: [
          'http://img02.tooopen.com/images/20150928/tooopen_sy_143912755726.jpg',
          'http://img06.tooopen.com/images/20160818/tooopen_sy_175866434296.jpg',
          'http://img06.tooopen.com/images/20160818/tooopen_sy_175833047715.jpg'
        ],
        indicatorDots: false,
        autoplay: false,
        interval: 5000,
        duration: 1000
      },
      changeIndicatorDots: function(e) {
        this.setData({
          indicatorDots: !this.data.indicatorDots
        })
      },
      changeAutoplay: function(e) {
        this.setData({
          autoplay: !this.data.autoplay
        })
      },
      intervalChange: function(e) {
        this.setData({
          interval: e.detail.value
        })
      },
      durationChange: function(e) {
        this.setData({
          duration: e.detail.value
        })
      }
    })
    

##### Bug & Tip

1.  `tip`: 如果在 `bindchange` 的事件回调函数中使用 `setData` 改变 `current` 值，则有可能导致 `setData` 被不停地调用，因而通常情况下请在改变 `current` 值前检测 `source` 字段来判断是否是由于用户触摸引起。
