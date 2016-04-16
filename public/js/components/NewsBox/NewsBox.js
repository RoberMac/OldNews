/* eslint angular/document-service: 0 */
angular
.module('ShinyaNews.components.NewsBox', [])
.controller('NewsBoxCtrl', NewsBoxCtrl);


function NewsBoxCtrl(
    $rootScope, $scope, $location,
    $state, $stateParams,
    store, TimeHelper, FetchNews
) {
    var vm = this;
    vm.state = {
        isFetching       : true,
        isFetchFail      : false,
        newsData         : [],
        newsDate         : 0,
        selectedNewsIndex: -1,
        searchText       : $stateParams.q
    };
    vm.updateState = updateState;
    vm.updateQueryParam = updateQueryParam;
    vm.handleSwipe = handleSwipe;
    vm.handleHeadingClick = handleHeadingClick;

    // Events
    $scope.$on('keyDown:esc', handleKeyDownEsc);
    $scope.$on('keyDown:upOrDownArrow', handleKeyDownUpOrDownArrow);

    // Fetch News
    fetchNews();


    function updateState(newState) {
        angular.merge(vm.state, newState);
    }
    function updateQueryParam(title) {
        vm.updateState({ searchText: title });
        $state.go('news', {
            q: title
        }, { notify: false, reload: true });
    }
    function handleSwipe(step) {
        $rootScope.$broadcast('swipe:leftOrRight', { step: step });
    }
    function handleHeadingClick() {
        $rootScope.$broadcast('toggleTimeMachine');
    }
    function handleKeyDownEsc() {
        vm.updateQueryParam('');
        document.querySelector('.searchBar__input').blur();
    }
    function handleKeyDownUpOrDownArrow(event, payload) {
        // Foucs News Item
        var newsItemList = document.querySelectorAll('.newsItem__title');
        var len = newsItemList.length;
        var step;
        var index;

        if (len <= 0) return;

        step = payload.step;
        index = vm.state.selectedNewsIndex;

        if (step === -1 && index > 0 && index < len) {
            index--;
        } else if (step === 1 && index >= -1 && index < len - 1) {
            index++;
        }

        newsItemList[index].focus();
        vm.updateState({ selectedNewsIndex: index });
    }
    function fetchNews() {
        var country = $stateParams.country;
        var isOldNews = !TimeHelper.isToday();
        var date = TimeHelper.newsDateMs(isOldNews);

        // Store Country
        store.set('sy-country', country);

        // Update Date
        vm.updateState({
            newsDate: date
        });

        // Start Fetch News
        $rootScope.$broadcast('fetchNews:start');

        FetchNews(date, country, isOldNews)
        .then(function (newsData) {
            vm.updateState({
                isFetching : false,
                isFetchFail: false,
                newsData   : newsData
            });
        })
        .catch(function () {
            vm.updateState({
                isFetching : false,
                isFetchFail: true
            });
        })
        .finally(function () {
            $scope.rootVM.updateState({
                isOldNews: isOldNews
            });
        });
    }
}
