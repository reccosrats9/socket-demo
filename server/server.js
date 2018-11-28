const express = require('express')

const bodyParser = require('body-parser')

const app = express()
const io = require('socket.io')(app.listen(3333, () => console.log(`listening on 3333`)))

app.use(express.static('build'))

const session = require('express-session')({
    secret: "123098124hlakfsdhalseuya9w8yrhoasdfhalkjsd",
    resave: true,
    saveUninitialized: true
})
const sharedsession = require('express-socket.io-session')

app.use(session)
io.use(sharedsession(session, { autosave: true }))
//access the session using client.handshake.session


//io.on is for listening inputs and io.emit is for send endpoints

//ALWAYS set up the one below. This is the one that connects the client to the server for the first time. The first param is always a string (connection and disconnect are reserved strings), the second a cb fxn
let messages = []
let adminMessages=[]
let id = 0
let adminPW= 'bugs'

//io represents the namespace. io.sockets allows us to send to everyone who is connected

io.on('connection', client => {
    console.log('client connected: ', client.id)

    let interval = setInterval(() => {
        client.emit('date', new Date() )
    }, 1000)

    client.on('userLoggingIn', (name) => {
        client.handshake.session.name= name
    })

    client.on('messageFromClient', ({ admin, message }) => {
        let { name } = client.handshake.session
        if (admin) {
            adminMessages.push({ id, message, name })
            id++
            io.to('admin').emit('messageFromServer', { admin, message, name })
        } else {
            messages.push({ id, message, name })
            id++
            io.emit('messageFromServer', {admin: false, message, name})
        }
    })

    client.on('pwFromClient', pw => {
        if (pw === adminPW) {
            client.join('admin')
            client.emit('adminConfirm', true)
        } else {
            client.emit('adminConfirm', false)
        }
    })

    client.on('disconnect', client => {
        clearInterval(interval)
    })

})