angular.module('ShinyaNews.UIServices', [])
.service('syUI', ['$timeout', function($timeout){

    // 翻面動畫
    this.cardFlip = function(){
        var elem = angular.element(document.getElementById('view-newsBox'))
        elem.addClass('cardFlip')
        $timeout(function (){
            elem.removeClass('cardFlip')
        }, 777)
    },
    // 切換背景色
    this.toggleBGC = function (){
        angular
        .element(document.documentElement)
        .toggleClass('oldNews')
    },
    // 切換新聞轉換方向
    this.toggleDirection = function (step){
        var elem = angular.element(document.getElementById('view-newsBox'))
        if (step === 1){
            elem.removeClass('rtl')
        } else {
            elem.addClass('rtl')
        }
    },
    // 切換全屏模式
    this.toggleFullScreen = function (){
        if (!document.fullscreenElement
         && !document.webkitFullscreenElement
         && !document.msFullscreenElement){
            document.documentElement.requestFullscreen
                ? document.documentElement.requestFullscreen()
            : document.documentElement.mozRequestFullScreen
                ? document.documentElement.mozRequestFullScreen()
            : document.documentElement.webkitRequestFullscreen
                ? document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT)
            : null
        } else {
            document.exitFullscreen
                ? document.exitFullscreen()
            : document.mozCancelFullScreen
                ? document.mozCancelFullScreen()
            : document.webkitExitFullscreen
                ? document.webkitExitFullscreen()
            : null
        }
        angular.element(document.getElementsByClassName('fullscreen')[0]).toggleClass('fullscreen--on')
    }
}])