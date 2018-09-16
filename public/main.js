let socket = io();
onload = function () {
    let links = document.querySelectorAll('a')
    for (let i = 0; i < links.length; i++) {
        links[i].addEventListener('click', function (evt) {
            socket.emit('playFile', links[i].id)
            emitVolume()
        });
    }
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