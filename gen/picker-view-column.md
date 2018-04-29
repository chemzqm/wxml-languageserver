#### picker-view-column

仅可放置于`<picker-view />`中，其孩子节点的高度会自动设置成与picker-view的选中框的高度一致

**示例代码：**

[在开发者工具中预览效果](wechatide://minicode/YfbJZcmG6zYM)

    <view>
      <view>{{year}}年{{month}}月{{day}}日</view>
      <picker-view indicator-style="height: 50px;" style="width: 100%; height: 300px;" value="{{value}}" bindchange="bindChange">
        <picker-view-column>
          <view wx:for="{{years}}" style="line-height: 50px">{{item}}年</view>
        </picker-view-column>
        <picker-view-column>
          <view wx:for="{{months}}" style="line-height: 50px">{{item}}月</view>
        </picker-view-column>
        <picker-view-column>
          <view wx:for="{{days}}" style="line-height: 50px">{{item}}日</view>
        </picker-view-column>
      </picker-view>
    </view>
    

    const date = new Date()
    const years = []
    const months = []
    const days = []
    
    for (let i = 1990; i <= date.getFullYear(); i++) {
      years.push(i)
    }
    
    for (let i = 1 ; i <= 12; i++) {
      months.push(i)
    }
    
    for (let i = 1 ; i <= 31; i++) {
      days.push(i)
    }
    
    Page({
      data: {
        years: years,
        year: date.getFullYear(),
        months: months,
        month: 2,
        days: days,
        day: 2,
        value: [9999, 1, 1],
      },
      bindChange: function(e) {
        const val = e.detail.value
        this.setData({
          year: this.data.years[val[0]],
          month: this.data.months[val[1]],
          day: this.data.days[val[2]]
        })
      }
    })
    

![picker_view](https://mp.weixin.qq.com/debug/wxadoc/dev/image/picker_view.png?t=2018428)

##### Tips：

1.  `tip`: 滚动时在iOS自带振动反馈，可在系统设置 -> 声音与触感 -> 系统触感反馈中关闭
