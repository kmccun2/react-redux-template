import axios from 'axios'
import { UPDATE_JOB, JOB_ERROR } from './types'

// Update the line list and store in state
export const updateJob = (jobnum) => async (dispatch) => {
  try {
    // CREATE LINE LIST OBJECT
    let job = {
      spools: [],
    }

    //     //
    //     //
    //     //
    //     //
    ////// //////

    // GRAB LINELIST CSV
    const res = await axios.get('/api/csvs/linelist/' + jobnum)
    let linelist_csv = res.data

    // FIND HEADERS FROM LINELIST CSV
    var lines = linelist_csv.split('\n')
    let header = lines.filter(
      (line) =>
        line.includes('ISO') ||
        (line.includes('Iso') && line.includes('Material'))
    )[0]
    let headers = header.split(',')

    // FIND FIRST ROW OF SPOOLS
    let count = 1
    let first_row = undefined
    lines.map((line) => {
      count += 1
      if (
        line.includes('ISO') ||
        (line.includes('Iso') && line.includes('Material'))
      ) {
        first_row = count
      }
      return lines
    })

    // ASSIGN COLUMN NUMBER TO EACH HEADER

    let piecemark_col = undefined
    let material_col = undefined
    let issued_col = undefined
    let spool_col = undefined
    let priority_group_col = undefined
    let priority_col = undefined
    let area_col = undefined
    let iso_col = undefined
    let detailing_col = undefined
    let checking_col = undefined
    let shop_col = undefined
    let on_hold_col = undefined

    count = 0

    headers.map((header) => {
      if (header === 'Spool ID' || header === 'Spool Tag') {
        piecemark_col = count
      } else if (header === 'Material') {
        material_col = count
      } else if (header === 'Status' || header === 'Date Issued') {
        issued_col = count
      } else if (header === 'SPOOL' || header === 'Sketch No.') {
        spool_col = count
      } else if (header === 'Priority Group') {
        priority_group_col = count
      } else if (header === 'Priority #' || header === 'Individual Priority') {
        priority_col = count
      } else if (header === 'Area') {
        area_col = count
      } else if (header === 'Iso' || header === 'Iso No.' || header === 'ISO') {
        iso_col = count
      } else if (header === 'In Detailing' || header === 'Detailing') {
        detailing_col = count
      } else if (header === 'In Checking' || header === 'Checking') {
        checking_col = count
      } else if (header === 'SHOP' || (header === 'Fab. Location') === 'Shop') {
        shop_col = count
      } else if (header === 'HOLD' || header === 'HOLD Status') {
        on_hold_col = count
      }
      count += 1
      return headers
    })

    // ADD SPOOLS FROM LINELIST TO JOB
    count = 0
    lines.map((line) => {
      count += 1
      if (
        line.split(',')[spool_col] !== '' &&
        line.split(',')[spool_col] !== undefined &&
        count >= first_row
      ) {
        job.spools.push({
          spool: line.split(',')[spool_col],
          piecemark_col: line.split(',')[piecemark_col],
          material_col: line.split(',')[material_col],
          issued_col: line.split(',')[issued_col],
          spool_col: line.split(',')[spool_col],
          priority_group_col: line.split(',')[priority_group_col],
          priority_col: line.split(',')[priority_col],
          area_col: line.split(',')[area_col],
          iso_col: line.split(',')[iso_col],
          detailing_col: line.split(',')[detailing_col],
          checking_col: line.split(',')[checking_col],
          shop_col: line.split(',')[shop_col],
          on_hold_col: line.split(',')[on_hold_col],
        })
      }
      return job
    })

    ////// /////
    //     //  //
    ////// /////
    // // //
    ////// //  //

    // GRAB STATUS REPORT CSV
    const res_sr = await axios.get('/api/csvs/status_report/' + jobnum)
    let status_report_csv = res_sr.data

    // FIND HEADERS FROM STATUS REPORT CSV
    lines = status_report_csv.split('\n')
    header = lines.filter((line) => line.includes('PIECEMARK'))[0]
    headers = header.split(',')

    // FIND FIRST ROW OF SPOOLS
    count = 1
    first_row = undefined
    lines.map((line) => {
      count += 1
      if (line.includes('PIECEMARK')) {
        first_row = count
      }
      return lines
    })

    dispatch({
      type: UPDATE_JOB,
      payload: { job: job, jobnum: jobnum },
    })
  } catch (err) {
    console.log(err)
    dispatch({
      type: JOB_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status },
    })
  }
}
