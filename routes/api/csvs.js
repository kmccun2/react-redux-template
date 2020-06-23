const express = require('express')
const router = express.Router()
let fs = require('fs')

// @route    GET api/line_list
// @desc     Grab line list csv file
router.get('/linelist/:job', async (req, res) => {
  try {
    let csv = fs.readFile('database/6973/line_list.csv', 'utf8', function (
      err,
      data
    ) {
      res.json(data)
    })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
})

// @route    GET api/line_list
// @desc     Grab status report csv file
router.get('/status_report/:job', async (req, res) => {
  try {
    let csv = fs.readFile('database/6973/status_report.csv', 'utf8', function (
      err,
      data
    ) {
      res.json(data)
    })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
})

module.exports = router
