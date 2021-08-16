const db = require('../db/db');
const dbKz = require('../db/dbKz');


const subjectsList = ["ГеоБио", "Творч", "ФизМат", "БиоХим", "ГеоИст", "КазКЛит", "РусРЛит",
    "ИноИст", "КазЛит/РусЛит", "МатГео", "ИстЧоп", "ФизХим", "ГеоИно"
].map(subj => subj.toLowerCase());

const isTrueSubj = (firstSubject, secondSubject) => subjectsList.includes(firstSubject.toLowerCase() + secondSubject.toLowerCase()) ?
    (firstSubject.toLowerCase() + secondSubject.toLowerCase()) :
    (secondSubject.toLowerCase() + firstSubject.toLowerCase())

const getTrueSubj = (subjects) => {
    const subjectsList = ["ГеоБио", "Творч", "ФизМат", "БиоХим", "ГеоИст", "КазКЛит", "РусРЛит",
        "ИноИст", "КазЛит/РусЛит", "МатГео", "ИстЧоп", "ФизХим", "ГеоИно"
    ].map(subj => subj.toLowerCase());
    return subjectsList.includes(subjects.full.toLowerCase()) ? subjects.full : subjects.reversed
}

const subjectsLongList = [{
    short: 'геобио',
    long: 'География/Биология'
},
    {
        short: 'творч',
        long: 'Творческий экзамен'
    },
    {
        short: 'физмат',
        long: 'Физика/Математика'
    },

    {
        short: 'БиоХим',
        long: 'Биология/Химия'
    },
    {
        short: 'ГеоИст',
        long: 'География/Всемирная история'
    },
    {
        short: 'КазКЛит',
        long: 'Казахский язык/Казахская литература'
    },
    {
        short: 'РусРЛит',
        long: 'Русский язык/Русская литература'
    },
    {
        short: 'казлит/руслит',
        long: 'Казахская литература/Русская литература'
    },
    {
        short: 'МатГео',
        long: 'Математика/География'
    },
    {
        short: 'ИстЧоп',
        long: 'Всемирная история/Человек.Общество.Право'
    },
    {
        short: 'ИноИст',
        long: 'Иностранный язык/Человек.Общество.Право'
    },
    {
        short: 'ФизХим',
        long: 'Физика/Химия'
    },
    {
        short: 'ГеоИно',
        long: 'География/Иностранный язык'
    }
]

const getLongVersionOfSubjectsByShort = (rawSubjects) => subjectsLongList.filter(subject => subject.short.toLowerCase() === rawSubjects)[0].long


class Filter {

    constructor(lang) {
        this.db = lang === 'kz' ? dbKz : db
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


    _getAllProfs() {
        const profs = Object.entries(this.db).reduce((acc, [key, value], index) => {
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
        }, [])
        return profs
    }

    getAllProfs() {
        return Object.entries(this.db).reduce((acc, [subjectKey, subjectValue]) => {
            Object.entries(subjectValue).forEach(([branchKey, branchValue]) => {
                Object.entries(branchValue).forEach(([profKey, profValue]) => {
                    profValue.subjects = getLongVersionOfSubjectsByShort(subjectKey)
                    acc.push(profValue)
                })
            })
            return acc
        }, [])
    }


    getAllBranches() {
        return Object.keys(this.db).reduce((acc, subject) => {
            Object.keys(this.db[subject]).forEach(branchKey => {
                acc.push(branchKey)
            })
            return acc
        }, [])
    }


    getBranchesBySubjects(firstSubject, secondSubject) {
        if (!firstSubject && !secondSubject) return this.getBranches()
        if (firstSubject && !secondSubject) return Object.keys(this.db).reduce((acc, subjectKey) => {
            if (subjectKey.includes(firstSubject.short.toLowerCase())) {
                Object.keys(this.db[subjectKey]).forEach(currentBranch => acc.push(currentBranch))
            }
            return acc
        }, [])
        return this.postBranches({
            full: firstSubject.short.toLowerCase() + secondSubject.short.toLowerCase(),
            reverse: secondSubject.short.toLowerCase() + firstSubject.short.toLowerCase()
        })
    }

     postBranches(subjects, isTrueSubj = false) {
        let db = this._getBranchesBySubjects(subjects, isTrueSubj);
        return Object.keys(db)
    }

    _getBranchesBySubjects(chosenSubj, isTrueSubj = false) {
        const subject = (isTrueSubj ? chosenSubj : getTrueSubj(chosenSubj)).toLowerCase();
        const result = this.db[subject]
        return result;
    }



    computeProfsBySubjects(firstSubject, secondSubject) {
        return Object.entries(this.db).reduce((acc, [subjectKey, subjectValue]) => {
            if ((firstSubject !== null && secondSubject !== null)) {
                const firstSubjectShort = firstSubject.toLowerCase()
                const secondSubjectShort = secondSubject.toLowerCase()
                const isSubjInlcudes = (subj1, subj2) => {
                    return subjectKey.toLowerCase().includes(subj1 + subj2)
                }
                if (isSubjInlcudes(firstSubjectShort, secondSubjectShort) || isSubjInlcudes(secondSubjectShort, firstSubjectShort)) {
                    Object.entries(subjectValue).forEach(([branchKey, branchValue]) => Object.entries(branchValue).forEach(([profKey, profValue]) => {
                        profValue.subjects = getLongVersionOfSubjectsByShort(subjectKey)
                        acc.push(profValue)
                    }))
                }
            } else {
                [firstSubject, secondSubject].filter(subj => subj !== null).forEach(subj => {
                    if (subjectKey.toLowerCase().includes(subj.toLowerCase())) {
                        Object.entries(subjectValue).forEach(([branchKey, branchValue]) => Object.entries(branchValue).forEach(([profKey, profValue]) => {
                            profValue.subjects = getLongVersionOfSubjectsByShort(subjectKey)
                            acc.push(profValue)
                        }))
                    }
                })
            }
            return acc
        }, []).flat()
    }

    computeProfsBySelectedBranch(selectedBranch, firstSubject, secondSubject) {
        return Object.keys(this.db).reduce((acc, subjectKey) => {
            Object.keys(this.db[subjectKey]).forEach(branchKey => {
                if (branchKey === selectedBranch) Object.entries(this.db[subjectKey][branchKey]).forEach(([codeProf, prof]) => {
                    if (firstSubject === null && secondSubject === null) return acc.push(prof)
                    const firstSubjectShort = firstSubject.toLowerCase()
                    if (firstSubject && !secondSubject && subjectKey.includes(firstSubjectShort)) return acc.push(prof)
                    if (firstSubject && secondSubject && (subjectKey === firstSubjectShort + secondSubject.toLowerCase() ||
                        subjectKey === secondSubject.toLowerCase() + firstSubjectShort)) return acc.push(prof)
                })
            })
            return acc
        }, [])
    }


}

module.exports = Filter