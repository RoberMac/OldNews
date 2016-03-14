angular
.module('ShinyaNews', [
    // Vendors
    'ngTouch',
    'ngAnimate',
    'ui.router',
    // App
    'ShinyaNews.utils.controllers',
    'ShinyaNews.utils.services',
    'ShinyaNews.utils.directives',
    'ShinyaNews.components.NewsBox',
    'ShinyaNews.components.TimeMachine',
    'ShinyaNews.components.Nav',
    'ShinyaNews.templates',
])
.config(config);


function config($locationProvider, $stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise(function() {
        var now     = new Date();
        var year    = now.getFullYear();
        var month   = now.getMonth() + 1;
        var day     = now.getDate();
        var h       = now.getHours();
        var country = JSON.parse(window.localStorage.getItem('sy-country')) || "HK";

        return country + '/' + year + '/' + month + '/' + day + '?h=' + h;
    });

    $locationProvider.html5Mode(true);

    $stateProvider
    .state('news', {
        url: [
            '/{country:BR|CN|DE|FR|HK|IN|JP|KR|RU|TW|US}', // Country
            '/{year:201[5-6]}', // Year
            '/{month:0?[1-9]|1[0-2]}', // Month
            '/{day:0?[0-9]|[12][0-9]|3[0-1]}', // Day
            '?h', // Hour
            '&q', // Search
        ].join(''),
        templateUrl: 'components/NewsBox/NewsBox.html',
        controller: 'NewsBoxCtrl',
        controllerAs: 'newsVM'
    })
}