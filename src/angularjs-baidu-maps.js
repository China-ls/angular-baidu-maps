'use strict';

var loadBaiduPromise, isLoaded;
var loadBaiduMaps = function ($q, apiKey, version) {
    if (loadBaiduPromise) {
        return loadBaiduPromise;
    }
    var deferred = $q.defer(),
        resolve = function () {
            deferred.resolve(window.BMap ? window.BMap : false);
        },
        callbackName = "loadBaiduMaps_" + ( new Date().getTime() ),
        params = {"ak": apiKey, "v": version};

    if (window.BMap) {
        resolve();
    } else {
        angular.extend(params, {
            'v': version || '2.0', 'callback': callbackName
        });

        window[callbackName] = function () {
            resolve();
            //Delete callback
            setTimeout(function () {
                try {
                    delete window[callbackName];
                } catch (e) {
                }
            }, 20);
        };

        //TODO 后续改进加载效果
        var head = document.getElementsByTagName('HEAD').item(0);
        var bdscript = document.createElement("script");
        bdscript.type = "text/javascript";
        bdscript.src = 'http://api.map.baidu.com/api?v=' + params.v + '&ak=' + params.ak + '&callback=' + params.callback;
        head.appendChild(bdscript);
    }
    loadBaiduPromise = deferred.promise;
    return loadBaiduPromise;
};

function bindMapEvents(scope, eventsStr, baiduObject, element, prefix) {
    prefix = prefix || 'map-';
    angular.forEach(eventsStr.split(' '), function (eventName) {
        baiduObject.addEventListener(eventName, function (event) {
            element.triggerHandler(prefix + eventName, event);
            if (!scope.$$phase) {
                scope.$apply();
            }
        });
    });
}

var lsBaiduMapModule = angular.module('ls.bmap', []);

lsBaiduMapModule.value('uiBaiduMapConfig', {})
    .directive('uiBaiduMap', ['uiBaiduMapConfig', '$parse', '$q', function (uiBaiduMapConfig, $parse, $q) {

        var mapEvents = 'click dblclick rightclick rightdblclick maptypechange mousemove ' +
            'mouseover mouseout movestart moving moveend zoomstart ' +
            'zoomend addoverlay addcontrol removecontrol removeoverlay clearoverlays ' +
            'dragstart dragging dragend addtilelayer removetilelayer load resize hotspotclick ' +
            'hotspotover hotspotout tilesloaded touchstart touchmove touchend longpress';
        var options = uiBaiduMapConfig || {};

        return {
            restrict: 'A',
            link: function (scope, elm, attrs) {
                var opts = angular.extend({}, options, scope.$eval(attrs.mapOptions));
                scope.opts = opts;
                if (!opts.apiKey) {
                    throw new Error('no apiKey was set in options!');
                }

                var onLoadMapSuccess = function () {
                    var enableMapClick = (typeof opts.enableMapClick === 'undefined') ? true : opts.enableMapClick;
                    var map = new window.BMap.Map(elm[0], {enableMapClick: enableMapClick});
                    map.addMarker = function (marker, clickCallback) {
                        map.addOverlay(marker);
                        if (clickCallback) {
                            marker.addEventListener('click', clickCallback);
                        }
                    };
                    if (opts.center) {
                        var point = new BMap.Point(opts.center.longitude, opts.center.latitude); // 创建点坐标
                        map.centerAndZoom(point, opts.zoom || 11);
                    }
                    if (opts.enableScrollWheelZoom) {
                        map.enableScrollWheelZoom();
                    }
                    var model = $parse(attrs.uiBaiduMap);

                    model.assign(scope, map);

                    var events = scope.$eval(attrs.mapEvent);
                    angular.forEach(events, function (uiEvent, eventName) {
                        var fn = $parse(uiEvent);
                        elm.bind(eventName, function (evt) {
                            var params = Array.prototype.slice.call(arguments);
                            params = params.splice(1);
                            fn(scope, {$event: evt, $params: params});
                            if (!scope.$$phase) {
                                scope.$apply();
                            }
                        });
                    });

                    bindMapEvents(scope, mapEvents, map, elm);

                    elm.triggerHandler('map-loaded');
                };
                var onLoadMapFail = function () {
                    //TODO 后续改进，目前加载失败就失败了
                    opts.onMapLoadFild();
                };

                loadBaiduMaps($q, opts.apiKey).then(onLoadMapSuccess, onLoadMapFail);
            }
        };
    }])

    .value('uiBaiduMapInfoWindowConfig', {})

    .directive('uiBaiduMapInfoWindow',
        ['uiBaiduMapInfoWindowConfig', '$parse', '$compile', function (uiBaiduMapInfoWindowConfig, $parse, $compile) {

            var infoWindowEvents = 'clickclose close open maximize restore';
            var options = uiBaiduMapInfoWindowConfig || {};

            return {
                link: function (scope, elm, attrs) {
                    var onLoadMapSuccess = function () {
                        var opts = angular.extend({}, options, scope.$eval(attrs.uiOptions));
                        var model = $parse(attrs.uiBaiduMapInfoWindow);
                        var infoWindow = model(scope);

                        if (!infoWindow) {
                            infoWindow = new window.BMap.InfoWindow(elm[0], opts);
                            model.assign(scope, infoWindow);

                            var events = scope.$eval(attrs.infoWindowEvent);
                            angular.forEach(events, function (uiEvent, eventName) {
                                var fn = $parse(uiEvent);
                                infoWindow.addEventListener(eventName, function (evt) {
                                    var params = Array.prototype.slice.call(arguments);
                                    params = params.splice(1);
                                    fn(scope, {$event: evt, $params: params});
                                    if (!scope.$$phase) {
                                        scope.$apply();
                                    }
                                });
                            });
                        }

                        elm.replaceWith('<div></div>');
                        $compile(elm.contents())(scope);
                        infoWindow.open = function open(overlay) {
                            overlay.openInfoWindow(infoWindow);
                        };
                    };
                    // 为什么这里使用 先加载百度地图呢？因为测试发现你不先加载，百度地图不一定加载完成，会报错，导致指令无效
                    // TODO 后续改进
                    loadBaiduMaps().then(onLoadMapSuccess);
                }
            };
        }]);
