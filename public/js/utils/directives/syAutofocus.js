angular
.module('OldNews.utils.directives')
.directive('nAutoFocus', autoFocus);


function autoFocus($timeout) {
    return {
        restrict: 'A',
        scope   : {},
        link    : function ($scope, $elem, $attr) {
            var timeout = parseInt($attr.nAutoFocus, 10) || 0;

            $timeout(function () {
                $elem[0].focus();
            }, timeout);
        }
    };
}
