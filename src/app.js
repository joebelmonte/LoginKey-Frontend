const path = require('path')
const express = require('express')

const app = express()
const port = process.env.PORT

app.set('view engine', 'hbs')
app.use(express.static(path.join(__dirname, '../public')))

app.get('/login', (req, res) => {
    res.render('login')
})

app.get('/signup', (req, res) => {
    res.render('signup')
})

app.get('/', (req, res) => {
    res.render('index')
})

app.listen(port, () => {
    console.log(`The front end server is up on port ${port}.`)
})