let socket = io.connect('https://sb.laaksonen.me')
let tree = []
onload = function () {

let input = document.getElementById("youtube");
input.addEventListener("keypress", function(event) {
    if (event.keyCode === 13) {
        event.preventDefault()
        emitTube()
    }
});

  setTimeout(() => {
    fetch('https://sb.laaksonen.me/api/files')
      .then(function (response) {
        return response.json()
      })
      .then(function (myJson) {
        tree = myJson
        buildFileTree()
        createEmitters()
      })
  }, 1)
}

function buildFileTree () {
  let fileTree = document.getElementById('fileTree')
  tree.forEach(element => {
    let div = document.createElement('div')
    div.setAttribute('id', element.folder)
    let ul = document.createElement('ul')
    ul.className = "list-group"
    div.textContent = element.folder
    element.files.forEach(file => {
      let li = document.createElement('li')
      li.className = "list-group-item list-group-item-action"
      li.addEventListener('click', function (evt) {
        socket.emit('playFile', element.folder + '/' + file)
      })
      li.textContent = file
      ul.appendChild(li)
    })
    div.appendChild(ul)
    fileTree.appendChild(div)
  })
}

function createEmitters () {
  /* let links = document.querySelectorAll('a')
     for (let i = 0; i < links.length; i++) {
         links[i].addEventListener('click', function (evt) {
             socket.emit('playFile', links[i].id)
             emitVolume()
         });
     } */

  let slider = document.getElementById('slider')
  slider.addEventListener('input', function (evt) {
    socket.emit('volume', this.value)
  })
}

function emitVolume () {
  let slider = document.getElementById('slider')
  socket.emit('volume', slider.value)
}

function emitTube () {
  socket.emit('playUrl', document.getElementById('youtube').value)
}
function stopPlaying () {
  socket.emit('stopPlaying')
}
function pausePlaying () {
  socket.emit('pausePlaying')
}
function resumePlaying () {
  socket.emit('resumePlaying')
}

function logOut () {
  socket.emit('logOut')
}

function replay () {
  socket.emit('replay')
}

function stopPlayList () {
  socket.emit('stopPlayList')
}

socket.on('volume', function (value) {
  let slider = document.getElementById('slider')
  slider.value = value
})

socket.on('nowPlaying', function (name, url = '') {
  let nowPlaying = document.getElementById('nowPlaying')
  if (url !== '') {
    let html = "<a target='_blank' rel='noopener noreferrer' href='" + url + "'>" + name + '</a>'
    nowPlaying.innerHTML = html
  } else {
    nowPlaying.textContent = name
  }
})

const parseTreeFromFileName = fileName => fileName.split('/')
const getFolder = folderName => tree.find(object => object.folder === folderName).files
const getFolderDiv = folderName => document.getElementById('fileTree').findIndex(element => element.id > folderName)
const getFileIndex = (folder, fileName) => folder.findIndex(letter => letter > fileName)
const getFolderIndex = folderName => tree.findIndex(object => object.folder > folderName)
const getUnorderedList = folderName => document.getElementById(folderName).getElementsByTagName('ul')[0]
const getFileIndexDel = (folder, fileName) => folder.findIndex(letter => letter == fileName)
const getFolderIndexDel = folderName => tree.findIndex(object => object.folder === folderName)

socket.on('newFile', function (filePath) {
  let treeArray = parseTreeFromFileName(filePath)
  let folderName = treeArray[0]
  let fileName = treeArray[1]
  let folder = getFolder(folderName)
  let index = getFileIndex(folder, fileName)
  if(index == -1) index = folder.length
  folder.splice(index, 0, fileName)
  let ul = getUnorderedList(folderName)
  let li = document.createElement('li')
  li.addEventListener('click', function (evt) {
    socket.emit('playFile', filePath)
  })
  li.textContent = fileName
  ul.insertBefore(li, ul.childNodes[index])
})

socket.on('fileDeleted', function (filePath) {
  let treeArray = parseTreeFromFileName(filePath)
  let folderName = treeArray[0]
  let fileName = treeArray[1]
  let folder = getFolder(folderName)
  let index = getFileIndexDel(folder, fileName)
  folder.splice(index, 1)
  let ul = getUnorderedList(folderName)
  ul.removeChild(ul.childNodes[index])
})

socket.on('newFolder', function (folderObject) {
  let fileTree = document.getElementById('fileTree')
  let folderName = folderObject.folder
  let index = getFolderIndex(folderName)
  if(index == -1) index = tree.length
  tree.splice(index, 0, folderObject)
  let div = document.createElement('div')
  div.setAttribute('id', folderObject.folder)
  div.textContent = folderObject.folder
  let ul = document.createElement('ul')
  div.appendChild(ul)
  fileTree.insertBefore(div, fileTree.childNodes[index])
})

socket.on('folderDeleted', function (folderName) {
  let folderIndex = getFolderIndexDel(folderName)
  tree.splice(folderIndex, 1)
  let div = document.getElementById(folderName)
  div.parentNode.removeChild(div)
})

function toggleDropDown() {
  let nav = document.getElementById("topNav");
  if (nav.className === "topnav") {
    nav.className += " responsive";
  } else {
    nav.className = "topnav";
  }
}
