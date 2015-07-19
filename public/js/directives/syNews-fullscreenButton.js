angular.module('ShinyaNews.fullscreenButtonDirective', [])
.directive('syNewsFullscreenButton', function (){
    return {
        restrict: 'E',
        template: '
            <svg class="fullscreen corner--bottom--left animate--faster" viewBox="0 0 156 158" xmlns="http://www.w3.org/2000/svg">
                <path class="animate--faster" d="M46.453 115.914c7.449 9.512 6.807 23.33-1.927 32.1-9.426 9.466-24.709 9.466-34.136 0-9.426-9.466-9.426-24.813 0-34.279 8.967-9.004 23.233-9.443 32.717-1.317l68.339-68.625c-8.751-9.508-8.528-24.344.669-33.58 9.426-9.466 24.709-9.466 34.136 0 9.426 9.466 9.426 24.813 0 34.279-8.497 8.532-21.752 9.374-31.188 2.524l-68.611 68.898z" stroke="#CECECF" stroke-width="5" fill="#CECECF"/>
            </svg>
        ',
        link: function (scope, elem, attr){
            // 切換全屏模式
            elem.bind('click', function (e){
                if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.mozFullScreenElement){
                    document.documentElement.requestFullscreen
                        ? document.documentElement.requestFullscreen()
                    : document.documentElement.mozRequestFullScreen
                        ? document.documentElement.mozRequestFullScreen()
                    : document.documentElement.webkitRequestFullscreen
                        ? document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT)
                    : null
                } else {
                    document.exitFullscreen
                        ? document.exitFullscreen()
                    : document.mozCancelFullScreen
                        ? document.mozCancelFullScreen()
                    : document.webkitExitFullscreen
                        ? document.webkitExitFullscreen()
                    : null
                }
            })
        }
    }
})