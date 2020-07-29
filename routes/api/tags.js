'use strict'
const express = require('express')
const router = express.Router()
var { PythonShell } = require('python-shell')

// @route    GET /import/:job
// @desc     READ JOB JSON FILE
router.get('/client/:job', async (req, res) => {
  try {
    let json = fs.readFile(
      'database/' + req.params.job + '/client_tags.json',
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
