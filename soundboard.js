const express = require('express')
const app = require('express')()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const fs = require('fs')
const cors = require('cors')
const Bot = require('./bot.js')
const hound = require('hound')
const fetch = require('node-fetch')
app.use(express.static('public'))
app.use(cors())

class SoundBoard {
  constructor (path, botToken, channelName, googleApiKey) {
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
    this.getFolder = folderName => this.tree.find(object => object.folder === folderName).files
    this.getFolderIndex = folderName => this.tree.findIndex(object => object.folder > folderName)
    this.getIndex = (folder, fileName) => folder.findIndex(letter => letter > fileName)
    this.getFilePathEnd = path => path.split('//')[1]
    this.getFileIndexDel = (folder, fileName) => folder.findIndex(letter => letter == fileName)
    this.getFolderIndexDel = folderName => this.tree.findIndex(object => object.folder == folderName)
    this.array = ['TONY/aah.mp3', 'DIGIMON/digi.mp3', 'UGANDA/gwa.mp3', 'WARCRAFT/burn.mp3']
    //setTimeout(() => {this.playList(this.array)}, 2000)
    this.stopPlaying = false
  }

  watchFileChanges () {
    this.watcher.on('create', (file, stats) => {
        if (fs.lstatSync(file).isDirectory()) {
          let object = {}
          object.folder = this.getFilePathEnd(file).split('/')[0]
          object.files = []
          let index = this.getFolderIndex(object.folder)
          if(index == -1) index = this.tree.length
          this.tree.splice(index, 0, object)
          io.emit('newFolder', object)
        } else {
          let filePath = this.getFilePathEnd(file)
          let treeArray = filePath.split('/')
          let folderName = treeArray[0]
          let fileName = treeArray[1]
          let folder = this.getFolder(folderName)
          let index = this.getIndex(folder, fileName)
          if(index == -1) index = folder.length
          folder.splice(index, 0, fileName)
          io.emit('newFile', filePath)
        }
    })
    this.watcher.on('delete', file => {
      if (this.getFilePathEnd(file).includes('/')) {
        let filePath = this.getFilePathEnd(file)
        let treeArray = filePath.split('/')
        let folderName = treeArray[0]
        let fileName = treeArray[1]
        let folder = this.getFolder(folderName)
        if(folder == 'undefined') return
        let index = this.getFileIndexDel(folder, fileName)
        folder.splice(index, 1)
        io.emit('fileDeleted', filePath)
      } else {
        let folderName = this.getFilePathEnd(file)
        let folderIndex = this.getFolderIndexDel(folderName)
        this.tree.splice(folderIndex, 1)
        io.emit('folderDeleted', folderName)
      }
    })
  }

  sortFiles () {
    this.tree.forEach(object => {
      object.files.sort()
    })
  }

  listen () {
    http.listen(8080, () => {
      console.log('listening on *:8080')
    })
  }

  playList(list, index = 0) {
    this.bot.play(list[index]).then(message => {
      if (index < list.length - 1) {
       this.playList(list, index + 1)
      }
    })
  }


  socketIO () {
    io.on('connection', socket => {
      socket.on('playFile', fileName => {
        if (!this.bot.isPlaying) {
          this.bot.play(fileName)
          this.bot.client.user.setActivity(fileName, {type: 'LISTENING'})
          io.emit('nowPlaying', fileName)
        }
      })
      socket.on('playUrl', url => {
        if (!this.bot.isPlaying) {
          if(url.includes('list=')) {
            this.playYoutubePlaylist(url)
          } else {
            this.bot.play(url)
            this.getYoutubeInfo(url)
          }
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
        if(value >= 2.5) return
        if (this.bot.isPlaying) {
          this.bot.setVolume(value)
          this.bot.volume = value
          socket.broadcast.emit('volume', value)
        } else {
          this.bot.volume = value
          console.log(this.bot.volume)
          socket.broadcast.emit('volume', value)
        }
      })
      socket.on('logOut', () => {
        this.bot.logOut()
      })
      socket.on('replay', () => {
        this.bot.replay()
      })
      socket.on('stopPlayList', () => {
        this.stopPlaying = true
      })
    })
  }

  getYoutubeInfo (url, key = this.googleApiKey, bot = this.bot) {
    let id = url.split('=')[1].substr(0,11)
    fetch('https://www.googleapis.com/youtube/v3/videos?part=snippet&id=' + id + '&key=' + key)
      .then(response => response.json())
      .then(json => {
        io.emit('nowPlaying', json.items[0].snippet.title, url)
        bot.client.user.setActivity(json.items[0].snippet.title, {type: 'LISTENING', url: url})
      })
  }

  playYoutubePlaylist(url, key = this.googleApiKey, bot = this.bot) {
    let id = url.split('list=')[1]
    fetch('https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=' + id + '&key=' + key)
      .then(response => {
        return response.json()
      })
      .then(async json => {
        for (let element in json.items) {
          if(this.stopPlaying){this.stopPlaying = false; break}
          io.emit('nowPlaying', json.items[element].snippet.title, 'https://youtube.com/watch?v=' + json.items[element].snippet.resourceId.videoId)
          bot.client.user.setActivity(json.items[element].snippet.title, {type: 'Listening'})
          await bot.play('https://youtube.com/watch?v=' + json.items[element].snippet.resourceId.videoId)
        }
      })
  }

  getFiles () {
    fs.readdirSync(this.path).forEach(file => {
      if (file !== '.dropbox' & file !== 'desktop.ini') {
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
      }
    })
  }

  express () {
    app.get('/files/', (req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.write(JSON.stringify(this.tree))
      return res.end()
    })

    app.get('/', (req, res) => {
      res.sendFile('index.html', { root: __dirname })
    })
  }
}

module.exports = SoundBoard

