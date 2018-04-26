**open-type 有效值：**

  值               |  说明                                                                                                                | 最低版本 
-------------------|----------------------------------------------------------------------------------------------------------------------|----------
  contact          |  打开客服会话                                                                                                        |  1.1.0   
  share            |  触发用户转发，使用前建议先阅读[使用指引](https://mp.weixin.qq.com/debug/wxadoc/dev/api/share.html#使用指引)         |  1.2.0   
  getUserInfo      |  获取用户信息，可以从bindgetuserinfo回调中获取到用户信息                                                             |  1.3.0   
  getPhoneNumber   |获取用户手机号，可以从bindgetphonenumber回调中获取到用户信息，[具体说明](https://mp.weixin.qq.com/debug/wxadoc/dev/api/getPhoneNumber.html)|  1.2.0   
  launchApp        |打开APP，可以通过app-parameter属性设定向APP传的参数[具体说明](https://mp.weixin.qq.com/debug/wxadoc/dev/api/launchApp.html)|  1.9.5   
