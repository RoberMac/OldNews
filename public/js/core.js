angular.module('ShinyaNews', [
    'ngTouch',
    'ngAnimate',
    'ui.router',
    'angular-storage',
    'ShinyaNews.stopPropagationDirective',
    'ShinyaNews.i18nDirective',
    'ShinyaNews.timeHelperServices'
])
.config(['$locationProvider', '$stateProvider', '$urlRouterProvider', 
    function($locationProvider, $stateProvider, $urlRouterProvider) {

    // 無效 URL，跳轉到今日現時「新聞，」
    $urlRouterProvider.otherwise(function (){
        var now     = new Date(),
            year    = now.getFullYear(),
            month   = now.getMonth() + 1,
            day     = now.getDate(),
            h       = now.getHours(),
            country = localStorage.getItem('syNewsCountry') || '"HK"';

        return JSON.parse(country) + '/' + year + '/' + month + '/' + day + '?h=' + h;
    })

    $locationProvider.html5Mode(true)

    $stateProvider
        .state('country', {
            abstract: true,
            url: "/{country:BR|CN|DE|FR|HK|IN|JP|KR|RU|TW|US}",
            template: '<div ui-view></div>',
            controller: ['$scope', '$stateParams', function ($scope, $stateParams){
                // 更改並保存「國家」
                $scope.saveCountry($stateParams.country)
            }]
        })
        .state('date', {
            parent: 'country',
            url: "/{year:2015}/{month:0?[1-9]|1[0-2]}/{day:0?[0-9]|[12][0-9]|3[0-1]}?h&q",
            templateUrl: '/public/dist/newsBox.min.html',
            controller: ['$scope', '$location', '$stateParams', 'store', 'syNewsTimeHelper', 
                function ($scope, $location, $stateParams, store, syNewsTimeHelper){

                var year    = $stateParams.year,
                    month   = $stateParams.month,
                    day     = $stateParams.day,
                    hour    = $stateParams.h;

                $scope.search.title = $stateParams.q

                if (syNewsTimeHelper.isToday(year, month, day)){

                    hour > 0 && hour <= 24
                        ? null
                        : $location.path('/')

                    $scope.selectNewsInfo.selectDate = syNewsTimeHelper.toHourMs(year, month, day, hour)
                } else {
                    $scope.selectOldNewsInfo.selectDate = syNewsTimeHelper.toDayMs(year, month, day)
                    store.set('lastOldNewsDate', $scope.selectOldNewsInfo.selectDate)

                    $scope.isOldNews
                        ? null
                        : $scope.toggleNews() // 從 URL 直接訪問「舊聞。」
                }
                $scope.refreshNews()
            }]
        })

}])
.factory('oneDayStore', ['store', function(store){
    return store.getNamespacedStore('one-day-news', '-');
}])
.controller('rootController', [
        '$scope', '$http', '$timeout', 
        '$window', '$state', '$stateParams', 'store', 
        'oneDayStore', 'syNewsTimeHelper',
    function ($scope, $http, $timeout, $window, $state, $stateParams, store, oneDayStore, syNewsTimeHelper){

    // 刪除緩存於本地的過期信息
    store.get('oneDayNewsExpires') < Date.now()
        ? removeOneDayNews()
        : null

    /*************
     * 用戶介面相關
     *
     *  `$scope.isShow` 是否顯示 XXX（加載動畫、選擇新聞按鈕）
     *  `$scope.isNewsExist` 是否顯示「獲取新聞錯誤」提醒
     *  `$scope.isOldNews` & `$scope.toggleNews` 「新聞，」「舊聞。」切換
     *  `$scope.isShowTimeMachine & $scope.toggleTimeMachine` 顯示／隱藏「跳躍性選擇新聞介面」
     *  `$scope.updateQueryParam` 「定位新聞」，更新 URL，方便分享新聞
     */
    $scope.isShow = false
    $scope.isNewsExist = true
    $scope.isOldNews = false
    $scope.isShowTimeMachine = false
    $scope.toggleNews = function (){

        // 翻面動畫
        var elem = angular.element(document.getElementById('view-newsBox'))
        elem.addClass('cardFlip')
        $timeout(function (){
            elem.removeClass('cardFlip')
        }, 777)

        if ($scope.isOldNews){
            // 切換到「新聞，」
            var newsDate = new Date($scope.selectNewsInfo.selectDate 
                            || syNewsTimeHelper.getHoursMs(new Date().getHours()))
            $state.go('date', {
                year : newsDate.getFullYear().toString(),
                month: (newsDate.getMonth() + 1).toString(),
                day  : newsDate.getDate().toString(),
                h    : newsDate.getHours().toString()
            })
        } else {
            // 切換到「舊聞。」
            var oldNewsDate = new Date($scope.selectOldNewsInfo.selectDate
                                || syNewsTimeHelper.getDayMs(Date.now()) - 86400000)
            $state.go('date', {
                year : oldNewsDate.getFullYear().toString(),
                month: (oldNewsDate.getMonth() + 1).toString(),
                day  : oldNewsDate.getDate().toString(),
                h    : null
            })
        }

        $scope.isOldNews = !$scope.isOldNews
        // 背景色
        angular
        .element(document.documentElement)
        .toggleClass('oldNews')
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
    $scope.updateQueryParam = function (title){
        $state.go('date', {
            year : $stateParams.year,
            month: $stateParams.month,
            day  : $stateParams.day,
            h    : $stateParams.h,
            q    : title
        }, { notify: false, reload: false })
    }

    /*************
     * 獲取新聞相關
     *
     *  `newsBoxCache` 緩存已獲取的新聞
     *  `$scope.newsBox` 當前顯示的新聞
     *  `$scope.selectNewsInfo` 存儲「新聞，」當前新聞日期信息
     *  `$scope.selectOldNewsInfo` 存儲「舊聞。」當前新聞日期信息
     *  `$scope.timeMachineInfo` 存儲「跳躍性選擇新聞」的日期信息
     *  `$scope.search` 搜索
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
        selectDate: 0,
        selectCountry: $scope.selectCountry,
        isAllDay: false
    }
    $scope.selectOldNewsInfo = {
        selectDate: store.get('lastOldNewsDate'),
        selectCountry: $scope.selectCountry,
        isAllDay: true
    }
    $scope.timeMachineInfo = {}
    $scope.search = {}
    $scope.isHideCaretLeft  = false
    $scope.isHideCaretRight = false
    $scope.selectNews = function (step){

        var elem = angular.element(document.getElementById('view-newsBox'))
        if (step === 1){
            elem.removeClass('rtl')
        } else {
            elem.addClass('rtl')
        }
        console.log(angular.element(document.getElementById('view-newsBox')))

        // 屏蔽（移動端）無效的獲取新聞（滑動）
        if (step === 1 && $scope.isHideCaretRight || step === -1 && $scope.isHideCaretLeft){ return; }

        if (!$scope.isOldNews){
            // 選擇「新聞，」
            $state.go('date', {
                year : $stateParams.year,
                month: $stateParams.month,
                day  : $stateParams.day,
                h    : (parseInt($stateParams.h 
                                    ? $stateParams.h 
                                    : new Date().getHours()
                                ) + step).toString()
            })
        } else {
            // 選擇「舊聞。」
            $state.go('date', {
                year : $stateParams.year,
                month: $stateParams.month,
                day  : (parseInt($stateParams.day) + step).toString(),
                h    : null
            })
        }

        // 預加載判斷
        if (step === lastStep){
            getSelectedDateNews({
                selectDate: $scope.isOldNews
                                ? $scope.selectOldNewsInfo.selectDate + 172800000 * step
                                : $scope.selectNewsInfo.selectDate + 7200000 * step,
                selectCountry: $scope.selectCountry,
                isAllDay: $scope.isOldNews ? true : false
            }, true)
        } else {
            lastStep = step
        }
    }
    $scope.timeMachineSelectNews = function (){
        if (!$scope.isOldNews){
            $state.go('date', {
                year : $stateParams.year,
                month: $stateParams.month,
                day  : $stateParams.day,
                h    : $scope.timeMachineInfo.H
            })
        } else {
            $state.go('date', {
                year : $stateParams.year,
                month: $scope.timeMachineInfo.M,
                day  : $scope.timeMachineInfo.D,
                h    : null
            })
        }
        $scope.isShowTimeMachine = false
    }
    $scope.refreshNews = function(){
        $scope.isOldNews
            ? getSelectedDateNews($scope.selectOldNewsInfo)
            : getSelectedDateNews($scope.selectNewsInfo)
    }


    /******
     * 監聽
     *
     *  `$scope.search.title` 更新 URL
     */
    $scope.$watch('search.title', function (newVal, oldVal){

        if (newVal === oldVal){ return; }

        $state.go('date', {
            year : $stateParams.year,
            month: $stateParams.month,
            day  : $stateParams.day,
            h    : $stateParams.h,
            q    : newVal
        }, { notify: false, reload: false })
    })


    /*********
     * Helper
     *
     *  `setSelectNewsState` 設置 `$scope.newsBox`, `$scope.isShow` & `$scope.isNewsExist`
     *  `getSelectedDateNews` 獲取選擇時段／日期的新聞
     *  `checkSelectNewsCaret` 檢測是否顯示選擇新聞按鈕
     *  `storeOneDayNews` 存储新闻与本地並設置過期時間
     *  `removeOneDayNews` 清除過期的新聞
     */
    function setSelectNewsState(data, isShow, isNewsExist){
        $scope.newsBox     = data
        $scope.isShow      = isShow
        $scope.isNewsExist = isNewsExist
    }
    function getSelectedDateNews(selectData, isPreload){
        $scope.isOldNews
            ? checkSelectOldNewsCaret()
            : checkSelectNewsCaret()

        var newsID = selectData.selectDate + $scope.selectCountry,
            cache_data;

        if (isPreload){
            // 取消預加載此新聞
            if (lastStep === 1 && $scope.isHideCaretRight || lastStep === -1 && $scope.isHideCaretLeft ){
                return;
            }
        } else {
            setSelectNewsState([], false, true)
        }

        // 尝试从本地获取新闻
        cache_data = selectData.isAllDay
            ? newsBoxCache[newsID]
            : oneDayStore.get(newsID)
        if (cache_data){
            isPreload
                ? null
                : setSelectNewsState(cache_data, true, true)

            return;
        }
        // 否则，從服務器获取新闻
        $http
        .post('/api/getSelectedDateNews', selectData)
        .success(function (data, status, headers, config){
            if (config.data.isAllDay){
                newsBoxCache[newsID] = data.msg
            } else {
                storeOneDayNews(newsID, data.msg)
            }
            if (isPreload){ return; }
            setSelectNewsState(data.msg, true, true)
        })
        .error(function (data, status, headers, config){
            if (isPreload){ return; }
            setSelectNewsState([], true, false)
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
    function storeOneDayNews(newsID, news){
        oneDayStore.set(newsID, news)
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