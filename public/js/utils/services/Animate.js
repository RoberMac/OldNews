angular
.module('ShinyaNews.utils.services')
.factory('Animate', Animate);


function Animate($timeout){
    return {
        cardFlip: cardFlip,
        toggleDirection: toggleDirection
    };


    // 翻面動畫
    function cardFlip(){
        var elem = angular.element(document.querySelector('.ui-view-newsBox'));

        elem.addClass('cardFlip')

        $timeout(function (){
            elem.removeClass('cardFlip')
        }, 777)
    }
    // 切換新聞轉換方向
    function toggleDirection(step){
        var elem = angular.element(document.querySelector('.ui-view-newsBox'));

        if (step === 1){
            elem.removeClass('rtl')
        } else {
            elem.addClass('rtl')
        }
    }
}