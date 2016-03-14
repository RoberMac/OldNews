angular
.module('ShinyaNews.utils.directives')
.directive('syAutoFocus', autoFocus);


function autoFocus() {
    return {
        restrict: 'A',
        scope: {},
        link: function($scope, $elem, $attr) {
            $elem[0].focus()
        }
    }
}