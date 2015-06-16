var mongoose = require('mongoose'),
    Schema   = mongoose.Schema

var newsSchema = new Schema({
        date: Number,
        'BR': Schema.Types.Mixed,
        'CN': Schema.Types.Mixed,
        'DE': Schema.Types.Mixed,
        'FR': Schema.Types.Mixed,
        'HK': Schema.Types.Mixed,
        'IN': Schema.Types.Mixed,
        'JP': Schema.Types.Mixed,
        'KR': Schema.Types.Mixed,
        'RU': Schema.Types.Mixed,
        'TW': Schema.Types.Mixed,
        'US': Schema.Types.Mixed
    });

module.exports = {
    News: mongoose.model('News', newsSchema)
}
