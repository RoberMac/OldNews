describe('The Homepage', function() {

    beforeEach(module('ShinyaNews'));

    var rootCtrl, $scope, oneDayStore;

    beforeEach(inject(function ($controller, $rootScope, _oneDayStore_){

        $scope = $rootScope.$new()
        rootCtrl  = $controller('rootController', {
            $scope: $scope
        })
        oneDayStore = _oneDayStore_

    }))

    it('should be stored and accessible', function() {
        oneDayStore.set('isStorable', true)
        expect(oneDayStore.get('isStorable')).toBe(true);
    });

    it('will switch to the Old News page', function() {
        $scope.toggleNews()
        expect($scope.isOldNews).toBe(true);
    });

    it('will show TimeMachine', function() {
        $scope.toggleTimeMachine()
        expect($scope.isShowTimeMachine).toBe(true);
    });
});