const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

mongoose.connect('mongodb://webmaxglow_db_user:DzXarXqaxuxq7XFZ@ac-qztfboj-shard-00-00.47l0nsp.mongodb.net:27017,ac-qztfboj-shard-00-01.47l0nsp.mongodb.net:27017,ac-qztfboj-shard-00-02.47l0nsp.mongodb.net:27017/maxglow?ssl=true&replicaSet=atlas-dyrfug-shard-0&authSource=admin&retryWrites=true&w=majority')
  .then(async () => {
    const reviews = await mongoose.connection.db.collection('reviews').find({}).toArray();
    const ratingMap = {};
    const countMap = {};
    for (let r of reviews) {
      const pid = r.product.toString();
      if (!ratingMap[pid]) {
        ratingMap[pid] = 0;
        countMap[pid] = 0;
      }
      ratingMap[pid] += r.rating;
      countMap[pid] += 1;
    }
    for (const pid in ratingMap) {
      const avg = ratingMap[pid] / countMap[pid];
      await mongoose.connection.db.collection('products').updateOne(
        { _id: new mongoose.Types.ObjectId(pid) },
        { $set: { rating: avg, numReviews: countMap[pid] } }
      );
    }
    console.log('Updated all ratings');
    process.exit(0);
  }).catch(e => {
    console.log(e);
    process.exit(1);
  });
