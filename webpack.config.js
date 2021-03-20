const path = require('path');

module.exports = {
    mode: 'development',
    entry: {
        main: './ejs/scripts/index.js',
        admin: './ejs/scripts/admin.js',
        newPost: './ejs/scripts/newPost.js'
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname,'ejs/dist')
    }
}