let socket = io();
let tree = []
onload = function () {
    fetch('http://localhost/files')
        .then(function (response) {
            return response.json();
        })
        .then(function (myJson) {
            tree = myJson
            buildFileTree()
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

socket.on('volume', function (value) {
    let slider = document.getElementById('slider')
    slider.value = value
})

socket.on('nowPlaying', function (fileName) {
    let nowPlaying = document.getElementById('nowPlaying')
    nowPlaying.textContent = fileName
})

socket.on('newFile', function (fileName) {
    let treeArray = fileName.split('\\')
    tree.find(object => object.folder === treeArray[1]).files.push(treeArray[2])
    let fileTree = document.getElementById('fileTree')
    let ul = file.getElementById(treeArray[1]).getElementsByTagName('ul')[0]
    let li = document.createElement('li')
    li.addEventListener('click', function (evt) {
        socket.emit('playFile', fileName)
        emitVolume()
    })
    li.textContent = fileName
    ul.appendChild(li)
    
})