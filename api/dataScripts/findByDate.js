db.CardPulls.find({
 insertTime : {
    '$gte': new Date(2014, 10, 20),
    '$lte': new Date(2014, 11, 22)
}})