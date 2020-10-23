const express = require('express')
const router = express.Router()
let fs = require('fs')
const xlsx = require('xlsx')

// @route    GET api/xlsx/input
// @desc     Grab input file with sp data (BOM, Batch, CVC)
router.get('/input', async (req, res) => {
  try {
    let wb = xlsx.readFile('database/Comparisons/input.xlsx')
    let origwb = wb
    let sheet_name_list = wb.SheetNames
    let jobnum = undefined
    let type = undefined
    let headers = []

    // Rename headers
    for (let i = 0; i < 100; i++) {
      // Create a cell reference
      cell = xlsx.utils.encode_cell({ c: i, r: 0 })
      cell2 = xlsx.utils.encode_cell({ c: i, r: 1 })

      // Avoid blank cells on header row
      if (wb.Sheets[sheet_name_list[0]][cell] != undefined) {
        headers.push(wb.Sheets[sheet_name_list[0]][cell].v)
        // Find file type
        if (wb.Sheets[sheet_name_list[0]][cell].v == 'SIJOBNUM') type = 'CVC'
        if (wb.Sheets[sheet_name_list[0]][cell].v.includes('BOM PATH')) type = 'BOM'
        if (wb.Sheets[sheet_name_list[0]][cell].v == 'JOB') type = 'BATCH'
        // Find job number
        if (wb.Sheets[sheet_name_list[0]][cell2] != undefined) {
          if (
            wb.Sheets[sheet_name_list[0]][cell].v == 'SIJOBNUM' ||
            wb.Sheets[sheet_name_list[0]][cell].v.includes('BOM PATH') ||
            wb.Sheets[sheet_name_list[0]][cell].v == 'JOB'
          ) {
            if (wb.Sheets[sheet_name_list[0]][cell2].v.includes('7114')) jobnum = 7114
            if (wb.Sheets[sheet_name_list[0]][cell2].v.includes('7116')) jobnum = 7116
            if (wb.Sheets[sheet_name_list[0]][cell2].v.includes('7052')) jobnum = 7052
          }
        }
      }
    }

    // Create wb object to send to front end
    let workbook = {
      rows: xlsx.utils.sheet_to_json(wb.Sheets[sheet_name_list[0]]),
      jobnum: jobnum,
      type: type,
      headers: headers,
    }

    // Send data to compareItems.js
    res.json(workbook)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
})

module.exports = router
