angular
.module('OldNews.utils.services')
.constant('STORE_PREFIX', 'n-news-')
.factory('NewsStore', NewsStore)
.factory('OldNewsStore', OldNewsStore)
.factory('FetchNews', FetchNews)
.run(function (store, STORE_PREFIX, NewsStore) {
    // Clear Expired News
    store.get(STORE_PREFIX + 'expiration-date') < Date.now() && NewsStore.removeAll();
});


function NewsStore($window, store, STORE_PREFIX, TimeHelper, TIME) {
    return {
        get      : get,
        set      : set,
        removeAll: removeAll
    };


    // Get News
    function get(newsID) {
        return store.get(STORE_PREFIX + newsID);
    }
    // Store News and Expiration Date
    function set(newsID, news) {
        store.set(STORE_PREFIX + newsID, news);
        store.set(STORE_PREFIX + 'expiration-date', TimeHelper.todayMs() + TIME.ONE_DAY);
    }
    // Remove all News
    function removeAll() {
        var ls = $window.localStorage;
        var reg = new RegExp('^' + STORE_PREFIX);
        var i;
        var j;
        var len;

        for (i = 0, j = 0, len = localStorage.length; i < len; i++) {
            reg.test(ls.key(j))
                ? store.remove(ls.key(j))
            : j++;
        }
    }
}
function OldNewsStore($cacheFactory) {
    return $cacheFactory('OldNewsStore');
}
function FetchNews($q, $http, NewsStore, OldNewsStore) {
    return function (date, country, isOldNews) {
        var newsId = date + country;
        var localNewsData = isOldNews ? OldNewsStore.get(newsId) : NewsStore.get(newsId);

        return $q(function (resolve, reject) {
            if (!date || !country) {
                reject('invalid params');
                return;
            }

            if (localNewsData) {
                // Fetch From Local
                resolve(localNewsData);
            } else {
                // Fetch From Remote
                $http
                .get('/news/' + country + '/' + date + '/' + (isOldNews ? 24 : 1))
                .success(function (data) {
                    if (data.msg) {
                        if (isOldNews) {
                            OldNewsStore.put(newsId, data.msg);
                        } else {
                            NewsStore.set(newsId, data.msg);
                        }
                    }

                    resolve(data.msg);
                })
                .error(function () {
                    reject();
                });
            }
        });
    };
}
