const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://aslan2001:aslan2001@cluster0.ls6lz.mongodb.net/oqyPosts?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const blogCards = async (from)=>{
    try{
        await client.connect();
        console.log(from)
        const posts = client.db().collection('oqyPosts');
        const postsAll = await posts.find().toArray();
        return postsAll;
    } catch(e){
        console.log(e)
    }
}
module.exports = blogCards;