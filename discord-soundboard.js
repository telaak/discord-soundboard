const config = require('./config');
const sb = require('./soundboard.js')
soundBoard = new sb(config.path, config.discordToken, config.channelName, config.googleToken)