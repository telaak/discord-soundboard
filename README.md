# discord-soundboard

Web soundboard interface for playing audio from local files or from YouTube. Uses Hound to listen for new files and folders, Socket.io to send WebSocket messages and Express for listing files and uploading new files.

## Getting Started

### Prerequisites

```
npm
node
ffmpeg
```

### Installing

Clone or download the repository

```
git clone https://github.com/telaak/discord-soundboard.git
```

Run npm install

```
npm i
```

## Running

Run discord-soundboard.js

```
node discord-soundboard.js
```

## Configuration

Create config.js inside the project root and insert the path to your audio files' root, your Discord bot's token, the voice channel you wish to use and Google's API token for parsing YouTube videos and playlists

```
const config = {
  path: '',
  discordToken: '',
  channelName: '',
  googleToken: ''
}

module.exports = config
```

## Use instructions



## Built With

* [Visual Studio Code](https://expressjs.com/)
* [Express](https://github.com/react-community/create-react-native-app)
* [socket.io](https://socket.io/)
* [Hound](https://github.com/gforceg/node-hound)
* [ffmpeg](https://www.ffmpeg.org/)
* [Discord.js](https://discord.js.org/#/)
* [ytdl-core](https://github.com/fent/node-ytdl-core)

## Authors

* **Teemu Laaksonen**

See also the list of [contributors](https://github.com/telaak/discord-soundboard/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
