import axios from 'axios';


const uploadToServer = async (img) => {
    const formData = new FormData();
    formData.append("filedata", img);
    const res = await axios.post('http://localhost:4000/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }).catch(e => console.log(e));
        return res;
}

export default uploadToServer;