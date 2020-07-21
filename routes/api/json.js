'use strict'
const express = require('express')
const router = express.Router()
let fs = require('fs')

// @route    GET /import/:job
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
