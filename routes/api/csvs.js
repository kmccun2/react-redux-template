const express = require('express')
const router = express.Router()
let fs = require('fs')

// @route    GET api/linelist/:job
// @desc     Grab line list csv file
router.get('/linelist/:job', async (req, res) => {
  try {
    let csv = fs.readFile(
      'database/' + req.params.job + '/line_list.csv',
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

// @route    GET api/status_report/:job
// @desc     Grab status report csv file
router.get('/status_report/:job', async (req, res) => {
  try {
    let csv = fs.readFile(
      'database/' + req.params.job + '/status_report.csv',
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

// @route    GET api/forecast/:job
// @desc     Grab forecast csv file
router.get('/forecast/:job', async (req, res) => {
  try {
    let csv = fs.readFile(
      'database/' + req.params.job + '/forecast.csv',
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

// @route    GET api/bom_export/:job
// @desc     Grab bom export csv file
router.get('/bom_export/:job', async (req, res) => {
  try {
    let csv = fs.readFile(
      'database/' + req.params.job + '/bom_export.csv',
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