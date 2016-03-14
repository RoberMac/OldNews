angular
.module('ShinyaNews.utils.controllers')
.controller('rootCtrl', rootCtrl);


function rootCtrl($rootScope, $window){
    var vm = this;
    vm.state = {
        isOldNews: false
    };
    vm.updateState = updateState;

    // Events
    angular.element($window).on('keydown', handleKeyDown)


    function updateState(newState) {
        angular.merge(vm.state, newState)
    }
    function handleKeyDown(e) {
        var keyCode = e.keyCode;
        var target = e.target.tagName.toLowerCase();

        switch (keyCode) {
            case 27: // esc
                $rootScope.$broadcast('keyDown:esc')
                break;
            case 37: // ←
            case 39: // →
                if (target === 'input') return;
                $rootScope.$broadcast('keyDown:leftOrRightArrow', { step: keyCode === 37 ? -1 : 1 })
                break;
            case 38: // ↑
            case 40: // ↓
                $rootScope.$broadcast('keyDown:upOrDownArrow', { step: keyCode === 38 ? -1 : 1 })
                break;
        }
    }
}