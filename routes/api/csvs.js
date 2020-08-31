const express = require('express')
const createCsvWriter = require('csv-writer').createArrayCsvWriter
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

// @route    GET api/client_tags/:job
// @desc     Grab client tags csv file
router.get('/client_tags/:job', async (req, res) => {
  try {
    let csv = fs.readFile(
      'database/' + req.params.job + '/client_tags.csv',
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

// @route    GET api/man_hours/:job
// @desc     Grab man_hours csv file
router.get('/man_hours/:job', async (req, res) => {
  try {
    let csv = fs.readFile(
      'database/' + req.params.job + '/man_hours.csv',
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

// @route    GET api/manhour_codes
// @desc     Grab manhour_codes csv file
router.get('/manhour_codes', async (req, res) => {
  try {
    let csv = fs.readFile('database/manhour_codes.csv', 'utf8', function (
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
