'use strict'
const express = require('express')
const router = express.Router()
let fs = require('fs')
const XLSX = require('xlsx')

// @route    POST /summary
// @desc     READ SUMMARY TEMPLATE FILE
router.get('/summary', async (req, res) => {
  try {
    let workbook = XLSX.readFile('database/Templates/JobSumTemplate.xlsx')
    res.json(workbook)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
})

module.exports = router
