const {
    MongoClient
} = require("mongodb");

const db = require('../db/db');
const dbKz = require('../db/dbKz');



const uri = "mongodb+srv://aslan2001:aslan2001@cluster0.ynqbk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"

const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});


class ProfDB {


    constructor(lang) {
        this.db = lang === 'kz' ? dbKz : db
    }


    getTrueSubj(subjects) {
        const subjectsList = ["ГеоБио", "Творч", "ФизМат", "БиоХим", "ГеоИст", "КазКЛит", "РусРЛит",
            "ИноИст", "КазЛит/РусЛит", "МатГео", "ИстЧоп", "ФизХим", "ГеоИно"
        ].map(subj => subj.toLowerCase());
        return subjectsList.includes(subjects.full.toLowerCase()) ? subjects.full : subjects.reversed
    }

    getColorBySubject(subject) {
        switch (subject) {
            case 'геобио':
                return '#47c293'
            case 'творч':
                return '#EFB1C2'
        }
    }


    getBranches() {
        return Object.keys(this.db).reduce((acc, current) => {
            Object.keys(this.db[current]).forEach(item => {
                if (!acc.includes(item)) {
                    acc.push(item)
                }
            })
            return acc
        }, [])
    }


    getAll() {
        return this.db
    }

    async getBranchesBySubjects(chosenSubj, isTrueSubj = false) {
         const subject = (isTrueSubj ? chosenSubj : this.getTrueSubj(chosenSubj)).toLowerCase();
        try {
            const all = this.db[subject]
            this.db = all;
            return all;
        } catch (e) {
            console.log('ERROR getBranchesBySubjects')
            console.log(e);
        }
        return this.db;
    }



    async postNewUser({
        sName,
        sPhone,
        sEmail,
        date
    }) {
        try {
            await client.connect();
            const users = client.db().collection('users');
            let res = false
            await users.insertOne({
                sName,
                sPhone,
                sEmail,
                date
            }).then(
                res = true
            )
        } catch (e) {
            console.log('ERROR users POST MONGO')
            console.log(e);
        }
    }

    getProfsBySubj(dbSubj) {
        const keys = Object.keys(dbSubj);
        const res = keys.reduce((acc, key) => {
            for (const branch in dbSubj[key]) {
                acc = [...acc, dbSubj[key][branch]];
            }
            return acc;
        }, []);
        return res;
    }



     postBranches(subjects, isTrueSubj = false) {
        let db = this.getBranchesBySubjects(subjects, isTrueSubj);
        // return db[Object.keys(db)[1]];
        return Object.keys(db)
    }




    getFilteredByScore(score, filteredBySubjProfs) {
        const res = Object.entries(filteredBySubjProfs).reduce((acc, [keySubj, profsValue]) => {
            profsValue = profsValue.filter(prof => Number(prof.min) < score)
            acc[keySubj] = profsValue
            return acc
        }, {})
        return res
    }

    getFilterByScoreAllProfs(score) {
        const res = Object.entries(this.db).reduce((acc, [subjKey, subjValue]) => {
            Object.keys(this.db[subjKey]).forEach(branchKey => {
                Object.keys(this.db[subjKey][branchKey]).forEach(prof => {
                    if (Number(this.db[subjKey][branchKey][prof].min) <= score) {
                        acc.push(this.db[subjKey][branchKey][prof])
                    }
                })
            })
            return acc
        }, [])
        return res
    }



     postProfs(subjects) {
        const branches =  this.getBranchesBySubjects(subjects);
        const db = Object.keys(branches)[1];
        return this.getProfsBySubj(branches[db]);
    }

    async setProfsByBraches(chosenBranches, subject, score, isQouta = false) {
         const res = chosenBranches.reduce((acc, branch, i) => {
            for (const codeIn in this.db[branch]) {
                const qoutaOrMin = isQouta ? 'minWithQuota' : 'min';
                for (const code in this.db[branch]) {
                    if (this.db[branch][code].quotes.length !== 0) {
                        for (const univerIn in this.db[branch][code].quotes) {
                            const key = Object.keys(this.db[branch][code].quotes[univerIn])[0];
                            const univer = this.db[branch][code].quotes[univerIn][key];

                            if (Number(univer[qoutaOrMin]) <= score) {
                                if (acc[code] !== undefined) {
                                    acc[code].univers.push(univer);
                                } else {
                                    acc[code] = {
                                        code: this.db[branch][code].code,
                                        name: this.db[branch][code].name,
                                        minScores: [univer.min],
                                        minScoresWithQouta: [univer.minWithQuota],
                                        univers: [univer]
                                    };
                                }
                            }
                        }
                    } else {
                        if (Number(this.db[branch][code][qoutaOrMin]) <= Number(score)) {
                            acc[this.db[branch][code].code] = {
                                code: this.db[branch][code].code,
                                name: this.db[branch][code].name,
                                min: this.db[branch][code].min,
                                minWithQuota: this.db[branch][code].minWithQuota
                            }
                        }
                    }
                }
            }
            return acc;

        }, {});

        return res
    }



}


module.exports = ProfDB;