import axios from 'axios'
import moment from 'moment'
import {
  JOBS_ERROR,
  SET_JOBS_LOADING,
  UPDATE_JOB_SPOOLS,
  UPDATE_DORMANT,
  GET_ITEMS,
} from './types'

let countupdates = 0
let all_spools = []
let all_materials_list = []
let all_shops_list = []
let all_jobnums_list = []
let all_priorities_list = []
let all_statuses_list = []

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
      } else if (
        header.toUpperCase() === 'SHOP' ||
        header === 'Fab. Location'
      ) {
        shop_col = count
      } else if (header.toUpperCase() === 'HOLD' || header === 'HOLD Status') {
        on_hold_col = count
      }
      count += 1
      return headers
    })

    if (piecemark_col === undefined)
      alert(
        'Error on ' +
          jobnum +
          ' linelist! Spool Id header should be titled "Spool ID".'
      )
    if (material_col === undefined)
      alert(
        'Error on ' +
          jobnum +
          ' linelist! Material header should be titled "Material".'
      )
    if (issued_col === undefined)
      alert(
        'Error on ' +
          jobnum +
          ' linelist! Issued header should be titled "Status".'
      )
    if (spool_col === undefined)
      alert(
        'Error on ' +
          jobnum +
          ' linelist! Spool/sketch header should be titled SPOOL.'
      )
    if (priority_group_col === undefined)
      alert(
        'Error on ' +
          jobnum +
          ' linelist! Priority Group header should be titled "Priority Group".'
      )
    if (priority_col === undefined)
      alert(
        'Error on ' +
          jobnum +
          ' linelist! Priority header should be titled "Individual Priority".'
      )
    if (area_col === undefined)
      alert(
        'Error on ' + jobnum + ' linelist! Area header should be titled "Area".'
      )
    if (iso_col === undefined)
      alert(
        'Error on ' + jobnum + ' linelist! Iso header should be titled "Iso".'
      )
    if (detailing_col === undefined)
      alert(
        'Error on ' +
          jobnum +
          ' linelist! Detailing header should be titled "Detailing".'
      )
    if (checking_col === undefined)
      alert(
        'Error on ' + jobnum + ' linelist! header should be titled "Checking".'
      )
    if (shop_col === undefined)
      alert(
        'Error on ' + jobnum + ' linelist! Shop header should be titled "Shop".'
      )
    if (on_hold_col === undefined)
      alert(
        'Error on ' +
          jobnum +
          ' linelist! On hold header should be titled "HOLD".'
      )

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
            totalitems: 0,
            totalpipe: 0,
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
    // SET ALERTS FOR MISNAMED COLUMNS
    if (sr_piecemark_col === undefined)
      alert(
        'Error on ' +
          jobnum +
          ' status report! Piecemark header should be titled "PIECEMARK".'
      )
    if (pulled_col === undefined)
      alert(
        'Error on ' +
          jobnum +
          ' status report! Piecemark header should be titled "DATE PULL".'
      )
    if (weldout_col === undefined)
      alert(
        'Error on ' +
          jobnum +
          ' status report! Piecemark header should be titled "WELD OUT".'
      )
    if (rts_col === undefined)
      alert(
        'Error on ' +
          jobnum +
          ' status report! Piecemark header should be titled "READY TO SHIP".'
      )
    if (rtsc_col === undefined)
      alert(
        'Error on ' +
          jobnum +
          ' status report! Piecemark header should be titled "READY TO SHIP COATING".'
      )
    if (stc_col === undefined)
      alert(
        'Error on ' +
          jobnum +
          ' status report! Piecemark header should be titled "SHIP TO COATING".'
      )
    if (delivered_col === undefined)
      alert(
        'Error on ' +
          jobnum +
          ' status report! Piecemark header should be titled "TO SITE".'
      )
    if (sr_on_hold_col === undefined)
      alert(
        'Error on ' +
          jobnum +
          ' status report! Piecemark header should be titled "ON HOLD".'
      )

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

    // IF LAST JOB IN JOBS
    if (countupdates === jobnums.length) {
      dispatch({
        type: UPDATE_JOB_SPOOLS,
        payload: { all_spools: all_spools },
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

        if (spool.delivered !== undefined && spool.delivered !== '') {
          spool.status = 'Delivered'
        } else if (spool.rts !== undefined && spool.rts !== '') {
          spool.status = 'Ready to Ship'
        } else if (spool.stc !== undefined && spool.stc !== '') {
          spool.status = 'Shipped to Coating'
        } else if (spool.rtsc !== undefined && spool.rtsc !== '') {
          spool.status = 'Ready to Ship to Coating'
        } else if (spool.weldout !== undefined && spool.weldout !== '') {
          spool.status = 'Welded Out'
        } else if (spool.pulled !== undefined && spool.pulled !== '') {
          spool.status = 'Pulled'
        } else if (spool.issued !== undefined && spool.issued !== '') {
          spool.status = 'Issued'
        } else if (spool.workable === true) {
          spool.status = 'Workable'
        } else {
          spool.status = 'Not Workable'
        }

        // ADD TO 'ALL' LISTS
        if (all_materials_list.includes(spool.material) === false) {
          all_materials_list.push(spool.material)
        }
        if (all_shops_list.includes(spool.shop) === false) {
          all_shops_list.push(spool.shop)
        }
        if (all_jobnums_list.includes(spool.jobnum) === false) {
          all_jobnums_list.push(spool.jobnum)
        }
        if (all_priorities_list.includes(spool.priority) === false) {
          all_priorities_list.push(spool.priority)
        }
        if (all_statuses_list.includes(spool.status) === false) {
          all_statuses_list.push(spool.status)
        }

        // CREATE FORMULA TO CALCULATE THE NUMBER OF DAYS BETWEEN TWO PHASES
        let findDays = (start, finish, phase, coating) => {
          if (coating === true) {
            if (
              start !== '' &&
              finish !== '' &&
              spool.stc !== '' &&
              start !== undefined &&
              finish !== undefined &&
              spool.stc !== undefined
            ) {
              let lf = moment(finish).diff(moment(start), 'days')
              if (lf > -1 && lf < 1000) {
                spool[phase] = moment(finish).diff(moment(start), 'days')
              }
            }
          } else if (coating === false) {
            if (
              start !== '' &&
              finish !== '' &&
              start !== undefined &&
              finish !== undefined &&
              (spool.stc === undefined || spool.stc === '')
            ) {
              let lf = moment(finish).diff(moment(start), 'days')
              if (lf > -1 && lf < 1000) {
                spool[phase] = moment(finish).diff(moment(start), 'days')
              }
            }
          } else {
            if (
              start !== '' &&
              finish !== '' &&
              start !== undefined &&
              finish !== undefined
            ) {
              let lf = moment(finish).diff(moment(start), 'days')
              if (lf > -1 && lf < 1000) {
                spool[phase] = moment(finish).diff(moment(start), 'days')
              }
            }
          }
        }

        findDays(spool.issued, spool.delivered, 'lifespan')
        findDays(spool.issued, spool.pulled, 'i_p')
        findDays(spool.pulled, spool.weldout, 'p_w')
        findDays(spool.weldout, spool.rtsc, 'w_rtsc')
        findDays(spool.rtsc, spool.stc, 'rtsc_stc')
        findDays(spool.weldout, spool.stc, 'w_stc')
        findDays(spool.stc, spool.rts, 'stc_rts')
        findDays(spool.rts, spool.delivered, 'rts_d_p', true)
        findDays(spool.weldout, spool.delivered, 'w_d_p', true)
        findDays(spool.weldout, spool.rts, 'w_rts', false)
        findDays(spool.rts, spool.delivered, 'rts_d_np', false)
        findDays(spool.weldout, spool.delivered, 'w_d_np', false)
        return spool
      })

      // ADD SHOPS, JOBS AND MATERIALS TO DORMANT OBJECT
      shops_list.map((shop) => {
        if (shop !== '') {
          dormant.shops.push({
            shop: shop,
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
          })
        }
        return shop
      })

      jobnums_list.map((jobnum) => {
        dormant.jobs.push({
          jobnum: jobnum,
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
        })
        return jobnum
      })

      materials_list.map((material) => {
        dormant.materials.push({
          material: material,
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
        })
        return material
      })

      // ADD UP TOTALS AND SPOOLS FOR DORMANT OBJECTS
      // OVERALL TOTALS
      all_spools.map((spool) => {
        let totalAndSpools = (phase) => {
          if (spool[phase] !== undefined) {
            dormant.overall[phase].total += spool[phase]
            dormant.overall[phase].spools += 1
            // ADD OVERALL TOTALS FOR JOB
            dormant.jobs.map((each) => {
              if (spool.jobnum === each.jobnum) {
                each[phase].total += spool[phase]
                each[phase].spools += 1
              }
              return each
            })
            // ADD OVERALL TOTALS FOR SHOPS
            dormant.shops.map((each) => {
              if (each.shop === spool.shop) {
                each[phase].total += spool[phase]
                each[phase].spools += 1
              }
              return each
            })
            // ADD OVERALL TOTALS FOR MATERIALS
            dormant.materials.map((each) => {
              if (each.material === spool.material) {
                each[phase].total += spool[phase]
                each[phase].spools += 1
              }
              return each
            })
          }
        }
        totalAndSpools('lifespan')
        totalAndSpools('i_p')
        totalAndSpools('p_w')
        totalAndSpools('w_rtsc')
        totalAndSpools('rtsc_stc')
        totalAndSpools('w_stc')
        totalAndSpools('stc_rts')
        totalAndSpools('rts_d_p')
        totalAndSpools('w_d_p')
        totalAndSpools('w_rts')
        totalAndSpools('rts_d_np')
        totalAndSpools('w_d_np')

        return spool
      })

      // USE TOTALS AND SPOOLS TO FIND AVERAGES FOR DORMANT OBJECTS
      // OVERALL AVERAGES
      let findAvg = (phase) => {
        if (dormant.overall[phase].spools !== 0) {
          dormant.overall[phase].avg = (
            dormant.overall[phase].total / dormant.overall[phase].spools
          ).toFixed(0)
        }
        // ADD OVERALL AVERAGES FOR JOB
        dormant.jobs.map((each) => {
          if (each[phase].spools !== 0) {
            each[phase].avg = (each[phase].total / each[phase].spools).toFixed(
              0
            )
          }
          return each
        })
        // ADD OVERALL AVERAGES FOR SHOPS
        dormant.shops.map((each) => {
          if (each[phase].spools !== 0) {
            each[phase].avg = (each[phase].total / each[phase].spools).toFixed(
              0
            )
          }
          return each
        })
        // ADD OVERALL AVERAGES FOR MATERIALS
        dormant.materials.map((each) => {
          if (each[phase].spools !== 0) {
            each[phase].avg = (each[phase].total / each[phase].spools).toFixed(
              0
            )
          }
          return each
        })
      }

      findAvg('lifespan')
      findAvg('i_p')
      findAvg('p_w')
      findAvg('w_rtsc')
      findAvg('rtsc_stc')
      findAvg('w_stc')
      findAvg('stc_rts')
      findAvg('rts_d_p')
      findAvg('w_d_p')
      findAvg('w_rts')
      findAvg('rts_d_np')
      findAvg('w_d_np')

      dispatch({
        type: UPDATE_DORMANT,
        payload: {
          dormant: dormant,
          all_shops: all_shops_list,
          all_jobnums: all_jobnums_list,
          all_materials: all_materials_list,
          all_priorities: all_priorities_list,
          all_statuses: all_statuses_list,
        },
      })
    }
  } catch {
    dispatch({
      type: JOBS_ERROR,
      payload: { msg: 'Error' },
    })
  }
}

