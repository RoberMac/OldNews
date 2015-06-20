angular.module('ShinyaNews.i18nDirective', [])
.directive('syNewsI18n', function (){
    return {
        restrict: 'E',
        replace : true,
        template: '<div class="corner--top--left animate--faster">'
                +   '<div ng-repeat="country in countryList" class="toolBar__button--country animate--faster" ng-class="country" ng-click="changeLanguage(country)">'
                +       '{{country}}'
                +   '</div>'
                + '</div>',
        controller: ['$scope', '$timeout', 'store', function ($scope, $timeout, store){

            var country_list = ['HK', 'CN', 'JP', 'TW', 'US', 'BR', 'IN', 'KR', 'RU', 'DE', 'FR']

            $scope.countryList = [$scope.selectCountry]
            $scope.changeLanguage = function (country){
                var country_len = $scope.countryList.length,
                    index = country_list.indexOf(country);
                if (country === $scope.countryList[0]){
                    // 顯示／隱藏「國家列表」
                    country_list.length === country_len
                    ? hideCountryList(country)
                    : showCountryList()
                } else {
                    // 更改國家
                    store.set('syNewsCountry', country)
                    $scope.selectCountry = country
                    hideCountryList(country)
                }
            }
            function showCountryList(){
                for (var i = 0; i < country_list.length; i++){

                    var cache = $scope.countryList,
                        len   = cache.length - 1;

                    cache[0] !== country_list[i]
                    ? cache.push(country_list[i])
                    : null

                    $scope.countryList = cache
                }
            }
            function hideCountryList(country){
                var cache = $scope.countryList,
                    len   = cache.length - 1,
                    index = cache.indexOf(country);

                cache.splice(index, 1)
                cache.unshift(country)
                $scope.countryList = cache

                $timeout(function (){
                    if (country === cache[0]){
                        $scope.countryList = [country]
                    }
                })
            }
        }]
    }
})