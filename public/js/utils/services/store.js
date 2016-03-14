angular
.module('ShinyaNews.utils.services')
.factory('store', store);


/**
 * @name store
 * @desc LocalStorage that support Object and Array
 *
 */
function store($window) {
    return {
        get: get,
        set: set,
        remove: remove
    };


    function get(key) {
        return _parseJSON($window.localStorage.getItem(key))
    }
    function set(key, value) {
        return $window.localStorage.setItem(key, JSON.stringify(value))
    }
    function remove(key) {
        $window.localStorage.removeItem(key)
    }
    function _parseJSON(data) {
        try {
            data = JSON.parse(data)
        } catch (e) {
        } finally {
            return data
        }
    }
}
