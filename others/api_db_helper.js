// Q
var q_newsFindOne = Q.nbind(News.findOne, News),
    q_newsFind    = Q.nbind(News.find, News);

// Helper
function countrySanitization(country){
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
    return country
}
function dateSanitization(date, hour, timezoneOffset){
    var date = new Date(date),
        hour = hour + timezoneOffset,
        selectDate = Date.UTC(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate(),
            hour
        )
    return selectDate
}
function combineData(data, country){
    var cache = [],
        source_cache = {},
        len = data.length,
        data_item, news_item, news_item_source;

    for (var i = 0; i < len; i++){
        data_item = data[i][country] || []
        if (data_item.length > 0){
            for (var j = 0; j < data_item.length; j++){
                news_item = data_item[j]
                news_item_source = news_item['source_name']
                if (news_item_source in source_cache){
                    source_cache[news_item_source] = source_cache[news_item_source].concat(news_item['news'])
                } else {
                    source_cache[news_item_source] = news_item['news']
                }
            }
        }
    }
    for (var k in source_cache){
        cache.push({
            'source_name': k,
            'news': source_cache[k]
        })
    }
    return cache
}


var api_db_helper = {

    // 獲取選定時段新聞
    getSelectedDateNews: function (body, res, next){
        var country    = countrySanitization(body.selectCountry),
            selectDate = body.selectDate;

        if (body.isAllDay){
            q_newsFind({date: {'$gt': selectDate, '$lte': selectDate + 86400000}}, country)
            .then(function (found){
                if (found.length === 0){
                    log.warning('[DB: Not Found]', selectDate, country)
                    res.status(400).json({'status': 'error', 'msg': 'chat.NEWS_NOT_EXIST'})
                    return;
                }
                res.send({'status': 'ok', 'msg': combineData(found, country)})
            }, function (err){
                log.error('[DB: Query Error]', err)
                next({'code': 500, 'status': 'error', 'msg': 'error.SERVER_ERROR'})
                throw new Error('Query Error')
            })
        } else {
            q_newsFindOne({date: selectDate})
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
}

module.exports = api_db_helper