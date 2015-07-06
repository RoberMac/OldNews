angular.module('ShinyaNews.timeHelperServices', [])
.service('syNewsTimeHelper', function(){

    this.getHoursMs = function(hour){
        var date = new Date()
        return  Date.parse(
                    new Date(
                            date.getFullYear(),
                            date.getMonth(),
                            date.getDate(),
                            hour
                        )
                )
    },
    this.getDayMs = function(date){
        var date = new Date(date)
        return  Date.parse(
                    new Date(
                            date.getFullYear(),
                            date.getMonth(),
                            date.getDate()
                        )
                )
    },
    this.getDateObj = function (dateMs){
        var date = new Date(dateMs)
        return {
            year : date.getFullYear(),
            month: date.getMonth() + 1,
            day  : date.getDate()
        }
    },
    this.isToday = function (year, month, day){
        var now       = new Date(),
            now_year  = now.getFullYear(),
            now_month = now.getMonth() + 1,
            now_day   = now.getDate();

        return year == now_year && month == now_month && day == now_day
    },
    this.toDayMs = function (year, month, day){
        return Date.parse(
                new Date(year, month - 1, day)
            )
    }
    this.toHourMs = function (year, month, day, hour){
        return Date.parse(
                new Date(year, month - 1, day, hour)
            )
    }
})

