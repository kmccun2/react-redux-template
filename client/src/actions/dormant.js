import axios from 'axios'
import moment from 'moment'
import {
  UPDATE_JOBS,
  JOBS_ERROR,
  SET_JOBS_LOADING,
  UPDATE_JOB_SPOOLS,
  UPDATE_DORMANT,
} from './types'

let countupdates = 0
let all_spools = []

let dormant = {
  overall: {
    lifespan: { total: 0, spools: 0, avg: 0 },
    i_p: { total: 0, spools: 0, avg: 0 },
    p_w: { total: 0, spools: 0, avg: 0 },
    w_rtsc: { total: 0, spools: 0, avg: 0 },
    rtsc_stc: { total: 0, spools: 0, avg: 0 },
    w_stc: { total: 0, spools: 0, avg: 0 },
    stc_rts: { total: 0, spools: 0, avg: 0 },
    rts_d_p: { total: 0, spools: 0, avg: 0 },
    w_d_p: { total: 0, spools: 0, avg: 0 },
    w_rts: { total: 0, spools: 0, avg: 0 },
    rts_d_np: { total: 0, spools: 0, avg: 0 },
    w_d_np: { total: 0, spools: 0, avg: 0 },
  },
  jobs: [],
  shops: [],
  materials: [],
}

// SET LOADING TO TRUE
export const setJobsLoading = () => async (dispatch) => {
  dispatch({
    type: SET_JOBS_LOADING,
  })
}

//UPDATE DORMANT SPOOLS
export const updateDormant = (jobnums) => async (dispatch) => {
  jobnums.map((each) => dispatch(updateJobSpools(each, jobnums)))
}

