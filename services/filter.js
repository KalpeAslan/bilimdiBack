const db = require('../db/db');




function isTrueSubj(firstSubject, secondSubject) {
    const subjectsList = ["ГеоБио", "Творч", "ФизМат", "БиоХим", "ГеоИст", "КазКЛит", "РусРЛит",
        "ИноИст", "КазЛит/РусЛит", "МатГео", "ИстЧоп", "ФизХим", "ГеоИно"
    ].map(subj => subj.toLowerCase());
    return subjectsList.includes(firstSubject.toLowerCase() + secondSubject.toLowerCase()) ? (firstSubject.toLowerCase() + secondSubject.toLowerCase()) :
        (secondSubject.toLowerCase() + firstSubject.toLowerCase())
}

class Filter {
    _getAllProfs() {
        const profs = Object.entries(db).reduce((acc, [key, value], index) => {
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
        return Object.entries(db).reduce((acc, [subjectKey, subjectValue]) => {
            Object.entries(subjectValue).forEach(([branchKey, branchValue]) => {
                Object.entries(branchValue).forEach(([profKey, profValue]) => {
                    acc.push(profValue)
                })
            })
            return acc
        }, [])
    }


    getAllBranches() {
        return Object.keys(db).reduce((acc, subject) => {
            Object.keys(db[subject]).forEach(branchKey => {
                acc.push(branchKey)
            })
            return acc
        }, [])
    }

    computeProfsBySubjects(firstSubject, secondSubject) {
        console.log(firstSubject)
        return Object.entries(db).reduce((acc, [subjectKey, subjectValue]) => {
            if ((firstSubject !== null && secondSubject !== null)) {
                const firstSubjectShort = firstSubject.toLowerCase()
                const secondSubjectShort = secondSubject.toLowerCase()
                const isSubjInlcudes = (subj1, subj2) => {
                    return subjectKey.toLowerCase().includes(subj1 + subj2)
                }
                if (isSubjInlcudes(firstSubjectShort, secondSubjectShort) || isSubjInlcudes(secondSubjectShort, firstSubjectShort)) {
                    Object.entries(subjectValue).forEach(([branchKey, branchValue]) => Object.entries(branchValue).forEach(([profKey, profValue]) => acc.push(profValue)))
                }
            } else {
                [firstSubject, secondSubject].filter(subj => subj !== null).forEach(subj => {
                    if (subjectKey.toLowerCase().includes(subj.toLowerCase())) {
                        Object.entries(subjectValue).forEach(([branchKey, branchValue]) => Object.entries(branchValue).forEach(([profKey, profValue]) => acc.push(profValue)))
                    }
                })
            }
            return acc
        }, []).flat()
    }

    computeProfsBySelectedBranch(selectedBranch, firstSubject, secondSubject) {
        return Object.keys(db).reduce((acc, subjectKey) => {
            Object.keys(db[subjectKey]).forEach(branchKey => {
                if (branchKey === selectedBranch) Object.entries(db[subjectKey][branchKey]).forEach(([codeProf, prof]) => {
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