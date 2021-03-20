import axios from 'axios';
const login = document.querySelector('.admin-loggin-input');
const password = document.querySelector('.admin-password-input');

const sendValue = document.querySelector('.admin-send-values');


const sendValueToServer = async (login, password) => {
    const res = await axios.post('http://localhost:4000/admin', JSON.stringify({login,password}))
        .then(data => data)
        .catch(e => console.log(e));
        console.log(res.data)
    return res.data;
}

sendValue.addEventListener('click',async (e)=>{
    e.preventDefault();
    sendValue.classList.add('disabled')
    const isAdmin = await sendValueToServer(login.value,password.value)
    const newValue = [...sendValue.classList];
    newValue.pop()
    console.log(newValue)
    sendValue.className = newValue.join(' ');
    if(isAdmin === true){
        window.location.href = 'http://localhost:4000/admin';
    }

})


