const express = require('express')
const app = require('express')()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const fs = require('fs')
const cors = require('cors')
const Bot = require('./bot.js')
const hound = require('hound')
const fetch = require('node-fetch')
const sanitize = require("sanitize-filename");
const fileUpload = require('express-fileupload');
app.use(express.static('public'))
app.use(cors())
app.use(fileUpload({ limits: { fileSize: 5 * 1024 * 1024 } }))

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
  }

  watchFileChanges () {
    this.watcher.on('create', (file, stats) => {
        if (fs.lstatSync(file).isDirectory()) {
          let object = {}
          object.folder = this.getFilePathEnd(file).split('/')[0]
          object.files = []
          let index = this.getFolderIndex(object.folder)
          this.tree.splice(index, 0, object)
          io.emit('newFolder', object)
        } else {
          let filePath = this.getFilePathEnd(file)
          let treeArray = filePath.split('/')
          let folderName = treeArray[0]
          let fileName = treeArray[1]
          let folder = this.getFolder(folderName)
          let index = this.getIndex(folder, fileName)
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

  socketIO () {
    io.on('connection', socket => {
      socket.on('playFile', fileName => {
        if (!this.bot.isPlaying) {
          this.bot.play(fileName)
          io.emit('nowPlaying', fileName)
        }
      })
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
    })
  }

  getYoutubeInfo (url, key = this.googleApiKey) {
    let id = url.split('=')[1]
    fetch('https://www.googleapis.com/youtube/v3/videos?part=snippet&id=' + id + '&key=' + key)
      .then(function (response) {
        return response.json()
      })
      .then(function (myJson) {
        io.emit('nowPlaying', myJson.items[0].snippet.title, url)
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

    app.post('/files', (req, res) => {
      if (!req.files)
        return res.status(400).send('No files were uploaded.')
      for (let key in req.files) {
        if (!req.files[key].truncated && fs.existsSync(this.path + key) && fs.lstatSync(this.path + key).isDirectory()) {
          res.write(req.files[key].name + " sent succesfully.")
          req.files[key].mv(this.path + key + '/' + sanitize(req.files[key].name), function (err) {
            if (err) return res.status(500).send(err)
          })
        } else if (req.files[key].truncated) {
          res.write(req.files[key].name + " is too large\n")
        } else { 
          res.write('Folder ' + key + ' does not exist')
        }
      }
      return res.end()
    })
  }
}

module.exports = SoundBoard

