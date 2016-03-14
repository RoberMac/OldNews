angular
.module('ShinyaNews.utils.directives')
.directive('syAutoFocus', autoFocus);


function autoFocus($timeout) {
    return {
        restrict: 'A',
        scope: {},
        link: function($scope, $elem, $attr) {
            var timeout = ~~$attr.syAutoFocus || 0;

            $timeout(function (){
                $elem[0].focus()
            }, timeout)
        }
    }
}