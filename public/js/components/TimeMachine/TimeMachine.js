angular
.module('OldNews.components.TimeMachine', [])
.directive('nTimeMachine', nTimeMachine);


function nTimeMachine() {
    return {
        restrict    : 'E',
        replace     : true,
        controller  : TimeMachineCtrl,
        controllerAs: 'tmVM',
        templateUrl : 'components/TimeMachine/TimeMachine.html'
    };
}
function TimeMachineCtrl($scope, $state, $stateParams, TimeHelper) {
    var vm = this;
    vm.state = {
        isShowTimeMachine: false,
        timeMachine      : {
            Y: 0,
            M: 0,
            D: 0,
            H: 0
        }
    };
    vm.toggleTimeMachine = toggleTimeMachine;
    vm.handleSubmit = handleSubmit;
    vm.dateValidation = dateValidation;

    $scope.$on('keyDown:esc', handleKeyDownEsc);
    $scope.$on('toggleTimeMachine', toggleTimeMachine);

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
        vm.state.isShowTimeMachine = !vm.state.isShowTimeMachine;
    }
    function handleKeyDownEsc() {
        vm.state.isShowTimeMachine && vm.toggleTimeMachine();
    }
    function handleSubmit() {
        if ($scope.rootVM.state.isOldNews) {
            // Only Change `Year`, `Month` and `Day`
            $state.go('news', {
                year : '20' + vm.state.timeMachine.Y,
                month: vm.state.timeMachine.M,
                day  : vm.state.timeMachine.D,
                h    : null,
                q    : null
            });
        } else {
            // Only Change `Hour`
            $state.go('news', { h: vm.state.timeMachine.H, q: null });
        }
        // Hide Time Machine
        vm.state.isShowTimeMachine = false;
    }
    function dateValidation() {
        var maxDate = Date.now();
        var expectDate;

        if ($scope.rootVM.state.isOldNews) {
            expectDate = (
                +new Date(
                    '20' + vm.state.timeMachine.Y,
                    vm.state.timeMachine.M - 1,
                    vm.state.timeMachine.D
                )
            );
        } else {
            expectDate = (
                +new Date(
                    new Date().getFullYear(),
                    new Date().getMonth(),
                    new Date().getDate(),
                    vm.state.timeMachine.H
                )
            );
        }

        vm.form && vm.form.$setValidity('maxDate', expectDate <= maxDate);
    }
}
