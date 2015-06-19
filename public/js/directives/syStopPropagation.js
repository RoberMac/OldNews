angular.module('ShinyaNews.stopPropagationDirective', [])
.directive('syNewsStopPropagation', function (){
    return {
        restrict: 'A',
        link: function (scope, elem, attr){
            elem.bind('click', function (e){
                e.stopPropagation()
            })
            elem.bind('touchstart', function (e){
                e.stopPropagation()
            })
        }
    }
})