angular.module('ShinyaNews.autofocusDirective', [])
.directive('syNewsAutofocus', function (){
    return {
        restrict: 'A',
        link: function (scope, elem, attr){
            elem[0].focus()
        }
    }
})