const {
    MongoClient
} = require("mongodb");

const uri = "mongodb+srv://aslan2001:aslan2001@cluster0.ynqbk.mongodb.net/UNTBase?retryWrites=true&w=majority";

const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});


class ProfDB {

    getTrueSubj(subjects) {
        const subjectsList = ["ГеоБио", "Творч", "ФизМат", "БиоХим", "ГеоИст", "КазКЛит", "РусРЛит",
            "ИноИст", "КазЛит/РусЛит", "МатГео", "ИстЧоп", "ФизХим", "ГеоИно"
        ].map(subj => subj.toLowerCase());
        return subjectsList.includes(subjects.full.toLowerCase()) ? subjects.full : subjects.reversed
    }

    async getBranches(chosenSubj, isTrueSubj = false) {
        this.db = {};
        const subject = (isTrueSubj ? chosenSubj : this.getTrueSubj(chosenSubj)).toLowerCase();
        try {
            await client.connect();
            const subjects = client.db().collection('subjects');
            const all = await subjects.findOne({
                [subject]: {
                    $exists: true
                }
            }, {
                projection: {
                    [subject]: 1
                }
            });
            console.log(all);
            this.db = all;
            return all;
        } catch (e) {
            console.log('ERROR GetBranches')
            console.log(e);
        }
        return this.db;
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

    async getAllProfs() {
        try {
            await client.connect();
            const subjects = client.db().collection('subjects');
            const all = await subjects.findOne()
            console.log(all)
            const profs = Object.entries(all).reduce((acc, [key, value], index) => {
                Object.entries(value).forEach(([keyArea, valueCodes]) => {
                    Object.entries(valueCodes).forEach(([keyProf, valueCode]) => {
                        if (key in acc) {
                            acc[key].push({
                                code: valueCode.code,
                                name: valueCode.name,
                                min: valueCode.min
                            })
                        } else {
                            acc[key] = []
                            acc[key].push({
                                code: valueCode.code,
                                name: valueCode.name,
                                min: valueCode.min
                            })
                        }
                    })
                })
                return acc
            }, {})
            this.db = all;
            delete profs["_id"]
            return profs
        } catch (e) {
            console.log('ERROR GetAllProfs')
            console.log(e);
        }
        return this.db;
    }


    async postBranches(subjects, isTrueSubj = false) {
        let db = await this.getBranches(subjects, isTrueSubj);
        return db[Object.keys(db)[1]];
    }

    getFilteredByScore(score, filteredBySubjProfs) {
        const res =  Object.entries(filteredBySubjProfs).reduce((acc, [keySubj, profsValue]) => {
            profsValue = profsValue.filter(prof => Number(prof.min) < score)
            acc[keySubj] = profsValue
            return acc
        }, {})
        return res
    }



    async postProfs(subjects) {
        const branches = await this.getBranches(subjects);
        const db = Object.keys(branches)[1];
        return this.getProfsBySubj(branches[db]);
    }

    async setProfsByBraches(chosenBranches, subject, score, isQouta = false) {
        await client.connect();
        const elems = client.db().collection('subjects');
        const db = await elems.findOne({
            [subject]: {
                $exists: true
            }
        }, {
            projection: {
                [subject]: 1
            }
        });
        this.db = db[subject];
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


        const keys = Object.keys(res);

        const grants = keys.map((key, i) => {
            const grant = `${i + 1} ${res[key].code} ${res[key].name}`;
            return grant
        });
        console.log(grants);
        return grants;
    }

}


const profDB = new ProfDB(uri);
module.exports = profDB;