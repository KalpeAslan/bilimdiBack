import axios from 'axios';

const cards = [];

const getPosts = async ()=>{
    const url = 'http://localhost:4000/blog/card';
    try{
        const posts = await axios.post(url)
                    .then(data=>data)
                    .catch(e=>console.log(e));
        console.log(posts.data)
        posts.data.forEach(post=>cards.push(post));
    } catch(e){
        console.log(e);
    }
}


document.addEventListener('DOMContentLoaded', async () => {
    let startedPosts = 3;
    const body = document.querySelector('.admin-blog-body');
    await getPosts(startedPosts)
    cards.slice(-startedPosts).forEach(card=>{
        const post = `<div class="card blog-post-card">
        <img class="card-img-top" src=${card.img} alt="Card image cap" />
        <div class="card-body">
            <h5 class="card-title">${card.title}</h5>
            <p class="card-text">${card.desc}</p>
        </div>
        <ul class="list-group list-group-flush">
            <li class="list-group-item">Dapibus ac facilisis in</li>
            <li class="list-group-item">Vestibulum at eros</li>
        </ul>
        <div class="card-body">
            <a href="#" class="card-link">Card link</a>
            <a href="#" class="card-link">Another link</a>
        </div>
    </div>`;
    body.innerHTML += post;
    });

})