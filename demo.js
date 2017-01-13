/**
 * Created by China-ls on 2017/1/13.
 */
'use strict';
angular.module('app', ['ls.bmap'])
    .controller('DemoCtrl', ['$scope', function ($scope) {
        $scope.consoleEle = document.getElementById("console");
        $scope.mapOpts = {
            apiKey: '7482d6d695c8d7d8dccca6d5de410704',
            center: {
                longitude: 121.595871,
                latitude: 31.187017
            },
            zoom: 17,
            enableScrollWheelZoom: true,
            enableMapClick: false,
            onMapLoadFild: function () {
                $scope.log('百度地图加载失败');
            }
        };

        $scope.log = function (log) {
            $scope.consoleEle.innerHTML += log + '<br>';
            $scope.consoleEle.scrollTop = $scope.consoleEle.scrollHeight;
        };

        $scope.onMapLoaded = function ($event, $params) {
            $scope.log('loaded');
        };

        $scope.onMapClick = function ($event, $params) {
            $scope.log('on Map Click! call scope onMapClick');

            $scope.mapOpts.center.latitude = $params[0].point.lat;
            $scope.mapOpts.center.longitude = $params[0].point.lng;

            // 这里是使用百度提供的API方法
            // var marker = new BMap.Marker($params[0].point);
            // marker.addEventListener("click", $scope.onMarkerClick);
            // $scope.myMap.addOverlay(marker);

            //这里是自定义的一个方法，传一个点击回调方法
            $scope.myMap.addMarker(new BMap.Marker($params[0].point), $scope.onMarkerClick);
        };

        $scope.onMarkerClick = function (e) {
            $scope.log('on Marker Click! call scope onMarkerClick, will open InfoWindow');

            $scope.currentMarker = e.target;
            console.warn($scope.currentMarker);
            $scope.myInfoWindow.open(e.target);
        };

        $scope.onInfoWindowClick = function (marker) {
            $scope.log('点击了"点我试试": [' + marker.point.lng + ',' + marker.point.lat + ']');
        };

        $scope.onInfoWindowClickClose = function($event, $params) {
            $scope.log('点击信息窗体关闭按钮');
        };

        $scope.onInfoWindowClose = function($event, $params) {
            $scope.log('信息窗体关闭');
        };

    }]);