angular.module('ShinyaNews', [
    'ngTouch',
    'ngAnimate',
    'ShinyaNews.newsController',
    'ShinyaNews.oldNewsController'
])
.controller('rootController', ['$rootScope', '$scope', function ($rootScope, $scope){
    
    $scope.isOldNews = false
    $scope.toggleNews = function (){
        $scope.isOldNews = !$scope.isOldNews
        // 背景色
        angular
        .element(document.documentElement)
        .toggleClass('oldNews')
    }
}])