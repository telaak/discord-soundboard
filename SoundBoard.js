const express = require('express')
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const fs = require('fs');
const Bot = require('./Bot.js')
bot = new Bot('', '', 'Maan Siirto Firma')

class SoundBoard {
    constructor(path) {
        this.path = bot.path
        app.use(express.static('public'))
        this.listen()
        this.express()
        this.socketIO()
    }

    listen() {
        http.listen(80, function () {
            console.log('listening on *:80');
        });
    }

    socketIO() {
        io.on('connection', function (socket) {
            socket.on('playFile', function (fileName) {
                if (!bot.isPlaying) {
                    bot.play(fileName)
                    io.emit('nowPlaying', fileName)
                }
            });
            socket.on('playUrl', function (url) {
                if (!bot.isPlaying) {
                    bot.play(url)
                    io.emit('nowPlaying', url)
                }
            })
            socket.on('stopPlaying', function () {
                bot.stopPlaying()
            })
            socket.on('pausePlaying', function () {
                bot.pausePlaying()
            })
            socket.on('resumePlaying', function () {
                bot.resumePlaying()
            })
            socket.on('volume', function (value) {
                if (value <= 2.5 && bot.isPlaying) {
                    bot.setVolume(value)
                    io.emit('volume', value)
                }
            })
            socket.on('logOut', function () {
                bot.logOut()
            })
        });
    }

    express() {
        app.get('/', (req, res) => {
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
        });
    }
}

soundBoard = new SoundBoard()