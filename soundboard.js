const express = require('express')
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const fs = require('fs');
const cors = require('cors')
const Bot = require('./Bot.js')
const hound = require('hound')
const fetch = require('node-fetch');


app.use(express.static('public'))
app.use(cors())

class SoundBoard {
    constructor(path, botToken, channelName, googleApiKey) {
        this.bot = new Bot(botToken, path, channelName)
        this.watcher = hound.watch(path)
        this.path = path
        this.tree = []
        this.googleApiKey = googleApiKey
        this.listen()
        this.express()
        this.socketIO()
        this.getFiles()
        this.watchFileChanges()
    }

    watchFileChanges() {
        this.watcher.on('create', (file, stats) => {
            let treeArray = file.split('\\')
            this.tree.find(object => object.folder === treeArray[1]).files.push(treeArray[2])
            io.emit('newFile', file)
        })
    }

    sortFiles() {
        this.tree.forEach(object => {
            object.files.sort()
        })
    }

    listen() {
        http.listen(80, () => {
            console.log('listening on *:80');
        });
    }

    socketIO() {
        io.on('connection', socket => {
            socket.on('playFile', fileName => {
                if (!this.bot.isPlaying) {
                    this.bot.play(fileName)
                    io.emit('nowPlaying', fileName)
                }
            });
            socket.on('playUrl', url => {
                if (!this.bot.isPlaying) {
                    this.bot.play(url)
                    this.getYoutubeInfo(url)
                }
            })
            socket.on('stopPlaying', () => {
                this.bot.stopPlaying()
            })
            socket.on('pausePlaying', () => {
                this.bot.pausePlaying()
            })
            socket.on('resumePlaying', () => {
                this.bot.resumePlaying()
            })
            socket.on('volume', value => {
                if (value <= 2.5 && this.bot.isPlaying) {
                    this.bot.setVolume(value)
                    socket.broadcast.emit('volume', value)
                }
            })
            socket.on('logOut', () => {
                this.bot.logOut()
            })
            socket.on('replay', () => {
                this.bot.replay()
            })
        });
    }

    getYoutubeInfo(url, key=this.googleApiKey) {
        let id = url.split('=')[1]
        fetch('https://www.googleapis.com/youtube/v3/videos?part=snippet&id=' + id + '&key=' + key)
        .then(function (response) {
            return response.json();
        })
        .then(function (myJson) {
            io.emit('nowPlaying', myJson.items[0].snippet.title, url)
        });
    }

    getFiles() {
        fs.readdirSync(this.path).forEach(file => {
            if (file !== '.dropbox' & file !== 'desktop.ini')
                if (fs.lstatSync(this.path + file).isDirectory()) {
                    let json = {}
                    let files = []
                    json.folder = file
                    fs.readdirSync(this.path + file).forEach(folderFile => {
                        files.push(folderFile)
                    })
                    json.files = files
                    this.tree.push(json)
                } else {

                }
        })
    }

    express() {
        app.get('/files/', (req, res) => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.write(JSON.stringify(this.tree))
            return res.end()
        })

        app.get('/', (req, res) => {
            res.sendFile('index.html', {root: __dirname })
        })
    }
}

module.exports = SoundBoard