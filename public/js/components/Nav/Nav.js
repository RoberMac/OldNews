angular
.module('ShinyaNews.components.Nav', [])
.constant('COUNTRIES', ['HK', 'CN', 'JP', 'TW', 'US', 'BR', 'IN', 'KR', 'RU', 'DE', 'FR'])
.directive('syNav', syNav);


function syNav(){
    return {
        restrict: 'E',
        replace: true,
        controller: NavCtrl,
        controllerAs: 'navVM',
        templateUrl: 'components/Nav/Nav.html'
    };
}
function NavCtrl(
    $scope, $window, $timeout,
    $state, $stateParams, store,
    COUNTRIES, TIME, TimeHelper
){

    var vm = this;
    this.state = {
        isShowCaretLeft: true,
        isShowCaretRight: true,
        countryList: getInitCountry()
    };
    vm.selectNews = selectNews;
    vm.togglehNewsType = togglehNewsType;
    vm.handleCountryClick = handleCountryClick;

    // Events
    $scope.$on('keyDown:esc', handleKeyDownEsc)
    $scope.$on('keyDown:leftOrRightArrow', handleKeyDownLeftOrRightArrow)
    $scope.$on('fetchNews:start', checkCaret)


    function selectNews(step) {
        var isOldNews = $scope.rootVM.state.isOldNews;
        var newsDate = TimeHelper.newsDateMs(isOldNews);

        // 屏蔽（移動端／鍵盤操作）無效的獲取新聞（滑動）
        if (step === 1 && !vm.state.isShowCaretRight || step === -1 && !vm.state.isShowCaretLeft) return;

        switch (isOldNews) {
            case true:
                var nextDate = TimeHelper.dateFormatter(newsDate + TIME.ONE_DAY * step);
                $state.go('news', {
                    year : nextDate.year,
                    month: nextDate.month,
                    day  : nextDate.day,
                    h    : null,
                    q    : null
                });
                break;
            case false:
                var nextHour = parseInt($stateParams.h || new Date().getHours()) + step;
                $state.go('news', {
                    h: nextHour,
                    q: null
                })
                break;
        }
    }
    function handleKeyDownEsc() {
        vm.state.countryList = getInitCountry();
    }
    function handleKeyDownLeftOrRightArrow(event, payload) {
        vm.selectNews(payload.step)
    }
    function checkCaret() {
        var isOldNews = $scope.rootVM.state.isOldNews;
        var newsDate = TimeHelper.newsDateMs(isOldNews);

        switch (isOldNews) {
            case true:
                // Always Show Left
                vm.state.isShowCaretLeft = true;
                // Before Today
                vm.state.isShowCaretRight = newsDate + TIME.TWO_DAYS <= Date.now();
                break;
            case false:
                // After 0:00
                vm.state.isShowCaretLeft = newsDate - TIME.ONE_HOUR !== TimeHelper.todayMs();
                // Before Now Hour
                vm.state.isShowCaretRight = newsDate + TIME.ONE_HOUR <= Date.now();
                break;
        }
    }
    function togglehNewsType() {
        var isOldNews = $scope.rootVM.state.isOldNews;
        var now;
        switch (isOldNews){
            // =>「新聞，」
            case true:
                now = TimeHelper.nowHourMs();
                isOldNews = false
                break;
            // =>「舊聞。」
            case false:
                now = TimeHelper.todayMs() - TIME.ONE_DAY;
                isOldNews = true
                break;
        }
        now = TimeHelper.dateFormatter(now);

        $state.go('news', {
            year : now.year,
            month: now.month,
            day  : now.day,
            h    : isOldNews ? null : now.hour,
            q    : null
        });
    }
    function handleCountryClick(newCountry) {
        switch (newCountry === vm.state.countryList[0]) {
            // Select Country
            case true:
                toggleCountryList(newCountry)
                break;
            // Change Country
            case false:
                $state.go('news', { country: newCountry })
                hideCountryList(newCountry)
                break;
        }


        function toggleCountryList(newCountry) {
            var activeCounty = vm.state.countryList[0];
            var cache = [activeCounty];

            switch (vm.state.countryList.length === 1) {
                // Show Country List
                case true:
                    COUNTRIES.forEach(function(country) {
                        activeCounty !== country && cache.push(country);
                    })
                    vm.state.countryList = cache;
                    break;
                // Hide Country List
                case false:
                    hideCountryList(newCountry)
                    break;
            }
        }
        function hideCountryList(newCountry) {
            // Insert newCountry to No.1
            var preList = angular.copy(vm.state.countryList);
            var index = preList.indexOf(newCountry);
            preList.splice(index, 1)
            preList.unshift(newCountry)
            vm.state.countryList = preList;

            // Hide Coutry List
            $timeout(function (){
                if (newCountry === preList[0]){
                    vm.state.countryList = [newCountry]
                }
            })
        }
    }
    function getInitCountry() {
        return [store.get('sy-country') || 'HK'];
    }
}