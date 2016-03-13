angular
.module('ShinyaNews.utils.services')
.constant('TIME', {
    ONE_HOUR: 1000 * 60 * 60,
    ONE_DAY: 1000 * 60 * 60 * 24,
    TWO_DAYS: 1000 * 60 * 60 * 48,
})
.factory('TimeHelper', TimeHelper);


function TimeHelper($stateParams){
    return {
        nowHourMs: nowHourMs,
        todayMs: todayMs,
        newsDateMs: newsDateMs,
        isToday: isToday,
        dateFormatter: dateFormatter
    };


    function nowHourMs() {
        var date = new Date();
        return Date.parse(
            new Date(
                date.getFullYear(),
                date.getMonth(),
                date.getDate(),
                date.getHours()
            )
        );
    }
    function todayMs() {
        var date = new Date();
        return  Date.parse(
            new Date(
                date.getFullYear(),
                date.getMonth(),
                date.getDate()
            )
        );
    }
    function newsDateMs(isOldNews){
        var year    = $stateParams.year;
        var month   = $stateParams.month;
        var day     = $stateParams.day;
        var hour    = $stateParams.h;

        return Date.parse(new Date(year, month - 1, day, isOldNews ? null : hour));
    }
    function isToday() {
        var year    = $stateParams.year;
        var month   = $stateParams.month;
        var day     = $stateParams.day;
        var hour    = $stateParams.h;

        var now = dateFormatter(Date.now());

        return year == now.year && month == now.month && day == now.day;
    }
    function dateFormatter(dateMs) {
        var date = new Date(dateMs);
        return {
            year : date.getFullYear(),
            month: date.getMonth() + 1,
            day  : date.getDate(),
            hour : date.getHours()
        };
    }
}