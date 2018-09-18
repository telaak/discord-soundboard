const Discord = require('discord.js');
const yt = require('ytdl-core');

class Bot {
    constructor(token, path, voiceChannel) {
        this.client = new Discord.Client();
        this.client.login(token);
        this.token = token
        this.path = path
        this.dispatcher
        this.isReady = false;
        this.isPlaying = false;
        this.nowPlaying
        this.client.on('ready', () => {
            this.isReady = true
            this.voiceChannel = this.client.channels.find('name', voiceChannel)
        });
    }

    replay() {
        play(this.nowPlaying)
    }

    stopLoop() {
        clearInterval(this.interval)
    }

    loop(fileName) {
        this.interval = setInterval(() => {
            stopLoop()
            this.play(fileName)
        }, 50)
    }


    play(target, path = this.path) {
        this.voiceChannel.join().then(connection => {
            if (!this.isPlaying) {
                this.dispatcher = target.includes('youtu') ? connection.playStream(yt(target, { audioonly: true })) : connection.playStream(path + target)
                this.isPlaying = true;
                this.nowPlaying = target
                this.dispatcher.on('start', start => {
                    connection.player.streamingData.pausedTime = 0;
                });
                this.dispatcher.on("end", end => {
                    this.isPlaying = false;
                });
            }
        }).catch(err => console.log(err));
    }

    logOut() {
        this.client.destroy()
    }

    stopPlaying() {
        if (this.isPlaying)
            this.dispatcher.end()
    }

    pausePlaying() {
        if (this.isPlaying)
            this.dispatcher.pause()
    }

    resumePlaying() {
        if (this.isPlaying)
            this.dispatcher.resume()
    }

    setVolume(value) {
        if (this.isPlaying && value <= 2.5)
            this.dispatcher.setVolume(value)
    }

    playFile(fileName) {
        this.play(fileName)
    }

    playURL(url) {
        this.play(url)
    }
}

module.exports = Bot;