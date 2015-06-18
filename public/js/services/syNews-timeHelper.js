angular.module('ShinyaNews.timeHelperServices', [])
.service('syNewsTimeHelper', function(){

    this.getUTCDayMs = function(date){
        var date = new Date(date)
        return  Date.UTC(
                    date.getUTCFullYear(),
                    date.getUTCMonth(),
                    date.getUTCDate()
                )
    },
    this.getLocalDayMs = function(date){
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