const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const dns = require('dns');

dns.setServers(['8.8.8.8', '1.1.1.1']);

bcrypt.hash('MaxGlow@2026', 10).then(hash => {
  mongoose.connect('mongodb://webmaxglow_db_user:DzXarXqaxuxq7XFZ@ac-qztfboj-shard-00-00.47l0nsp.mongodb.net:27017,ac-qztfboj-shard-00-01.47l0nsp.mongodb.net:27017,ac-qztfboj-shard-00-02.47l0nsp.mongodb.net:27017/maxglow?ssl=true&replicaSet=atlas-dyrfug-shard-0&authSource=admin&retryWrites=true&w=majority')
    .then(() => {
      mongoose.connection.db.collection('users').updateOne(
        { email: 'maxglow2026@admin.com' },
        { $set: { password: hash } }
      ).then(res => {
        console.log('Password reset successfully:', res);
        process.exit(0);
      }).catch(err => {
        console.error(err);
        process.exit(1);
      });
    }).catch(err => {
      console.error(err);
      process.exit(1);
    });
});
