angular
.module('ShinyaNews.utils.services')
.constant('STORE_PREFIX', 'sy-news-')
.factory('NewsStore', NewsStore)
.factory('OldNewsStore', OldNewsStore)
.factory('FetchNews', FetchNews)
.run(function (store, STORE_PREFIX, NewsStore){
    // Clear Expired News
    store.get(STORE_PREFIX + 'expiration-date') < Date.now() && NewsStore.removeAll()
});


function NewsStore($window, store, STORE_PREFIX, TimeHelper, TIME){
    return {
        get: get,
        set: set,
        removeAll: removeAll,
    };


    // Get News
    function get(newsID) {
        return store.get(STORE_PREFIX + newsID)
    }
    // Store News and Expiration Date
    function set(newsID, news) {
        store.set(STORE_PREFIX + newsID, news)
        store.set(STORE_PREFIX + 'expiration-date', TimeHelper.todayMs() + TIME.ONE_DAY)
    }
    // Remove all News
    function removeAll() {
        var ls = $window.localStorage;
        var reg = new RegExp('^' + STORE_PREFIX);

        for (var i = 0, j = 0, len = localStorage.length; i < len; i++){
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