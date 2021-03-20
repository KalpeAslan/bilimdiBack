const express = require('express');
const PORT = 4000;
const cors = require('cors');
const app = express();
const jsonParser = express.json();
const profDB = require('./db/connect.js')
const fileupload = require('express-fileupload');
const path = require('path');
const dirname = path.resolve();

app.use(fileupload({}))

app.use(express.static(__dirname + '/ejs'));

app.use(cors());

app.set('view engine', 'ejs')

app.set('views', path.resolve(dirname, 'ejs'));

app.get('/', (req, res) => {

    res.render('index')
})

app.get('/admin', (req, res) => {
    res.render('admin');
})
app.get('/new-post', (req, res) => {
    res.render('newPost')
})






app.post('/branches/postBranches', jsonParser, (req, res) => {
    console.log('postBranches')
    console.log(req.body);
    const connect = async () => {
        const allBranches = await profDB.postBranches(req.body);
        res.send(allBranches);
    };
    connect();
});




app.post('/profs/postProfs', jsonParser, (req, res) => {
    console.log('postProfs');
    console.log(req.body)
    const connect = async () => {
        const allProfs = await profDB.postProfs(req.body);
        res.send(allProfs)
    }
    connect();
});






//get img from new-post
const multer = require('multer');
const fs = require('fs');
app.use(multer({
    dest: __dirname + '/uploads'
}).single("file"));


app.post("/upload", async (req, res) => {
    const filedata = req.files.filedata;
    const files = await fs.readdir('./uploads/','utf-8',(err,data)=>data);
    console.log('files')
    console.log(files)
});
//for getting images 

app.get('/img', (req, res) => {
    res.setHeader("Content-Type", "image/jpeg");
    const img = fs.readFileSync('./testImg.jpg');
    res.send(img)
})


//For telegram bot

const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({
    extended: true
}));

const blogCards = require('./blog/blogCards.js');

app.post('/blog/card', (req, res) => {
    const limit = Object.keys(req.body)[0];
    const connect = async () => {
        const card = await blogCards().then(cards => {
            return cards.filter(card => {
                if (limit === undefined) return true
                const id = Number(card.id);
                if (id >= limit.start && id <= limit.end) return true;
                console.log('false')
                return false
            })
        });
        res.send(card)
    };
    connect();

})

//checkAdmin
const checkAdminDb = require('./db/checkAdminDb.js');

app.post('/admin', (req, res) => {
    console.log('req body')
    const keysRaw = Object.keys(req.body)[0];
    const body = JSON.parse(keysRaw)
    const connect = async () => {
        console.log(body.login, body.password)
        const admin = await checkAdminDb(body.login, body.password);
        res.send(admin);
    }
    connect();
})




app.post('/branches/postBranches/telegram', (req, res) => {
    console.log('postBranches/telegram');
    const subj = Object.keys(req.body)[0];
    console.log(req.body);
    const connect = async () => {
        const allBranches = await profDB.postBranches(subj, true);
        const keys = Object.keys(allBranches[subj]);
        console.log(keys);
        res.send(keys);
    }
    connect();
});
app.post('/branches/setProfsByBraches/telegram', jsonParser, (req, res) => {
    console.log('setProfsByBraches/telegram');
    const connect = async () => {
        const subj = req.body.subjects;
        const branches = req.body.branches;
        const score = req.body.score;
        const allBranches = await profDB.setProfsByBraches(branches, subj, score);

        res.send(allBranches);
    }
    connect();
});




app.listen(PORT);