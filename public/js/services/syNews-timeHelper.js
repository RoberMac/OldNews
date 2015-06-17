angular.module('ShinyaNews.timeHelperServices', [])
.service('syNewsTimeHelper', function(){

    this.getUTCDayMs = function(date){
        return  Date.UTC(
                    date.getUTCFullYear(),
                    date.getUTCMonth(),
                    date.getUTCDate()
                )
    },
    this.getLocalDayMs = function(date){
        return  Date.parse(
                    new Date(
                            date.getFullYear(),
                            date.getMonth(),
                            date.getDate()
                        )
                )
    }
})