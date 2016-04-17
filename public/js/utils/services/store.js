/* eslint no-param-reassign: 0 */
angular
.module('OldNews.utils.services')
.factory('store', store);


/**
 * @name store
 * @desc LocalStorage that support Object and Array
 *
 */
function store($window) {
    return {
        get   : get,
        set   : set,
        remove: remove
    };


    function get(key) {
        return _parseJSON($window.localStorage.getItem(key));
    }
    function set(key, value) {
        return $window.localStorage.setItem(key, angular.toJson(value));
    }
    function remove(key) {
        $window.localStorage.removeItem(key);
    }
    function _parseJSON(data) {
        try {
            data = angular.fromJson(data);
        } catch (e) {
            // Empty
        } finally {
            return data;
        }
    }
}
