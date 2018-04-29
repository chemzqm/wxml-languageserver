**mode 有效值：**

mode 有 13 种模式，其中 4 种是缩放模式，9 种是裁剪模式。

  值             |  说明                                                                                                                                                                                                                           
-----------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  scaleToFill    |缩放: 不保持纵横比缩放图片，使图片的宽高完全拉伸至填满 image 元素  原图：![](https://mp.weixin.qq.com/debug/wxadoc/dev/image/cat/0.jpg?t=2018428) 处理后: ![](https://mp.weixin.qq.com/debug/wxadoc/dev/image/cat/1.png?t=2018428)
  aspectFit      |缩放: 保持纵横比缩放图片，使图片的长边能完全显示出来。也就是说，可以完整地将图片显示出来。  原图：![](https://mp.weixin.qq.com/debug/wxadoc/dev/image/cat/0.jpg?t=2018428) 处理后: ![](https://mp.weixin.qq.com/debug/wxadoc/dev/image/cat/2.png?t=2018428)
  aspectFill     |缩放: 保持纵横比缩放图片，只保证图片的短边能完全显示出来。也就是说，图片通常只在水平或垂直方向是完整的，另一个方向将会发生截取。  原图：![](https://mp.weixin.qq.com/debug/wxadoc/dev/image/cat/0.jpg?t=2018428) 处理后: ![](https://mp.weixin.qq.com/debug/wxadoc/dev/image/cat/3.png?t=2018428)
  widthFix       |  缩放: 宽度不变，高度自动变化，保持原图宽高比不变                                                                                                                                                                               
  top            |  裁剪: 不缩放图片，只显示图片的顶部区域  原图：![](https://mp.weixin.qq.com/debug/wxadoc/dev/image/cat/0.jpg?t=2018428) 处理后: ![](https://mp.weixin.qq.com/debug/wxadoc/dev/image/cat/4.png?t=2018428)                        
  bottom         |  裁剪: 不缩放图片，只显示图片的底部区域  原图：![](https://mp.weixin.qq.com/debug/wxadoc/dev/image/cat/0.jpg?t=2018428) 处理后: ![](https://mp.weixin.qq.com/debug/wxadoc/dev/image/cat/5.png?t=2018428)                        
  center         |  裁剪: 不缩放图片，只显示图片的中间区域  原图：![](https://mp.weixin.qq.com/debug/wxadoc/dev/image/cat/0.jpg?t=2018428) 处理后: ![](https://mp.weixin.qq.com/debug/wxadoc/dev/image/cat/6.png?t=2018428)                        
  left           |  裁剪: 不缩放图片，只显示图片的左边区域  原图：![](https://mp.weixin.qq.com/debug/wxadoc/dev/image/cat/0.jpg?t=2018428) 处理后: ![](https://mp.weixin.qq.com/debug/wxadoc/dev/image/cat/7.png?t=2018428)                        
  right          |  裁剪: 不缩放图片，只显示图片的右边区域  原图：![](https://mp.weixin.qq.com/debug/wxadoc/dev/image/cat/0.jpg?t=2018428) 处理后: ![](https://mp.weixin.qq.com/debug/wxadoc/dev/image/cat/8.png?t=2018428)                        
  top left       |  裁剪: 不缩放图片，只显示图片的左上边区域  原图：![](https://mp.weixin.qq.com/debug/wxadoc/dev/image/cat/0.jpg?t=2018428) 处理后: ![](https://mp.weixin.qq.com/debug/wxadoc/dev/image/cat/9.png?t=2018428)                      
  top right      |  裁剪: 不缩放图片，只显示图片的右上边区域  原图：![](https://mp.weixin.qq.com/debug/wxadoc/dev/image/cat/0.jpg?t=2018428) 处理后: ![](https://mp.weixin.qq.com/debug/wxadoc/dev/image/cat/10.png?t=2018428)                     
  bottom left    |  裁剪: 不缩放图片，只显示图片的左下边区域  原图：![](https://mp.weixin.qq.com/debug/wxadoc/dev/image/cat/0.jpg?t=2018428) 处理后: ![](https://mp.weixin.qq.com/debug/wxadoc/dev/image/cat/11.png?t=2018428)                     
  bottom right   |  裁剪: 不缩放图片，只显示图片的右下边区域  原图：![](https://mp.weixin.qq.com/debug/wxadoc/dev/image/cat/0.jpg?t=2018428) 处理后: ![](https://mp.weixin.qq.com/debug/wxadoc/dev/image/cat/12.png?t=2018428)                     
