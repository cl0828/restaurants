const MongoClient = require('mongodb').MongoClient;

const url = process.env.MONGODB_URL;

var db = {

  client: null,

  connect() {
    return new MongoClient(url).connect();
  },

  close() {
    !!this.client && this.client.close();
  },

  getDb() {
    return this.connect()
      .then(client => {
        console.log("Connected successfully to server");
        this.client = client;
        return client.db();
      });
  },

  find(collection, criteria) {
    return this.getDb()
      .then(db => {
        const cursor = db.collection(collection).find(criteria);
        const docs = cursor.toArray();
        this.close();
        return docs;
      });
  },

  insert(collection, criteria) {
    return this.getDb()
      .then(db => {
        const result = db.collection(collection).insertOne(criteria)
        this.close()
        return result;
      });
  },

  update(collection, criteria, update) {
    return this.getDb()
      .then(db => {
        const result = db.collection(collection).updateOne(criteria, update)
        this.close();
        return result;
      });
  },

  delete(collection, criteria) {
    return this.getDb()
      .then(db => {
        const result = db.collection(collection).deleteOne(criteria);
        this.close();
        return result;
      });
  }
};

module.exports = db;
