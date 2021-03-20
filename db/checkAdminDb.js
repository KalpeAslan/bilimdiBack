const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://aslan2001:aslan2001@cluster0.ls6lz.mongodb.net/oqyPosts?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


const checkAdminDb = async (loggin, password) => {
    try {
        await client.connect();
        const admin = client.db().collection('admin');
        const isAdmin = await admin.findOne();
        return isAdmin.login === loggin && isAdmin.password === password ? true : false;
    } catch (e) {
        console.log(e);
    }
}

module.exports = checkAdminDb;