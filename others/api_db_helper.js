// Q
var q_newsFindOne          = Q.nbind(News.findOne, News);


var api_db_helper = {

    // 獲取選定時段新聞
    getSelectedDateNews: function (user, body, res, next){

        var country    = body.selectCountry,
            userDate   = body.isTodayNews ? new Date() : userInfo.register_info.date,
            selectDate = body.selectDate + body.timezoneOffset,
            selectDate = Date.UTC(
                userDate.getUTCFullYear(),
                userDate.getUTCMonth(),
                userDate.getUTCDate(),
                selectDate
            );
        /**
         *
         * 新聞來源指向：
         * 新加坡、馬來西亞 -> 台灣
         * 澳門 -> 香港
         * 其他(加拿大、英國、...) -> 美國
         *
        **/
        var country_list = ['BR', 'CN', 'DE', 'FR', 'HK', 'IN', 'JP', 'KR', 'RU', 'TW', 'US']
        if (country === 'MO'){
            country = 'HK'
        } else if (country === 'SG' || country === 'MY'){
            country = 'TW'
        } else if (country_list.indexOf(country) < 0){
            country = 'US'
        }
        q_newsFindOne({date: selectDate}, country)
        .then(function (found){
            if (!found){
                log.warning('[DB: Not Found]', selectDate, country)
                res.status(400).json({'status': 'error', 'msg': 'chat.NEWS_NOT_EXIST'})
                return;
            }
            res.send({'status': 'ok', 'msg': found[country]})
        }, function (err){
            log.error('[DB: Query Error]', err)
            next({'code': 500, 'status': 'error', 'msg': 'error.SERVER_ERROR'})
            throw new Error('Query Error')
        })
    }
}

module.exports = api_db_helper