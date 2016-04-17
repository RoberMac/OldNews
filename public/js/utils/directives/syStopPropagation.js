angular
.module('OldNews.utils.directives')
.directive('nStopPropagation', stopPropagation);


function stopPropagation() {
    return {
        restrict: 'A',
        link    : function ($scope, $elem, $attr) {
            $elem.on('click', stopPropagation);
            $elem.on('touchstart', stopPropagation);

            function stopPropagation(e) {
                e.stopPropagation();
            }
        }
    };
}
