let socket = io();
let tree = []
onload = function () {
    fetch('http://laaksonen.me:8080/files')
        .then(function (response) {
            return response.json();
        })
        .then(function (myJson) {
            tree = myJson
            buildFileTree()
            createEmitters()
        });
}

function buildFileTree() {
    let fileTree = document.getElementById('fileTree')
    tree.forEach(element => {
        let div = document.createElement('div')
        div.setAttribute('id', element.folder)
        let ul = document.createElement('ul')
        div.textContent = element.folder
        element.files.forEach(file => {
            let li = document.createElement('li')
            li.addEventListener('click', function (evt) {
                socket.emit('playFile', element.folder + "/" + file)
                emitVolume()
            })
            li.textContent = file
            ul.appendChild(li)
        })
        div.appendChild(ul)
        fileTree.appendChild(div)
    });
}

function createEmitters() {
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

function emitVolume() {
    let slider = document.getElementById('slider')
    socket.emit('volume', slider.value)
}

function emitTube() {
    socket.emit('playUrl', document.getElementById("youtube").value)
}
function stopPlaying() {
    socket.emit('stopPlaying')
}
function pausePlaying() {
    socket.emit('pausePlaying')
}
function resumePlaying() {
    socket.emit('resumePlaying')
}

function logOut() {
    socket.emit('logOut')
}

function replay() {
    socket.emit('replay')
    emitVolume()
}

socket.on('volume', function (value) {
    let slider = document.getElementById('slider')
    slider.value = value
})

socket.on('nowPlaying', function (name, url = "") {
    let nowPlaying = document.getElementById('nowPlaying')
    if (url !== "") {
        let html = "<a href='" + url + "'>" + name + "</a>"
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

socket.on('newFile', function (filePath) {
    let treeArray = parseTreeFromFileName(filePath)
    let folderName = treeArray[0]
    let fileName = treeArray[1]
    let folder = getFolder(folderName)
    let index = getFileIndex(folder, fileName)
    folder.splice(index, 0, fileName)
    let ul = getUnorderedList(folderName)
    let li = document.createElement('li')
    li.addEventListener('click', function (evt) {
        socket.emit('playFile', filePath)
        emitVolume()
    })
    li.textContent = fileName
    ul.insertBefore(li, ul.childNodes[index])
})

socket.on('fileDeleted', function (filePath) {
    let treeArray = parseTreeFromFileName(filePath)
    let folderName = treeArray[0]
    let fileName = treeArray[1]
    let folder = getFolder(folderName)
    let index = getFileIndex(folder, fileName)
    folder.splice(index - 1, 1)
    let ul = getUnorderedList(folderName)
    ul.removeChild(ul.childNodes[index - 1])
})

socket.on('newFolder', function (folderObject) {
    let fileTree = document.getElementById('fileTree')
    let folderName = folderObject.folder
    let index = getFolderIndex(folderName)
    tree.splice(index, 0, folderObject)
    let div = document.createElement('div')
    div.setAttribute('id', folderObject.folder)
    div.textContent = folderObject.folder
    let ul = document.createElement('ul')
    div.appendChild(ul)
    fileTree.insertBefore(div, fileTree.childNodes[index])
})