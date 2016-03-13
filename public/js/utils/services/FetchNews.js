angular
.module('ShinyaNews.utils.services')
.factory('NewsStore', NewsStore)
.factory('OldNewsStore', OldNewsStore)
.factory('FetchNews', FetchNews)
.run(function (store, NewsStore){
    // 刪除緩存於本地的過期信息
    store.get('oneDayNewsExpires') < Date.now() && NewsStore.removeAll()
});


function NewsStore($window, store, TimeHelper, TIME){
    var newsStore = store.getNamespacedStore('one-day-news', '-');

    return {
        get: get,
        set: set,
        removeAll: removeAll,
    };


    function get(newsID) {
        return newsStore.get(newsID)
    }
    // 存储新闻与本地並設置過期時間
    function set(newsID, news) {
        newsStore.set(newsID, news)
        store.set('oneDayNewsExpires', TimeHelper.todayMs() + TIME.ONE_DAY)
    }
    // 清除過期的新聞
    function removeAll() {
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
}
function OldNewsStore($cacheFactory) {
    return $cacheFactory('OldNewsStore')
}
function FetchNews($q, $http, NewsStore, OldNewsStore){
    return function(date, country, isOldNews) {
        var newsId = date + country;
        var localNewsData = isOldNews ? OldNewsStore.get(newsId) : NewsStore.get(newsId);

        return $q(function (resolve, reject){
            if (!date || !country) {
                reject('invalid params')
                return;
            };
            // Fetch From Local
            if (localNewsData) {
                resolve(localNewsData)
            }
            // Fetch From Remote
            else {
                $http
                .post('/api/getSelectedDateNews', {
                    selectDate: date,
                    selectCountry: country,
                    isAllDay: isOldNews
                })
                .success(function (data, status, headers, config){
                    switch (isOldNews) {
                        case true:
                            OldNewsStore.put(newsId, data.msg)
                            break;
                        case false:
                            NewsStore.set(newsId, data.msg)
                            break;
                    }

                    resolve(data.msg)
                })
                .error(function (data, status, headers, config){
                    reject()
                })
            }
        });
    }
}