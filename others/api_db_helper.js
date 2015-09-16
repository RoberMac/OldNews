// Q
var q_newsFindOne   = Q.nbind(News.findOne, News),
    q_newsFind      = Q.nbind(News.find, News),
    q_newsAggregate = Q.nbind(News.aggregate, News);


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

var api_db_helper = {

    // 獲取選定時段新聞
    getSelectedDateNews: function (body, res, next){
        var country    = countrySanitization(body.selectCountry),
            selectDate = body.selectDate;

        if (body.isAllDay){
            q_newsAggregate(
                {$match: {
                    date: {
                        '$gt': selectDate,
                        '$lte': selectDate + 86400000
                        }
                    }
                }, // 全日新聞
                {$project: {selectCountry: '$' + country}}, // 篩選「選定國家」
                {$unwind: '$selectCountry'}, // 展開選定國家的所有「新聞集合」
                {$group: {
                        _id: '$selectCountry.source_name',
                        newsSet: {$addToSet: '$selectCountry.news'}
                    }
                }, // 按「新聞來源」重排
                {$unwind: '$newsSet'}, // 展開至「新聞來源集合」
                {$unwind: '$newsSet'}, // 展開至「新聞項」
                {$group: {
                        _id: '$_id',
                        newsSet: {$addToSet:'$newsSet'}
                    }
                }, // 按「新聞來源」集合全部「新聞項」
                {$project: {
                        source_name: '$_id',
                        news: '$newsSet',
                        _id: 0
                    }
                } // 重構後輸出
            )
            .then(function (found){
                if (found.length === 0){
                    res.status(400).json({'status': 'error', 'msg': 'chat.NEWS_NOT_EXIST'})
                    return;
                }
                res.send({'status': 'ok', 'msg': found})
            }, function (err){
                next({'code': 500, 'status': 'error', 'msg': 'error.SERVER_ERROR'})
                throw new Error('Query Error')
            })
        } else {
            q_newsFindOne({date: selectDate})
            .then(function (found){
                if (!found){
                    res.status(400).json({'status': 'error', 'msg': 'chat.NEWS_NOT_EXIST'})
                    return;
                }
                res.send({'status': 'ok', 'msg': found[country]})
            }, function (err){
                next({'code': 500, 'status': 'error', 'msg': 'error.SERVER_ERROR'})
                throw new Error('Query Error')
            })
        }
    }
}

module.exports = api_db_helper