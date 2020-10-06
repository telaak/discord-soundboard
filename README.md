# discord-soundboard

Web soundboard interface for playing audio from local files or from YouTube. Uses Hound to listen for new files and folders, Socket.io to send WebSocket messages and Express for listing files and uploading new files.

![Screenshot](https://laaksonen.eu/soundboard.png)

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

Subfolders inside `config.path` are used as list titles with files inside the list. The backend also sends new folders and files through the WebSocket connection and they are then added to the DOM in the right alphabetic position.

Clicking on files sends the file's path through WebSocket which the bot then plays. The site displays the current/last played file in the navbar. YouTube links' info is fetched through Google's YouTube API and used as a link to the current video.

The audio player's controls, including the volume slider, are also synced through the WebSocket connection.

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
