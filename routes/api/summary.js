'use strict'
const express = require('express')
const router = express.Router()
var { PythonShell } = require('python-shell')

// @route    GET /import/:job
// @desc     CALL PYTHON SCRIPT
router.get('/:job/:client', async (req, res) => {
  try {
    var options = {
      mode: 'text',
      args: [req.params.job, req.params.client],
    }
    PythonShell.run('database/Python/summary.py', options, function (
      err,
      results
    ) {
      if (err) throw err
      // Results is an array consisting of messages collected during execution
      console.log('Complete!')
      res.json(results.client)
    })
  } catch (err) {
    res.status(500).send('Server Error')
  }
})

module.exports = router
