const express = require('express')
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const fs = require('fs');
const cors = require('cors')
const Bot = require('./Bot.js')
const hound = require('hound')

app.use(express.static('public'))
app.use(cors())

class SoundBoard {
    constructor(path, botToken, channelName) {
        this.bot = new Bot(botToken, path, channelName)
        this.watcher = hound.watch(path)
        this.path = path
        this.tree = []
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
                    io.emit('nowPlaying', url)
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

      /*  app.get('/', (req, res) => {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write("<meta charset='UTF-8'>");
            res.write('<link rel="stylesheet" type="text/css" href="style.css">')
            res.write(`<script src="/socket.io/socket.io.js"></script>`)
            res.write(`<script src="main.js"></script>`)
            res.write(`<input id="youtube"><button onClick="emitTube()">Play</button><br>`)
            res.write(`<button onClick="stopPlaying()">Stop</button>`)
            res.write(`<button onClick="pausePlaying()">Pause</button>`)
            res.write(`<button onClick="resumePlaying()">Resume</button><br>`)
            res.write(`<button style="display: none" onClick="logOut()">Log out</button><br>`)
            res.write(`<input id="slider" type="range" min="0.1" max="2.5" step="0.05"><br>`)
            res.write(`<div id="nowPlaying"></div>`)
            res.write("<br><br><div class='audio'>\n");
            fs.readdirSync(this.path).forEach(file => {
                if (file !== '.dropbox' & file !== 'desktop.ini')
                    if (fs.lstatSync(this.path + file).isDirectory()) {
                        res.write(`<div class="row">`)
                        res.write("<p style='font-weight: bold'>" + file + "</p>" + "<br>")
                        fs.readdirSync(this.path + file).forEach(folderFile => {
                            res.write("<a id='" + file + "/" + folderFile + "'>");
                            res.write(folderFile);
                            res.write("</a>");
                            res.write("<br>\n");
                        })
                        res.write(`</div>`)
                    } else {
                        res.write("<a id='" + file + "'>");
                        res.write(file);
                        res.write("</a>");
                        res.write("<br>\n");
                    }

            })
            res.write('</div>');
            return res.end();
        }); */
    }
}

soundBoard = new SoundBoard('', '', '')