angular
.module('ShinyaNews.utils.controllers')
.controller('rootCtrl', rootCtrl);


function rootCtrl(){
    var vm = this;
    vm.state = {
        isOldNews: false
    };
    vm.updateState = updateState;

    function updateState(newState) {
        angular.merge(vm.state, newState)
    }
}