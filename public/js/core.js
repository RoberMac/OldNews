angular.module('ShinyaNews', [
    'ngTouch',
    'ngAnimate',
    'ui.router',
    'angular-storage',
    'ShinyaNews.stopPropagationDirective',
    'ShinyaNews.i18nDirective',
    'ShinyaNews.timeHelperServices',
    'ShinyaNews.selectNewsItemServices',
    'ShinyaNews.oneDayStoreServices',
    'ShinyaNews.UIServices'
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
            country = JSON.parse(localStorage.getItem('syNewsCountry')) || "HK";

        return country + '/' + year + '/' + month + '/' + day + '?h=' + h;
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
.factory('oldNewsCache', ['$cacheFactory', function($cacheFactory){
    return $cacheFactory('oldNewsCache')
}])
.controller('rootController', [
        '$scope', '$http', '$timeout', '$window', 
        '$state', '$stateParams', 'store', 
        'oldNewsCache', 'syNewsTimeHelper', 
        'sySelectNewsItem', 'syOneDayStore', 'syUI',
    function ($scope, $http, $timeout, $window, 
        $state, $stateParams, store, 
        oldNewsCache, syNewsTimeHelper, 
        sySelectNewsItem, syOneDayStore, syUI){

    // 刪除緩存於本地的過期信息
    store.get('oneDayNewsExpires') < Date.now()
        ? syOneDayStore.removeAll()
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

        syUI.toggleBGC()
        syUI.cardFlip()

        if ($scope.isOldNews){
            // 切換到「新聞，」
            var newsDate = new Date($scope.selectNewsInfo.selectDate 
                            || syNewsTimeHelper.getHoursMs(new Date().getHours()))
            $state.go('date', {
                year : newsDate.getFullYear().toString(),
                month: (newsDate.getMonth() + 1).toString(),
                day  : newsDate.getDate().toString(),
                h    : newsDate.getHours().toString(),
                q    : null
            })
        } else {
            // 切換到「舊聞。」
            var oldNewsDate = new Date($scope.selectOldNewsInfo.selectDate
                                || syNewsTimeHelper.getDayMs(Date.now()) - 86400000)
            $state.go('date', {
                year : oldNewsDate.getFullYear().toString(),
                month: (oldNewsDate.getMonth() + 1).toString(),
                day  : oldNewsDate.getDate().toString(),
                h    : null,
                q    : $stateParams.h
                            ? null
                            : $stateParams.q
            })
        }

        $scope.isOldNews = !$scope.isOldNews
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
            q    : title
        }, { notify: false, reload: true })
    }

    /*************
     * 獲取新聞相關
     *
     *  `$scope.newsBox` 當前顯示的新聞
     *  `$scope.selectNewsInfo` 存儲「新聞，」當前新聞日期信息
     *  `$scope.selectOldNewsInfo` 存儲「舊聞。」當前新聞日期信息
     *  `$scope.timeMachineInfo` 存儲「跳躍性選擇新聞」的日期信息
     *  `$scope.search` 搜索
     *  `$scope.isHideCaret--XXX` 是否隱藏選擇新聞按鈕
     *  `$scope.selectNews` 選擇新聞
     *  `$scope.timeMachineSelectNews` 「跳躍性選擇新聞」
     *  `$scope.refreshNews` 刷新新聞
     *  `$scope.toggleFullScreen` 全屏模式
     */
    var lastStep = -1

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

        syUI.toggleDirection(step)

        // 屏蔽（移動端／鍵盤操作）無效的獲取新聞（滑動）
        if (step === 1 && $scope.isHideCaretRight || step === -1 && $scope.isHideCaretLeft){ return; }

        if (!$scope.isOldNews){
            // 選擇「新聞，」
            $state.go('date', {
                h: (parseInt($stateParams.h 
                                ? $stateParams.h 
                                : new Date().getHours()
                            ) + step).toString(),
                q: null
            })
        } else {
            // 選擇「舊聞。」
            var dateObj = syNewsTimeHelper.getDateObj(
                            $scope.selectOldNewsInfo.selectDate + 86400000 * step)
            $state.go('date', {
                month: dateObj.month,
                day  : dateObj.day,
                h    : null,
                q    : null
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

        // 重置新聞項
        sySelectNewsItem.reset()
    }
    $scope.timeMachineSelectNews = function (hour){
        if (!$scope.isOldNews){
            var h = hour
                        ? hour === -1
                            ? 1
                            : new Date().getHours()
                        : $scope.timeMachineInfo.H

            h <= $stateParams.h
                ? syUI.toggleDirection(-1)
                : syUI.toggleDirection(1)

            $state.go('date', {
                h    : h,
                q    : null
            })
        } else {
            $scope.timeMachineInfo.M  <= $stateParams.month 
            && $scope.timeMachineInfo.D <= $stateParams.day
                ? syUI.toggleDirection(-1)
                : syUI.toggleDirection(1)

            $state.go('date', {
                month: $scope.timeMachineInfo.M,
                day  : $scope.timeMachineInfo.D,
                h    : null,
                q    : null
            })
        }
        $scope.isShowTimeMachine = false
    }
    $scope.refreshNews = function(){
        $scope.isOldNews
            ? getSelectedDateNews($scope.selectOldNewsInfo)
            : getSelectedDateNews($scope.selectNewsInfo)
    }
    $scope.toggleFullscreen = function (){
        syUI.toggleFullScreen()
    }


    /******
     * 監聽
     *
     *  `$scope.search.title` 更新 URL
     *  `keydown` 鍵盤操作
     */
    $scope.$watch('search.title', function (newVal, oldVal){

        if (newVal === oldVal){ return; }

        $state.go('date', {
            q    : newVal
        }, { notify: false, reload: true })
    })
    $window.addEventListener('keydown', function (e){

        var keyCode = e.keyCode

        keyCode === 37    // ←
            ? $scope.selectNews(-1)
        : keyCode === 39  // →
            ? $scope.selectNews(1)
        : keyCode === 38  // ↑
            ? sySelectNewsItem.go(-1)
        : keyCode === 40  // ↓
            ? sySelectNewsItem.go(1)
        : null
    })


    /*********
     * Helper
     *
     *  `setSelectNewsState` 設置 `$scope.newsBox`, `$scope.isShow` & `$scope.isNewsExist`
     *  `getSelectedDateNews` 獲取選擇時段／日期的新聞
     *  `checkSelectNewsCaret` 檢測是否顯示選擇新聞按鈕
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
            if (lastStep === 1 && $scope.isHideCaretRight 
                || lastStep === -1 && $scope.isHideCaretLeft){ return; }
        } else {
            setSelectNewsState([], false, true)
            // 已閱標記
            $scope.isNewsDone = false
            if (syOneDayStore.get(newsID + '-Done')){
                $scope.isNewsDone = true
            } else if (!$scope.isOldNews){
                syOneDayStore.set(newsID + '-Done', true)
                $scope.isNewsDone = false
            }
        }

        // 尝试从本地获取新闻
        cache_data = selectData.isAllDay
                        ? oldNewsCache.get(newsID)
                        : syOneDayStore.get(newsID)
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
                oldNewsCache.put(newsID, data.msg)
            } else {
                syOneDayStore.set(newsID, data.msg)
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
}])