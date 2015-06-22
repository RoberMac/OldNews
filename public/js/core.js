angular.module('ShinyaNews', [
    'ngTouch',
    'ngAnimate',
    'angular-storage',
    'ShinyaNews.stopPropagationDirective',
    'ShinyaNews.i18nDirective',
    'ShinyaNews.timeHelperServices'
])
.factory('oneDayStore', ['store', function(store){
    return store.getNamespacedStore('one-day-news', '-');
}])
.controller('rootController', [
        '$scope', '$http', '$timeout', 
        '$window', 'store', 'oneDayStore', 
        'syNewsTimeHelper',
    function ($scope, $http, $timeout, $window, store, oneDayStore, syNewsTimeHelper){

    /*************
     * 用戶介面相關
     *
     *  `$scope.isShow` 是否顯示 XXX（加載動畫、選擇新聞按鈕）
     *  `$scope.isNewsExist` 是否顯示「獲取新聞錯誤」提醒
     *  `$scope.isOldNews` & `$scope.toggleNews` 「新聞，」「舊聞。」切換
     *  `$scope.isShowTimeMachine & $scope.toggleTimeMachine` 顯示／隱藏「跳躍性選擇新聞介面」
     */
    $scope.isShow = false
    $scope.isNewsExist = true
    $scope.isOldNews = false
    $scope.isShowTimeMachine = false
    $scope.toggleNews = function (){
        $scope.isOldNews = !$scope.isOldNews
        // 背景色
        angular
        .element(document.documentElement)
        .toggleClass('oldNews')

        $scope.refreshNews()
    }
    $scope.toggleTimeMachine = function (){
        // 刷新時間
        $scope.timeMachineInfo = {
            H: new Date($scope.selectNewsInfo.selectDate).getHours(),
            M: new Date($scope.selectOldNewsInfo.selectDate).getMonth() + 1,
            D: new Date($scope.selectOldNewsInfo.selectDate).getDate()
        }
        $scope.isShowTimeMachine = !$scope.isShowTimeMachine
    }


    /*************
     * 獲取新聞相關
     *
     *  `newsBoxCache` 緩存已獲取的新聞
     *  `$scope.newsBox` 當前顯示的新聞
     *  `$scope.selectNewsInfo` 存儲「新聞，」當前新聞日期信息
     *  `$scope.selectOldNewsInfo` 存儲「舊聞。」當前新聞日期信息
     *  `$scope.timeMachineInfo` 存儲「跳躍性選擇新聞」的日期信息
     *  `$scope.isHideCaret--XXX` 是否隱藏選擇新聞按鈕
     *  `$scope.selectNews` 選擇新聞
     *  `$scope.timeMachineSelectNews` 「跳躍性選擇新聞」
     *  `$scope.refreshNews` 刷新新聞
     */
    var newsBoxCache = {},
        lastStep = -1;
    $scope.newsBox = []
    $scope.selectCountry = store.get('syNewsCountry') || 'HK'
    $scope.selectNewsInfo = {
        selectDate: syNewsTimeHelper.getHoursMs(new Date().getHours()),
        selectCountry: $scope.selectCountry,
        isAllDay: false
    }
    $scope.selectOldNewsInfo = {
        selectDate: syNewsTimeHelper.getDayMs(Date.now()) - 86400000,
        selectCountry: $scope.selectCountry,
        isAllDay: true
    }
    $scope.timeMachineInfo = {
        H: new Date().getHours(),
        M: new Date().getMonth() + 1,
        D: new Date().getDate()
    }
    $scope.isHideCaretLeft  = false
    $scope.isHideCaretRight = false
    $scope.selectNews = function (step){
        if (!$scope.isOldNews){
            // 選擇「新聞，」
            $scope.selectNewsInfo.selectDate += 3600000 * step
            getSelectedDateNews($scope.selectNewsInfo)
        } else {
            // 選擇「舊聞。」
            $scope.selectOldNewsInfo.selectDate += 86400000 * step
            getSelectedDateNews($scope.selectOldNewsInfo)
        }

        // 預加載判斷
        if (step === lastStep){
            getSelectedDateNews({
                selectDate: $scope.isOldNews
                                ? $scope.selectOldNewsInfo.selectDate + 86400000 * step
                                : $scope.selectNewsInfo.selectDate + 3600000 * step,
                selectCountry: $scope.selectCountry,
                isAllDay: $scope.isOldNews ? true : false
            }, true)
        } else {
            lastStep = step
        }
    }
    $scope.timeMachineSelectNews = function (){
        if (!$scope.isOldNews){
            $scope.selectNewsInfo.selectDate = syNewsTimeHelper.getHoursMs($scope.timeMachineInfo.H)
            getSelectedDateNews($scope.selectNewsInfo)
        } else {
            $scope.selectOldNewsInfo.selectDate = syNewsTimeHelper.getDayMs(
                new Date(2015, 
                $scope.timeMachineInfo.M - 1, 
                $scope.timeMachineInfo.D)
            )
            getSelectedDateNews($scope.selectOldNewsInfo)
        }
        $scope.isShowTimeMachine = false
    }
    $scope.refreshNews = function(){
        if ($scope.isOldNews){
            getSelectedDateNews($scope.selectOldNewsInfo)
        } else {
            getSelectedDateNews($scope.selectNewsInfo)
        }
    }

    // 當 `$scope.selectCountry` 變更，刷新「當前新聞信息」並獲取相應新聞
    $scope.$watch('selectCountry', function (newVal, oldVal){
        $scope.selectNewsInfo.selectCountry = newVal
        $scope.selectOldNewsInfo.selectCountry = newVal

        newVal !== oldVal
        ? $scope.refreshNews()
        : null
    })

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
    function getSelectedDateNews(selectData, isPreload){
        $scope.isOldNews
        ? checkSelectOldNewsCaret()
        : checkSelectNewsCaret()

        var news_id = selectData.selectDate + $scope.selectCountry,
            cache_data;
        if (!isPreload){
            $scope.newsBox = []
            $scope.isShow  = false
            $scope.isNewsExist = true
        }

        // 尝试从本地获取新闻
        cache_data = selectData.isAllDay
        ? newsBoxCache[news_id]
        : oneDayStore.get(news_id)
        if (cache_data){
            if (!isPreload){
                $scope.newsBox = cache_data
                $scope.isShow = true
                $scope.isNewsExist = true
            }
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
            if (isPreload){ return; }
            $timeout(function (){
                $scope.newsBox = data.msg
                $scope.isShow = true
                $scope.isNewsExist = true
            }, 717)
        })
        .error(function (data, status, headers, config){
            if (isPreload){ return; }
            $timeout(function (){
                $scope.newsBox = []
                $scope.isShow = true
                $scope.isNewsExist = false
            }, 717)
        })
    }
    function checkSelectNewsCaret(){
        var selectDate = $scope.selectNewsInfo.selectDate
        // 小於今日 0 時
        $scope.isHideCaretLeft = selectDate - 3600000 === syNewsTimeHelper.getDayMs(new Date())
        ? true
        : false
        // 大於現在時間
        $scope.isHideCaretRight = selectDate + 3600000 > Date.now()
        ? true
        : false
    }
    function checkSelectOldNewsCaret(){
        var selectDate = $scope.selectOldNewsInfo.selectDate
        $scope.isHideCaretLeft = false
        // 大於今日
        $scope.isHideCaretRight = selectDate + 172800000 > Date.now()
        ? true
        : false
    }
    function storeOneDayNews(news_id, news){
        oneDayStore.set(news_id, news)
        var tomorrow = Date.now() + 86400000
        store.set('oneDayNewsExpires', syNewsTimeHelper.getDayMs(tomorrow))
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