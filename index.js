const express = require('express');
const PORT = 4000;
const cors = require('cors');
const app = express();
const jsonParser = express.json();
const profDB = require('./db/connect.js')
const fileupload = require('express-fileupload');
const path = require('path');
const dirname = path.resolve();

const Filter = require('./services/filter.js')
const filter = new Filter()

console.log('OQYADMIN works on: ' + PORT)
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
    const connect = async () => {
        const allBranches = await profDB.postBranches(req.body);
        res.send(allBranches);
    };
    connect();
});


app.get('/allProfs', (req, res) => {
    const connect = async () => {
        const allProfs = await profDB.getAllProfs();
        res.send(allProfs)
    }
    connect()
})

app.post('/profs/postProfs', jsonParser, (req, res) => {
    const connect = async () => {
        const allProfs = await profDB.postProfs(req.body);
        res.send(allProfs)
    }
    connect();
});
app.post('/getFilteredByScore', jsonParser, (req, res) => {
    const connect = () => {
        const {
            score,
            filteredBySubjProfs
        } = req.body
        res.send(profDB.getFilteredByScore(score, filteredBySubjProfs))
    }
    connect()
})


app.get('/getBranches', (req, res) => res.send(profDB.getBranches()))

app.get('/getAll', (req, res) => {
    return res.send(profDB.getAll())
})

app.post('/getFilterByScoreAllProfs', jsonParser, (req, res) => res.send(profDB.getFilterByScoreAllProfs(req.body.score)))

//get img from new-post
const multer = require('multer');
const fs = require('fs');
app.use(multer({
    dest: __dirname + '/uploads'
}).single("file"));


app.post("/upload", async (req, res) => {
    const filedata = req.files.filedata;
    const files = await fs.readdir('./uploads/', 'utf-8', (err, data) => data);
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
    const keysRaw = Object.keys(req.body)[0];
    const body = JSON.parse(keysRaw)
    const connect = async () => {
        const admin = await checkAdminDb(body.login, body.password);
        res.send(admin);
    }
    connect();
})


app.post('/branches/setProfsByBraches', jsonParser, (req, res) => {
    const connect = async () => {
        const subj = req.body.subjects;
        const branches = req.body.branches;
        const score = req.body.score;
        const allBranches = await profDB.setProfsByBraches(branches, subj, score);
        res.send(allBranches);
    }
    connect();
});


app.post('/branches/_getBranchesBySubjects', jsonParser, function (req, res) {
    const connect = async () => {
        const branches = await profDB._getBranchesBySubjects(req.body.firstSubject, req.body.secondSubject)
        res.send(branches)
    }
    connect()
})

app.post('/branches/postBranches/telegram', (req, res) => {
    const subj = Object.keys(req.body)[0];
    const connect = async () => {
        const allBranches = await profDB.postBranches(subj, true);
        const keys = Object.keys(allBranches[subj]);
        res.send(keys);
    }
    connect();
    res.send('Ok')
});






app.post('/branches/setProfsByBraches/telegram', jsonParser, (req, res) => {
    const connect = async () => {
        const subj = req.body.subjects;
        const branches = req.body.branches;
        const score = req.body.score;
        const allBranches = await profDB.setProfsByBraches(branches, subj, score);
        res.send(allBranches);
    }
    connect();
});




app.get('/getAllProfs', (req, res) => {
    res.send(filter.getAllProfs())
})


app.post('/fetchProfsBySubjects', jsonParser, (req, res) => {
    const {
        firstSubject,
        secondSubject
    } = req.body
    res.send(filter.computeProfsBySubjects(firstSubject, secondSubject))
})


app.post('/fetchProfsByBranches', jsonParser, (req, res) => {
    const {
        selectedBranch,
        firstSubject,
        secondSubject
    } = req.body;
    res.send(filter.computeProfsBySelectedBranch(selectedBranch, firstSubject, secondSubject))
})









app.listen(PORT);