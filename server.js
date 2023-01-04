console.log('> Script Started')
import express from 'express'
import http from 'http'
import createGame from './public/game.js'
import { Server } from 'socket.io'

const app = express()
const server = http.createServer(app)
const port = 3000
const sockets = new Server(server, { /* OPITIONS */ })

app.use(express.static('public'))

const game = createGame() 
game.start()

game.subscribe((command) => {
	console.log(`> Emiting ${command.type}`)
	sockets.emit(command.type, command)
}) 

sockets.on('connection', (socket) => {
	const playerId = socket.id
	console.log(`> Player connected on server ${playerId}`)

	game.addPlayer({playerId: playerId});
	console.log(`> Player Connected: ${playerId}`)

	socket.emit('setup', game.state)

	socket.on('disconnect', () => {
		game.removePlayer({playerId: playerId})
		console.log(`> Player Desconnected: ${playerId}`)
	})

	socket.on('move-player', (command) => {
		command.playerId = playerId
		command.type = 'move-player'

		game.movePlayer(command)
	})
})

server.listen(port, () => {
	console.log(`> Server listening on port:  ${port}`)
})  