const blogCard = async () => {
    const dbTest = {
        id: '2',
        title: 'Second пост',
        desc: 'Краткое описание',
        img: 'https://i.pinimg.com/originals/e8/a1/c1/e8a1c12b832eb17447031276a893b27b.png',
        body: `Если индекс отрицательный, begin указывает смещение от конца последовательности. Вызов slice(-2) извлечёт два последних элемента последовательности.`,
        tags: 'Math,Motivation,News',
        views: '120',
        comments: '10',
        time: '1 hours ago'
    }

    return dbTest;
}
module.exports = blogCard;