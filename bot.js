const Discord = require('discord.js')
const yt = require('ytdl-core')

class Bot {
  constructor (token, path, voiceChannel) {
    this.client = new Discord.Client()
    this.client.login(token)
    this.token = token
    this.path = path
    this.dispatcher = null
    this.isReady = false
    this.isPlaying = false
    this.nowPlaying = ''
    this.volume = 1
    this.client.on('error', () => console.log('error'))
    this.client.on('ready', () => {
      this.isReady = true
      this.voiceChannel = this.client.channels.find(channel => channel.name === voiceChannel)
    })
  }

  replay () {
    this.play(this.nowPlaying)
  }

  stopLoop () {
    clearInterval(this.interval)
  }

  loop (fileName) {
    this.interval = setInterval(() => {
      this.stopLoop()
      this.play(fileName)
    }, 50)
  }

  
  async play (target, path = this.path) {
    let promise = new Promise((resolve, reject) => {
      this.voiceChannel.join().then(connection => {
        if (!this.isPlaying) {
          this.dispatcher = target.includes('youtu') ? connection.playStream(yt(target, { audioonly: true }), {volume: this.volume}) : connection.playStream(path + target, {volume: this.volume})
          this.isPlaying = true
          this.nowPlaying = target
          this.dispatcher.on('start', start => {
            connection.player.streamingData.pausedTime = 0
            this.dispatcher.setVolume(this.volume)
          })
          this.dispatcher.on('end', end => {
            this.isPlaying = false
            this.client.user.setActivity('Soundboard', { type: 'LISTENING' });
            resolve()
          })
        }
      }).catch(err => console.log(err))
    })
    return await promise
  }

  logOut () {
    this.client.destroy()
  }

  stopPlaying () {
    if (this.isPlaying) { this.dispatcher.end() }
  }

  pausePlaying () {
    if (this.isPlaying) { this.dispatcher.pause() }
  }

  resumePlaying () {
    if (this.isPlaying) { this.dispatcher.resume() }
  }

  setVolume (value) {
    if (this.isPlaying && value <= 2.5) { this.dispatcher.setVolume(value) }
  }

  playFile (fileName) {
    this.play(fileName)
  }

  playURL (url) {
    this.play(url)
  }
}

module.exports = Bot
