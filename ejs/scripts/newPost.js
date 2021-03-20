import uploadToServer from './helpers/uploadToServer.js'

const textArea = document.querySelector('.new-post-form-control');
const button = document.querySelector('.new-post-btn-primary');

const buttons = document.querySelector('.textarea-buttons');

let hideImg = true;

window.addEventListener('click', (e) => {
    console.log(e.target.classList)
    const classList = [...e.target.classList];
    if (classList.includes('img-method-index') || classList.includes('show-img-methods')) {} else {
        hideImg = true;
    }
})


const buttonsAreaRaw = {
    bold: {
        icon: '<i class="bi bi-type-bold"></i>',
        getHtml(text) {
            return `<b>${text}</b>`
        }
    },
    italic: {
        icon: '<i class="bi bi-type-italic"></i>',
        getHtml(text) {
            return `<i>${text}</i>`
        }
    },
    ulList: {
        icon: '<i class="bi bi-list-ul"></i>',
        getHtml(text) {
            let lists = [];
            const textsRaw = text.split('\n');
            console.log(textsRaw)
            textsRaw.forEach(textRaw => lists.push(`<li>${textRaw}</li>\n`))
            return `<ul>
            ${lists.join('')}
            </ul>`
        }
    },
    olList: {
        icon: '<i class="bi bi-list-ol"></i>',
        getHtml(text) {
            let lists = [];
            const textsRaw = text.split('\n').push('end');
            console.log(textsRaw)
            textsRaw.forEach(textRaw => lists.push(`<li>${textRaw}</li>\n`))
            return `<ol>
            ${lists.join('')}
            </ol>`
        }
    },
    // <i class="bi bi-card-image"></i>
    img: {
        icon: `<span class="list-group-item-img img-method-index"><i class="bi bi-card-image img-method-index"></i></span>`,
        isImg: true
    },
    link: {
        icon: '<i class="bi bi-link-45deg"><i>',
        getHtml(text) {
            const href = prompt('Введи ссылку/Сілтемені енгіз');
            return `<a href="${href}">${text}</a>`
        }
    }
};
const keys = Object.keys(buttonsAreaRaw);


const buttonsArea = keys.map((key, i) => {
    const elemRaw = buttonsAreaRaw[key];
    const li = document.createElement('li');
    li.className = 'list-group-item textarea-button-elem'
    li.innerHTML = elemRaw.icon
    li.setAttribute('data-icon', i);
    li.addEventListener('click', (e) => {
        const oldValue = textArea.value;
        const selected = textArea.value.substr(textArea.selectionStart, textArea.selectionEnd - textArea.selectionStart);

        if (elemRaw.isImg) {
            const showImgMethods = 'show-img-methods';
            const fromWeb = document.createElement('li');
            const fromCd = document.createElement('li');
            const methods = document.createElement('div');

            hideImg = !hideImg;
            if (!hideImg) {
                li.classList.add(showImgMethods)
                methods.classList.add('list-group-item-img-methods');
                fromWeb.classList.add('list-group-item', 'list-group-item-img-from-web')
                fromCd.classList.add('list-group-item', 'list-group-item-img-from-cd')
                fromWeb.textContent = 'Загрузить картинку с интернета'
                fromCd.innerHTML = `Загрузить картинку с устройства`;
                methods.append(fromWeb, fromCd)
                li.append(methods);

                const fromWebSelector = document.querySelector('.list-group-item-img-from-web');
                fromWebSelector.addEventListener('click', () => {
                    const src = prompt('Введи ссылку');
                    if (src === '' || src === null) return;
                    textArea.value = oldValue + `\n <img src="${src}"/>`
                });
                const fromCdSelector = document.querySelector('.list-group-item-img-from-cd');
                fromCdSelector.addEventListener('click', () => {
                    const liInputFile = document.createElement('li');
                    liInputFile.className = 'list-group-item';
                    const fileInputForm = `<div class="li-group-item-img-upload-form">
                   <label>Файл</label><br>
                   <input type="file" name="file" id="input-file-img"/><br><br>
                   <input type="submit" value="Отправить" class="send-img-submit"/>
                 </div>`;
                    liInputFile.innerHTML = fileInputForm;

                    buttons.append(liInputFile);

                    const submitImgs = document.querySelectorAll('.send-img-submit');
                    submitImgs.forEach(submitImg=>{
                        submitImg.addEventListener('click',(e)=>{
                            e.preventDefault();
                            const inputs = document.querySelectorAll('#input-file-img');
                            const lastFile = inputs[inputs.length - 1].files[0]
                            const isSendImg = uploadToServer(lastFile);
                            if(!isSendImg){
                                alert('ОШибка отправки файла')
                            } else {
                                liInputFile.classList.add('hidden')
                            }
                        })
                    })
                
                })

            } else {
                li.classList.remove(showImgMethods);
                console.log(li)
                li.lastChild.remove()
            }
        } else if (selected === null) {
            textArea.value = oldValue + elemRaw.getHtml(selected);
            return;
        }



        textArea.value = oldValue.replace(selected, elemRaw.getHtml(selected))
    })
    buttons.append(li)
});
console.log(buttonsArea)