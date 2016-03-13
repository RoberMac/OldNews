angular
.module('ShinyaNews.components.NewsBox', [])
.controller('NewsBoxCtrl', NewsBoxCtrl)


function NewsBoxCtrl(
    $rootScope, $scope, $window, $location,
    $state, $stateParams, store,
    TimeHelper, FetchNews
){

    var vm = this;
    vm.state = {
        isFetching: true,
        isFetchFail: false,
        news: {
            data: [],
            country: '',
            date: 0
        },
        searchText: $stateParams.q
    };
    vm.updateState = updateState;
    vm.updateQueryParam = updateQueryParam;
    vm.handleSwipe = handleSwipe;

    initState()
    // Events
    angular.element($window).on('keydown', function(e) {
        switch (e.keyCode) {
            case 27: // Esc
                vm.updateQueryParam('')
                break;
        }
    })
    $scope.$watch('newsVM.state.searchText', function(newVal, oldVal) {
        if (newVal !== oldVal){
            vm.updateQueryParam(newVal)
        }
    })


    function updateState(newState) {
        angular.merge(vm.state, newState)
    }
    function updateQueryParam(title) {
        vm.updateState({ searchText: title })
        $state.go('news', {
            q: title
        }, { notify: false, reload: true })
    }
    function handleSwipe(step){
        $rootScope.$broadcast('selectNews', { step: step })
    }
    function initState() {
        var country = $stateParams.country;
        var isOldNews = !TimeHelper.isToday();
        var date = TimeHelper.newsDateMs(isOldNews);

        // Reset State
        store.set('syNewsCountry', country)
        vm.updateState({
            isFetching: true,
            isFetchFail: false,
            news: {
                data: [],
                country: country,
                date: date
            }
        })
        $scope.rootVM.updateState({
            isOldNews: isOldNews
        })

        // Start Fetch News
        FetchNews(date, country, isOldNews)
        .then(function(newsData) {
            vm.updateState({
                isFetching: false,
                isFetchFail: false,
                news: { data: newsData }
            })
        })
        .catch(function() {
            vm.updateState({
                isFetching: false,
                isFetchFail: true
            })
        })

        // Check Caret
        $rootScope.$broadcast('checkCaret')
    }
}