const updateJobSpools = (jobnum, jobnums) => async (dispatch) => {
  try {
    let job_spools = []
    let client = undefined
    let spools_list = []

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
      // CLIENT NAME
      if (line.split(',')[0].toUpperCase().includes('CLIENT NAME')) {
        client = line.split(',')[1]
      }
      count += 1
      if (
        (line.includes('ISO') || line.includes('Iso')) &&
        line.includes('Material')
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

    // ADD SPOOLS FROM LINELIST ALL SPOOLS
    count = 0
    lines.map((line) => {
      count += 1
      if (
        line.split(',')[spool_col] !== '' &&
        line.split(',')[spool_col] !== undefined &&
        count >= first_row
      ) {
        if (spools_list.includes(line.split(',')[spool_col]) === false) {
          job_spools.push({
            jobnum: jobnum,
            client: client,
            spool: line.split(',')[spool_col],
            piecemark: line.split(',')[piecemark_col],
            material: line.split(',')[material_col],
            issued: line.split(',')[issued_col],
            priority_group: line.split(',')[priority_group_col],
            priority: line.split(',')[priority_col],
            area: line.split(',')[area_col],
            iso: line.split(',')[iso_col],
            detailing: line.split(',')[detailing_col],
            checking: line.split(',')[checking_col],
            shop: line.split(',')[shop_col],
            on_hold: line.split(',')[on_hold_col],
            multiplier: 1,
            items: [],
            missing: [],
            missingsupports: { p: false, c: false, o: false },
            missingvalves: {},
            missingpipe: {},
            missingfittings: {},
            missingflanges: {},
          })
          spools_list.push(line.split(',')[spool_col])
        } else {
          job_spools.map((spool) => {
            if (spool.spool === line.split(',')[spool_col]) {
              spool.multiplier += 1
            }
            return job_spools
          })
        }
        return job_spools
      }
      return lines
    })

    //      ////// /////
    ////    //     //  //
    //////  ////// /////
    ////        // // //
    //      ////// //  //

    // GRAB STATUS REPORT CSV
    const res_sr = await axios.get('/api/csvs/status_report/' + jobnum)
    let status_report_csv = res_sr.data

    // FIND HEADERS FROM STATUS REPORT CSV
    lines = status_report_csv.split('\n')
    header = lines.filter(
      (line) => line.includes('PIECEMARK') || line.includes('PIECE MARK')
    )[0]
    headers = header.split(',')

    // FIND FIRST ROW OF SPOOLS
    count = 1
    first_row = undefined
    lines.map((line) => {
      count += 1
      if (line.includes('PIECEMARK') || line.includes('PIECE MARK')) {
        first_row = count
      }
      return lines
    })

    // ASSIGN COLUMN NUMBER TO EACH HEADER
    let sr_piecemark_col = undefined
    let pulled_col = undefined
    let weldout_col = undefined
    let rts_col = undefined
    let rtsc_col = undefined
    let stc_col = undefined
    let delivered_col = undefined
    let sr_on_hold_col = undefined

    count = 0

    headers.map((header) => {
      if (header === 'PIECE MARK' || header === 'PIECEMARK') {
        sr_piecemark_col = count
      } else if (header === 'DATE PULL') {
        pulled_col = count
      } else if (header === 'WELD OUT') {
        weldout_col = count
      } else if (header === 'SPOOL') {
        spool_col = count
      } else if (header === 'READY TO SHIP') {
        rts_col = count
      } else if (header === 'READY TO SHIP COATING') {
        rtsc_col = count
      } else if (header === 'SHIP TO COATING' || header === 'DATE TO PAINTER') {
        stc_col = count
      } else if (header === 'TO SITE' || header === 'DATE TO FIELD') {
        delivered_col = count
      } else if (header === 'ON HOLD' || header === 'HOLD DATE') {
        sr_on_hold_col = count
      }
      count += 1
      return headers
    })

    // ADD INFORMATION FROM STATUS REPORT TO JOB
    count = 0
    lines.map((line) => {
      count += 1
      if (
        line.split(',')[sr_piecemark_col] !== '' &&
        line.split(',')[sr_piecemark_col] !== undefined &&
        count >= first_row
      ) {
        job_spools.map((each) => {
          // ASSIGN STATUS REPORT INFORMATION
          if (line.split(',')[sr_piecemark_col] === each.piecemark) {
            each.pulled = line.split(',')[pulled_col]
            each.weldout = line.split(',')[weldout_col]
            each.rts = line.split(',')[rts_col]
            each.rtsc = line.split(',')[rtsc_col]
            each.stc = line.split(',')[stc_col]
            each.delivered = line.split(',')[delivered_col]
            each.on_hold = line.split(',')[sr_on_hold_col]
          }

          // CHECK IF SPOOLS IS WORKABLE BASED ON IF IT HAS BEEN ISSUED
          if (each.issued !== '') {
            each.workable = true
          } else {
            each.workable = false
          }

          return job_spools
        })
        return job_spools
      }
      return lines
    })
    countupdates += 1
    all_spools = all_spools.concat(job_spools)
    if (countupdates === jobnums.length) {
      dispatch({
        type: UPDATE_JOB_SPOOLS,
        payload: { job_spools: job_spools },
      })

      let materials_list = []
      let shops_list = []
      let jobnums_list = []

      // CREATE UNIQUE LISTS
      all_spools.map((spool) => {
        if (materials_list.includes(spool.material) === false) {
          materials_list.push(spool.material)
        }
        if (shops_list.includes(spool.shop) === false) {
          shops_list.push(spool.shop)
        }
        if (jobnums_list.includes(spool.jobnum) === false) {
          jobnums_list.push(spool.jobnum)
        }
        return spool
      })
      console.log(jobnums_list)

      // SIFT SPOOLS

      // SIFT FORMULA
      let addDormantObject = (variable, value, total, spools) => {
        if (variable === value) {
          total += value
          spools += 1
        }
      }
      all_spools.map((spool) => {
        shops_list.map((shop) => {
          addDormantObject(
            spool.shop,
            shop,
            dormant.shops[shop].total,
            dormant.shops[shop].spools
          )
        })
      })
    }
    console.log(dormant)
    // dispatch({
    //   type: UPDATE_DORMANT,
    //   payload: { dormant: dormant },
    // })
  } catch {
    dispatch({
      type: JOBS_ERROR,
      payload: { msg: 'Error' },
    })
  }
}
