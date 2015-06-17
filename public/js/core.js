angular.module('ShinyaNews', [
    'ngTouch',
    'ngAnimate',
    'ShinyaNews.timeHelperServices'
])
.controller('rootController', ['$scope', '$http', '$timeout', 'syNewsTimeHelper', function ($scope, $http, $timeout, syNewsTimeHelper){

    function getSelectedDateNews(selectData){
        $scope.isShow = false
        $http
        .post('/api/getSelectedDateNews', selectData)
        .success(function (data, status, headers, config){
            $timeout(function (){
                $scope.newsBox = data.msg
                $scope.isShow = true
            }, 717)
        })
        .error(function (data, status, headers, config){
            $timeout(function (){
                $scope.newsBox = []
                $scope.isShow = true
            }, 717)
            // cb('error', data.msg || $translate.instant('chat.NETWORK_ERROR_MSG'))
        })
    };
    $scope.isShow = false
    // 存儲「新聞，」當前新聞日期信息
    $scope.selectNewsInfo = {
        selectDate: syNewsTimeHelper.getUTCDayMs(new Date()) + new Date().getUTCHours() * 3600000,
        selectCountry: 'CN',
        isAllDay: false
    }
    // 存儲「舊聞。」當前新聞日期信息
    $scope.selectOldNewsInfo = {
        selectDate: syNewsTimeHelper.getUTCDayMs(new Date()) - 86400000,
        selectCountry: 'CN',
        isAllDay: true
    }

    // 獲取當前時段新聞
    getSelectedDateNews($scope.selectNewsInfo)

    // 切換「舊聞。」
    $scope.isOldNews = false
    // 當前顯示的新聞
    $scope.newsBox = []
    $scope.toggleNews = function (){
        $scope.isOldNews = !$scope.isOldNews
        // 背景色
        angular
        .element(document.documentElement)
        .toggleClass('oldNews')

        // 獲取新聞
        checkSelectNewsCaret()
        checkSelectOldNewsCaret()
        $scope.isOldNews
        ? getSelectedDateNews($scope.selectOldNewsInfo)
        : getSelectedDateNews($scope.selectNewsInfo)
    }

    $scope.isHideCaretLeft  = false
    $scope.isHideCaretRight = false
    function checkSelectNewsCaret(){
        var selectDate = $scope.selectNewsInfo.selectDate
        // 小於今日 0 時
        $scope.isHideCaretLeft = selectDate - 3600000 === syNewsTimeHelper.getLocalDayMs(new Date())
        ? true
        : false
        // 大於現在時間
        $scope.isHideCaretRight = selectDate + 3600000 > Date.now()
        ? true
        : false
    }
    function checkSelectOldNewsCaret(){
        var selectDate = $scope.selectOldNewsInfo.selectDate
        // 大於今日
        $scope.isHideCaretRight = selectDate + 172800000 > Date.now()
        ? true
        : false
    }
    checkSelectNewsCaret()
    $scope.selectNews = function (step){
        if (!$scope.isOldNews){
            // 選擇「新聞，」
            $scope.selectNewsInfo.selectDate += 3600000 * step
            getSelectedDateNews($scope.selectNewsInfo)
            checkSelectNewsCaret()
        } else {
            // 選擇「舊聞。」
            $scope.selectOldNewsInfo.selectDate += 86400000 * step
            getSelectedDateNews($scope.selectOldNewsInfo)
            checkSelectOldNewsCaret()
        }
    }

}])