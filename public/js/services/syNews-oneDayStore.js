angular.module('ShinyaNews.oneDayStoreServices', [])
.service('syOneDayStore', ['$window', 'store', 'syNewsTimeHelper', 
    function($window, store, syNewsTimeHelper){
    
    var oneDayStore = store.getNamespacedStore('one-day-news', '-')

    this.get = function (newsID){
        return oneDayStore.get(newsID)
    },
    // 存储新闻与本地並設置過期時間
    this.set = function (newsID, news){
        oneDayStore.set(newsID, news)
        var tomorrow = Date.now() + 86400000
        store.set('oneDayNewsExpires', syNewsTimeHelper.getDayMs(tomorrow))
    },
    // 清除過期的新聞
    this.removeAll = function (){
        var ls = $window.localStorage,
            len = localStorage.length,
            reg = /^one-day-news-/,
            j = 0;
        for (var i = 0; i < len; i++){
            reg.test(ls.key(j))
                ? store.remove(ls.key(j))
                : j ++
        }
    }
}])