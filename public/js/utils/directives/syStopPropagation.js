angular
.module('ShinyaNews.utils.directives')
.directive('syStopPropagation', stopPropagation);


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
