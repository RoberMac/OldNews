angular.module('ShinyaNews.timeHelperServices', [])
.service('syNewsTimeHelper', function(){

    this.getHoursMs = function(hour){
        var date = new Date(),
            offset = date.getTimezoneOffset() / 60;
        return  Date.UTC(
                    date.getUTCFullYear(),
                    date.getUTCMonth(),
                    date.getUTCDate(),
                    hour + offset
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
    }
})