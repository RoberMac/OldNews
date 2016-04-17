angular
.module('OldNews.components.Nav', [])
.constant('COUNTRIES', ['BR', 'CN', 'DE', 'FR', 'HK', 'IN', 'JP', 'KR', 'RU', 'TW', 'US'])
.directive('nNav', nNav);


function nNav() {
    return {
        restrict    : 'E',
        replace     : true,
        controller  : NavCtrl,
        controllerAs: 'navVM',
        templateUrl : 'components/Nav/Nav.html'
    };
}
function NavCtrl(
    $scope, $window, $timeout,
    $state, $stateParams, store,
    COUNTRIES, TIME, TimeHelper
) {
    var vm = this;
    this.state = {
        isShowCaretLeft : true,
        isShowCaretRight: true,
        countryList     : getCountryList()
    };
    vm.selectNews = selectNews;
    vm.togglehNewsType = togglehNewsType;
    vm.handleCountryClick = handleCountryClick;

    // Events
    $scope.$on('keyDown:esc', handleKeyDownEsc);
    $scope.$on('keyDown:leftOrRightArrow', handleKeyDownLeftOrRightArrow);
    $scope.$on('swipe:leftOrRight', handleSwipeLeftOrRight);
    $scope.$on('fetchNews:start', handleStartFetchNews);


    function selectNews(step) {
        var isOldNews = $scope.rootVM.state.isOldNews;
        var newsDate = TimeHelper.newsDateMs(isOldNews);
        var nextDate;
        var nextHour;

        // 屏蔽（移動端／鍵盤操作）無效的獲取新聞（滑動）
        if (
            step === 1 && !vm.state.isShowCaretRight ||
            step === -1 && !vm.state.isShowCaretLeft
        ) return;

        if (isOldNews) {
            nextDate = TimeHelper.dateFormatter(newsDate + TIME.ONE_DAY * step);
            $state.go('news', {
                year : nextDate.year,
                month: nextDate.month,
                day  : nextDate.day,
                h    : null,
                q    : null
            });
        } else {
            nextHour = parseInt($stateParams.h || new Date().getHours(), 10) + step;
            $state.go('news', {
                h: nextHour,
                q: null
            });
        }
    }
    function handleKeyDownEsc() {
        vm.state.countryList = getCountryList();
    }
    function handleKeyDownLeftOrRightArrow(event, payload) {
        vm.selectNews(payload.step);
    }
    function handleSwipeLeftOrRight(event, payload) {
        vm.selectNews(payload.step);
    }
    function handleStartFetchNews() {
        var isOldNews = $scope.rootVM.state.isOldNews;
        var newsDate = TimeHelper.newsDateMs(isOldNews);

        // check caret
        if (isOldNews) {
            // Always Show Left
            vm.state.isShowCaretLeft = true;
            // Before Today
            vm.state.isShowCaretRight = newsDate + TIME.TWO_DAYS <= Date.now();
        } else {
            // After 0:00
            vm.state.isShowCaretLeft = newsDate - TIME.ONE_HOUR !== TimeHelper.todayMs();
            // Before Now Hour
            vm.state.isShowCaretRight = newsDate + TIME.ONE_HOUR <= Date.now();
        }

        // update country
        if (vm.state.countryList[0] !== $stateParams.country) {
            vm.state.countryList = getCountryList();
        }
    }
    function togglehNewsType() {
        var isOldNews = $scope.rootVM.state.isOldNews;
        var now;

        if (isOldNews) {
            // =>「新聞，」
            now = TimeHelper.nowHourMs();
            isOldNews = false;
        } else {
            // =>「舊聞。」
            now = TimeHelper.todayMs() - TIME.ONE_DAY;
            isOldNews = true;
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
        if (newCountry === vm.state.countryList[0]) {
            // Select Country
            toggleCountryList(newCountry);
        } else {
            // Change Country
            $state.go('news', { country: newCountry });
            hideCountryList(newCountry);
        }


        function toggleCountryList(newCountry) {
            var activeCounty = vm.state.countryList[0];
            var cache = [activeCounty];

            if (vm.state.countryList.length === 1) {
                // Show Country List
                COUNTRIES.forEach(function (country) {
                    activeCounty !== country && cache.push(country);
                });
                vm.state.countryList = cache;
            } else {
                // Hide Country List
                hideCountryList(newCountry);
            }
        }
        function hideCountryList(newCountry) {
            // Insert newCountry to No.1
            var preList = angular.copy(vm.state.countryList);
            var index = preList.indexOf(newCountry);
            preList.splice(index, 1);
            preList.unshift(newCountry);
            vm.state.countryList = preList;

            // Hide Coutry List
            $timeout(function () {
                if (newCountry === preList[0]) {
                    vm.state.countryList = [newCountry];
                }
            });
        }
    }
    function getCountryList() {
        return [$stateParams.country || store.get('n-country') || 'HK'];
    }
}
