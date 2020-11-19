const express = require('express')
const router = express.Router()
let fs = require('fs')

// // @route    GET api/linelist/:job
// // @desc     Grab line list csv file
// router.get('/linelist/:job', async (req, res) => {
//   try {
//     let csv = fs.readFile(
//       'database/' + req.params.job + '/line_list.csv',
//       'utf8',
//       function (err, data) {
//         res.json(data)
//       }
//     )
//   } catch (err) {
//     console.error(err.message)
//     res.status(500).send('Server Error')
//   }
// })

module.exports = router
