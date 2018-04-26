### include

`include` 可以将目标文件**除了** `<template/>` `<wxs/>` 外的整个代码引入，相当于是拷贝到 `include` 位置，如：

    <!-- index.wxml -->
    <include src="header.wxml"/>
    <view> body </view>
    <include src="footer.wxml"/>
    

    <!-- header.wxml -->
    <view> header </view>
    

    <!-- footer.wxml -->
    <view> footer </view>
