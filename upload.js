const fs = require('fs')
const cors = require('cors')
const express = require('express')
const app = require('express')()
const http = require('http').Server(app)
const sanitize = require("sanitize-filename");
const fileUpload = require('express-fileupload')
const config = require('./config');
app.use(express.static('public'))
app.use(cors())
app.use(fileUpload({ limits: { fileSize: 5 * 1024 * 1024 } }))

http.listen(3000, () => {
  console.log('listening on *:3000')
})

app.post('/files', (req, res) => {
  if (!req.files)
    return res.status(400).send('No files were uploaded.')
  for (let key in req.files) {
    if (!req.files[key].truncated && fs.existsSync(config.path + key) && fs.lstatSync(config.path + key).isDirectory()) {
      res.write(req.files[key].name + " sent succesfully.")
      req.files[key].mv(config.path + key + '/' + sanitize(req.files[key].name), function (err) {
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
