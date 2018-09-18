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
}

socket.on('volume', function (value) {
    let slider = document.getElementById('slider')
    slider.value = value
})

socket.on('nowPlaying', function (name, url="") {
    let nowPlaying = document.getElementById('nowPlaying')
    if(url !== "") {
        let html = "<a href='" + url + "'>" + name + "</a>"
        nowPlaying.innerHTML = html
    } else {
        nowPlaying.textContent = name
    }
})

socket.on('newFile', function (fileName) {
    let treeArray = fileName.split('//')[1].split('/')
    let folder = tree.find(object => object.folder === treeArray[0]).files
    let index = folder.findIndex(letter => letter > treeArray[1])
    folder.splice(index, 0, treeArray[1])
    console.log(folder)
    let fileTree = document.getElementById('fileTree')
    let ul = document.getElementById(treeArray[0]).getElementsByTagName('ul')[0]
    let li = document.createElement('li')
    li.addEventListener('click', function (evt) {
        socket.emit('playFile', fileName.split('//')[1])
        emitVolume()
    })
    li.textContent = treeArray[1]
    console.log(ul)
    console.log(ul.childNodes[index])
    ul.insertBefore(li, ul.childNodes[index])

})
