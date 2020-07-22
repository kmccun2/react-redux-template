const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')

const app = express()

// Init Middleware
app.use(express.json({ extended: false }))
app.use(bodyParser.json({ limit: '50mb' }))
app.use(
  bodyParser.urlencoded({
    limit: '1000mb',
    extended: true,
    parameterLimit: 50000,
  })
)

// Define Routes
app.use('/api/csvs', require('./routes/api/csvs'))
app.use('/api/json', require('./routes/api/json'))
app.use('/api/summary', require('./routes/api/summary'))

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('client/build'))

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
  })
}

const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log(`Server started on port ${PORT}`))