// SET LOADING TO TRUE
export const getItems = (spool) => async (dispatch) => {
  try {
    /////  //////
    //  // //
    /////  /////
    //  // //
    /////  //////

    // GRAB BOM CSV
    const res_be = await axios.get('/api/csvs/bom_export/' + spool.jobnum)
    let bom_export_csv = res_be.data

    // FIND HEADERS FROM BOM CSV
    let lines = bom_export_csv.split('\n')
    let header = lines.filter((line) => line.includes('BOM PATH'))[0]
    let headers = header.split(',')

    // FIND FIRST ROW OF SPOOLS
    let count = 1
    let first_row = undefined
    lines.map((line) => {
      count += 1
      if (line.includes('BOM PATH')) {
        first_row = count
      }
      return lines
    })

    // ASSIGN COLUMN NUMBER TO EACH HEADER
    let be_bom_path_col = undefined
    // let be_piecemark_col = undefined
    let be_tag_col = undefined
    let be_position_col = undefined
    let be_item_col = undefined
    let be_quantity_col = undefined
    let be_unit_col = undefined

    count = 0

    headers.map((header) => {
      if (header === '﻿BOM PATH' || header === 'BOM PATH') {
        be_bom_path_col = count
        // } else if (header === ' SKETCH') {
        //   be_piecemark_col = count
      } else if (header === ' TAG NUMBER') {
        be_tag_col = count
      } else if (header === ' POS') {
        be_position_col = count
      } else if (header === ' GROUP-PERF') {
        be_item_col = count
      } else if (header === ' LIST QUANTITY') {
        be_quantity_col = count
      } else if (header === ' UNIT') {
        be_unit_col = count
      }
      count += 1
      return header
    })

    // ADD INFORMATION FROM BOM EXPORT TO JOB
    count = lines.map((line) => {
      count += 1
      if (
        line.split(',')[be_bom_path_col] !== '' &&
        line.split(',')[be_bom_path_col] !== undefined &&
        count >= first_row
      ) {
        if (
          line.split(',')[be_bom_path_col].split('/').slice(-1)[0] ===
          spool.spool
        ) {
          spool.items.push({
            tag: line.split(',')[be_tag_col],
            item: line.split(',')[be_item_col],
            quantity: line.split(',')[be_quantity_col],
            unit: line.split(',')[be_unit_col],
            pos: line.split(',')[be_position_col],
            status: 'Complete',
          })
        }
      }
      return line
    })

    // ////// //////
    // //     //
    // ////// //
    // //     //
    // //     //////

    // GRAB FORECAST CSV
    const res_fc = await axios.get('/api/csvs/forecast/' + spool.jobnum)
    let forecast_csv = res_fc.data

    // FIND HEADERS FROM FORECAST CSV
    lines = forecast_csv.split('\n')
    header = lines.filter((line) => line.includes('BOM PATH'))[0]
    headers = header.split(',')

    // FIND FIRST ROW OF SPOOLS
    count = 1
    first_row = undefined
    lines.map((line) => {
      count += 1
      if (line.includes('BOM PATH')) {
        first_row = count
      }
      return lines
    })

    // ASSIGN COLUMN NUMBER TO EACH HEADER
    let bom_path_col = undefined
    let tag_col = undefined
    let position_col = undefined
    let item_col = undefined
    let quantity_col = undefined
    let status_col = undefined
    let po_col = undefined
    let perc_comp_col = undefined
    let unit_col = undefined

    count = 0

    headers.map((header) => {
      if (header === 'BOM PATH') {
        bom_path_col = count
      } else if (header === ' TAG NUMBER') {
        tag_col = count
      } else if (header === ' POS') {
        position_col = count
      } else if (header === ' GROUP-PERF') {
        item_col = count
      } else if (header === ' LIST QUANTITY') {
        quantity_col = count
      } else if (header === ' STATUS' && count > 4) {
        status_col = count
      } else if (header === ' PO NUMBER') {
        po_col = count
      } else if (header === 'PERCENTAGE COMPLETE') {
        perc_comp_col = count
      } else if (header === ' UNIT') {
        unit_col = count
      }
      count += 1
      return headers
    })

    // ADD INFORMATION FROM FORECAST TO JOB
    count = 0
    lines.map((line) => {
      count += 1
      if (
        line.split(',')[bom_path_col] !== '' &&
        line.split(',')[bom_path_col] !== undefined &&
        count >= first_row
      ) {
        // FIND SPOOL BY MATCHING BOM PATH TO SPOOL NAME
        if (
          line.split(',')[bom_path_col].split('/').slice(-1)[0] === spool.spool
        ) {
          // IF ALL ITEMS ON FORECAST ARE COMPLETE, MARK SPOOL AS WORKABLE
          if (
            line.split(',')[perc_comp_col].split('/').slice(-1)[0] === '100%'
          ) {
            spool.workable = true
          }
          // ITERATE THROUGH ITEMS AND ADD INFO
          let in_items = false
          spool.items.map((item) => {
            if (item.pos === line.split(',')[position_col]) {
              item.status = line.split(',')[status_col]
              item.po = line.split(',')[po_col]
              in_items = true
            }
            return item
          })
          // IF ITEM NOT IN ITEMS ALREADY, ADD IT
          if (in_items === false) {
            spool.items.push({
              tag: line.split(',')[tag_col],
              item: line.split(',')[item_col],
              quantity: line.split(',')[quantity_col],
              unit: line.split(',')[unit_col],
              pos: line.split(',')[position_col],
              po: line.split(',')[po_col],
              status: line.split(',')[status_col],
            })
          }
        }
      }
      return line
    })

    // ADD UP QUANTITY OF COMPONENTS
    spool.items.map((item) => {
      if (item.item.includes('PIPE')) {
        spool.totalpipe += parseFloat(item.quantity)
      } else {
        spool.totalitems += parseInt(item.quantity)
      }
      return item
    })

    dispatch({
      type: GET_ITEMS,
      payload: spool,
    })
  } catch {
    dispatch({
      type: JOBS_ERROR,
      payload: { msg: 'Error' },
    })
  }
}
