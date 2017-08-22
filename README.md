# `angular-baidu-maps` — 百度地图AngularJs指令示例

## 更新说明
修复信息窗体打开多次后，点击事件多次被调用的问题。

## Demo预览

在命令行中执行以下命令
```cmd
npm install
bower install
```
在浏览器中查看demo.html

## 修改源码后编译

源码在src目录下angularjs-baidu-maps.js，可在修改源码后运行如下命令，在dist目录生成angularjs-baidu-maps.min.js
```cmd
grunt uglify
```


## 使用方式

详细具体使用方式请参考 demo.html demo.js demo.css中内容

### js引入
```html
<script src="bower_components/angular/angular.js"></script>
<script src="dist/angularjs-baidu-maps.min.js"></script>
```

### 基本配置

js中对百度地图配置，通过一个对象mapOpts
```js
angular.module('app', ['ls.bmap'])
    .controller('DemoCtrl', ['$scope', function ($scope) {
        $scope.mapOpts = {
            apiKey: '替换成你的key',
            center: {longitude: 121.595871,latitude: 31.187017},
            zoom: 17,
            enableScrollWheelZoom: true,
            enableMapClick: false,
            onMapLoadFild: function () {
                //百度地图加载失败
            }
        };
    }]);
```
说明：
* mapOpts 百度地图配置对象，名称与html中map-options="mapOpts"一致
* apiKey 百度地图控制台申请的key，[百度地图KEY申请](http://lbsyun.baidu.com/apiconsole/key/create)
* center 初始化地图中心点
* zoom   初始化地图缩放级别
* enableScrollWheelZoom   是否允许鼠标控制地图缩放
* enableScrollWheelZoom   是否允许地图默认点击事件(true表示基本标注可以点击)
* onMapLoadFild  当地图加载失败回调

html模版中，配置如下
```html
<div id="map" style="height:500px;"
     ui-baidu-map="myMap"
     map-event="{'map-click': 'onMapClick($event, $params)', 'map-loaded': 'onMapLoaded($event, $params)'}"
     map-options="mapOpts">
</div>
```
说明：
* myMap是Controller中百度地图的引用，就是BMap.Map对象，我们可以使用百度地图提供的方法操作它。myMap可以换成任何值，这里只需要与上面controller中名称一致即可
* map-event指令中是描述百度地图的各种事件(地图点击、地图加载完成等等，可以到官方去查[地图参考](http://lbsyun.baidu.com/cms/jsapi/reference/jsapi_reference.html#a0b0)，配置方式相同，在事件前加'map-'，参数都是($event,$params)，$event包含地图事件的信息，$params是这个事件的参数列表(数组)
* map-options就是我们配置百度地图的对象名称，可以修改为任何值，与controller中保持一致

### 信息窗体配置
controller中配置信息窗体回调事件
```js
angular.module('app', ['ls.bmap'])
    .controller('DemoCtrl', ['$scope', function ($scope) {
        // ... 省略其他配置
        $scope.onInfoWindowClick = function (marker) {
            // 信息窗体内部，按钮点击事件，与angularjs事件绑定方式相同
        };

        $scope.onInfoWindowClickClose = function($event, $params) {
            //点击信息窗体关闭按钮 回调，右上角百度地图关闭信息窗体点击时出发。
        };

        $scope.onInfoWindowClose = function($event, $params) {
            //信息窗体关闭 回调，信息窗体关闭时触发
        };
    }]);
```
html模版中*信息窗体*配置(示例)，实际使用中，只需要把需要当作信息窗体的html段落加上ui-baidu-map-info-window指令即可
```html
<div ui-baidu-map-info-window="myInfoWindow"
     info-window-event="{'close' : 'onInfoWindowClose($event, $params)','clickclose' : 'onInfoWindowClickClose($event, $params)'}">
    <div class="m-b-sm">标注</div>
    <form role="form">
        <div class="form-group">
            <label for="lat">Lat:</label>
            <input id="lat" ng-model="currentMarker.point.lat" class="form-control input-sm w-sm m-l-lg">
        </div>
        <div class="form-group">
            <label for="lng">Lng:</label>
            <input id="lng" ng-model="currentMarker.point.lng" class="form-control input-sm w-sm m-l-lg">
        </div>
        <a class="btn btn-success btn-sm m-l-lg m-b-sm" ng-click="onInfoWindowClick(currentMarker)">点我试试</a>
    </form>
</div>
```
说明：
* ui-baidu-map-info-window="myInfoWindow"配置controller中操作InfoWindow的引用名称，可以替换为任何值
* info-window-event配置方式与地图事件相同，不同之处在于这里不需要加前缀
* ui-baidu-map-info-window指令所包含的所有内容都被当作InfoWindow的内容