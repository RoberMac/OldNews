angular
.module('ShinyaNews.utils.directives')
.directive('syIcon', syIcon);


function syIcon() {
    return {
        restrict: 'E',
        replace : true,
        template: function ($elem, $attr) {
            var viewBox = $attr.viewbox || '0 0 100 100';
            var name = $attr.name;

            return [
                '<svg viewBox="' + viewBox + '">',
                '<use xlink:href="/public/img/icon-sprites.svg#' + name + '"></use>',
                '</svg>'
            ].join('');
        }
    };
}
