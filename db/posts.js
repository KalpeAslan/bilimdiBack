const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://aslan2001:aslan2001@cluster0.ls6lz.mongodb.net/oqyPosts?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


class Posts{
    getPosts(from)
}