'use strict'

const express = require('express')
const router = express.Router()
let fs = require('fs')

// @route    POST /export/:job
// @desc     SAVE JSON FILE TO DATABASE
router.post('/export/:job', async (req, res) => {
  try {
    console.log(req.body)
    fs.writeFileSync('job.json', req.body)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
})

// @route    POST /import/:job
// @desc     READ JOB JSON FILE
router.get('/import/:job', async (req, res) => {
  try {
    let json = fs.readFile(
      'database/' + req.params.job + '/job.json',
      'utf8',
      function (err, data) {
        res.json(data)
      }
    )
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
})

module.exports = router
