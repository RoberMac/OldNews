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
    }
}])