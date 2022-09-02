const express = require('express')
const app = express()
const cors = require('cors')
const fs = require('fs')
const path = require('path')
const WSSerwer = require('express-ws')(app)
const aWss = WSSerwer.getWss()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())
app.ws('/', (ws, req)=>{

    ws.on('message', (msg)=>{
        msg = JSON.parse(msg)

        switch(msg.method){
            case 'connection' :
                connectionHandler(ws, msg)
                break;
            case 'draw' :
                broadcastConnection(ws, msg)
            break;
        }

    })

    const connectionHandler = (ws, msg) => {
        ws.id = msg.id
        broadcastConnection(ws, msg)

    }

    function broadcastConnection (ws, msg) {
        aWss.clients.forEach(client => {

            if(client.id === msg.id) {
                client.send(JSON.stringify(msg))
            }

        })
        

    }

    
    console.log('Подключение установлено Server')
})

app.post('/image', (req, res) => {
    try{
        const data = req.body.img.replace('data:image/png;base64,', '')
        fs.writeFileSync(path.resolve(__dirname, 'files', `${req.query.id}.jpg`), data, 'base64')
        return res.status('200').json('Загружено')

    } catch (e) {
        console.log(e)
        return res.status('500').json('Error Ay-ya-yay)')

    }
})
app.get('/image', (req, res) => {
    try{
        
        const file = fs.readFileSync(path.resolve(__dirname, 'files', `${req.query.id}.jpg`))
        const data = 'data:image/png;base64,' + file.toString('base64')
        return res.status('200').json(data);

    } catch (e) {
        console.log(e)
        return res.status('500').json('Error Ay-ya-yay)')

    }
})
app.listen(PORT, () => console.log(`Подключение на ${PORT} порте`))