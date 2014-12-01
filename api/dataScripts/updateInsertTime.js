db.CardPulls.find().forEach(function(doc) {
  doc.insertTime = doc._id.getTimestamp();
  db.CardPulls.save(doc);
});


