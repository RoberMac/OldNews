angular
.module('ShinyaNews.components.TimeMachine', [])
.directive('syTimeMachine', syTimeMachine);


function syTimeMachine() {
    return {
        restrict: 'E',
        replace: true,
        controller: TimeMachineCtrl,
        controllerAs: 'tmVM',
        templateUrl: 'components/TimeMachine/TimeMachine.html'
    }
}
function TimeMachineCtrl($scope, $state, $stateParams, TimeHelper) {
    var vm = this;
    vm.state = {
        isShowTimeMachine: false,
        timeMachine: {
            Y: 0,
            M: 0,
            D: 0,
            H: 0
        }
    };
    vm.toggleTimeMachine = toggleTimeMachine;
    vm.handleSubmit = handleSubmit;

    $scope.$on('keyDown:esc', handleKeyDownEsc)
    $scope.$on('toggleTimeMachine', toggleTimeMachine)
    $scope.$watchCollection('tmVM.state.timeMachine', formValidation)


    function toggleTimeMachine() {
        // Init Time Machine Date info
        var newsDate = TimeHelper.newsDateMs($scope.rootVM.state.isOldNews);
        var now = TimeHelper.dateFormatter(newsDate);
        vm.state.timeMachine = {
            Y: now.year % 2000,
            M: now.month,
            D: now.day,
            H: now.hour
        };
        // Show / Hide Time Machine
        vm.state.isShowTimeMachine = !vm.state.isShowTimeMachine
    }
    function handleKeyDownEsc() {
        vm.state.isShowTimeMachine && vm.toggleTimeMachine()
    }
    function handleSubmit() {
        switch ($scope.rootVM.state.isOldNews) {
            // Only Change `Year`, `Month` and `Day`
            case true:
                $state.go('news', {
                    year : '20' + vm.state.timeMachine.Y,
                    month: vm.state.timeMachine.M,
                    day  : vm.state.timeMachine.D,
                    h    : null,
                    q    : null
                })
                break;
            // Only Change `Hour`
            case false:
                var h = vm.state.timeMachine.H;

                $state.go('news', { h: h, q: null })
                break;
        }
        // Hide Time Machine
        vm.state.isShowTimeMachine = false
    }
    function formValidation(newVal, oldVal) {
        var maxDate = Date.now()
        var expectDate;

        switch ($scope.rootVM.state.isOldNews) {
            case true:
                expectDate = (
                    Date.parse(new Date(
                        '20' + vm.state.timeMachine.Y,
                        vm.state.timeMachine.M - 1,
                        vm.state.timeMachine.D
                    ))
                );
                break;
            case false:
                expectDate = (
                    Date.parse(new Date(
                        new Date().getFullYear(),
                        new Date().getMonth(),
                        new Date().getDate(),
                        vm.state.timeMachine.H
                    ))
                );
                break;
        }

        vm.form && vm.form.$setValidity('maxDate', expectDate <= maxDate)
    }
}