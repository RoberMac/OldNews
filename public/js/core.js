angular.module('ShinyaNews', [
    'ngTouch',
    'ngAnimate',
    'angular-storage',
    'ShinyaNews.timeHelperServices'
])
.factory('oneDayStore', ['store', function(store){
    return store.getNamespacedStore('one-day-news', '-');
}])
.controller('rootController', ['$scope', '$http', '$timeout', '$window', 'store', 'oneDayStore', 'syNewsTimeHelper',
    function ($scope, $http, $timeout, $window, store, oneDayStore, syNewsTimeHelper){

    /*************
     * 用戶介面相關
     *
     *  `$scope.isShow` 是否顯示 XXX（加載動畫、選擇新聞按鈕）
     *  `$scope.isNewsExist` 是否顯示「獲取新聞錯誤」提醒
     *  `$scope.isOldNews` & `$scope.toggleNews` 「新聞，」「舊聞。」切換
     *  ``
     */
    $scope.isShow = false
    $scope.isNewsExist = true
    $scope.isOldNews = false
    $scope.toggleNews = function (){
        $scope.isOldNews = !$scope.isOldNews
        // 背景色
        angular
        .element(document.documentElement)
        .toggleClass('oldNews')
        // 獲取新聞
        if ($scope.isOldNews){
            checkSelectOldNewsCaret()
            getSelectedDateNews($scope.selectOldNewsInfo)
        } else {
            checkSelectNewsCaret()
            getSelectedDateNews($scope.selectNewsInfo)
        }
    }


    /*************
     * 獲取新聞相關
     *
     *  `newsBoxCache` 緩存已獲取的新聞
     *  `$scope.newsBox` 當前顯示的新聞
     *  `$scope.selectNewsInfo` 存儲「新聞，」當前新聞日期信息
     *  `$scope.selectOldNewsInfo` 存儲「舊聞。」當前新聞日期信息
     *  `$scope.isHideCaret--XXX` 是否隱藏選擇新聞按鈕
     *  `$scope.selectNews` 選擇新聞
     */
    var newsBoxCache = {}
    $scope.newsBox = []
    $scope.selectCountry = 'CN'
    $scope.selectNewsInfo = {
        selectDate: syNewsTimeHelper.getUTCDayMs(new Date()) + new Date().getUTCHours() * 3600000,
        selectCountry: $scope.selectCountry,
        isAllDay: false
    }
    $scope.selectOldNewsInfo = {
        selectDate: syNewsTimeHelper.getLocalDayMs(Date.now()) - 86400000,
        selectCountry: $scope.selectCountry,
        isAllDay: true
    }
    $scope.isHideCaretLeft  = false
    $scope.isHideCaretRight = false
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


    /*********
     * Helper
     *
     *  `getSelectedDateNews` 獲取選擇時段／日期的新聞
     *  `checkSelectNewsCaret` 檢測是否顯示選擇新聞按鈕
     *  `storeOneDayNews` 存储新闻与本地並設置過期時間
     *  `removeOneDayNews` 清除過期的新聞
     */
    checkSelectNewsCaret()
    getSelectedDateNews($scope.selectNewsInfo)
    store.get('oneDayNewsExpires') < Date.now()
    ? removeOneDayNews()
    : null
    function getSelectedDateNews(selectData){
        var news_id = selectData.selectDate + $scope.selectCountry,
            cache_data;
        $scope.newsBox = []
        $scope.isShow  = false
        $scope.isNewsExist = true

        // 尝试从本地获取新闻
        cache_data = selectData.isAllDay
        ? newsBoxCache[news_id]
        : oneDayStore.get(news_id)
        if (cache_data){
            $scope.newsBox = cache_data
            $scope.isShow = true
            $scope.isNewsExist = true
            return;
        }
        // 否则，從服務器获取新闻
        $http
        .post('/api/getSelectedDateNews', selectData)
        .success(function (data, status, headers, config){
            if (config.data.isAllDay){
                newsBoxCache[news_id] = data.msg
            } else {
                storeOneDayNews(news_id, data.msg)
            }
            $timeout(function (){
                $scope.newsBox = data.msg
                $scope.isShow = true
                $scope.isNewsExist = true
            }, 717)
        })
        .error(function (data, status, headers, config){
            $timeout(function (){
                $scope.newsBox = []
                $scope.isShow = true
                $scope.isNewsExist = false
            }, 717)
            // cb('error', data.msg || $translate.instant('chat.NETWORK_ERROR_MSG'))
        })
    }
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
    function storeOneDayNews(news_id, news){
        oneDayStore.set(news_id, news)
        var tomorrow = Date.now() + 86400000
        store.set('oneDayNewsExpires', syNewsTimeHelper.getLocalDayMs(tomorrow))
    }
    function removeOneDayNews(){
        var ls = $window.localStorage,
            len = localStorage.length,
            reg = /^one-day-news-/,
            j = 0;
        for (var i = 0; i < len; i++){
            reg.test(ls.key(j))
            ? store.remove(ls.key(j))
            : j ++
        }
    }
}])