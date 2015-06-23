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
    }
})