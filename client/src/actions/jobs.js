import axios from 'axios'
import moment from 'moment'
import {
  UPDATE_JOBS,
  JOBS_ERROR,
  SET_JOBS_LOADING,
  UPDATE_DORMANT,
} from './types'

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

// UPDATE THE LINE LIST AND STORE IN STATE
const updateOneJob = (jobnum) => async (dispatch) => {
  // TO CHECK IF SPOOL ALREADY EXISTS
  let spools_list = []
  let areas_list = []
  let materials_list = []
  let client = undefined

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
        all_spools.push({
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
        all_spools.map((spool) => {
          if (spool.spool === line.split(',')[spool_col]) {
            spool.multiplier += 1
          }
          return all_spools
        })
      }
      return all_spools
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
      all_spools.map((each) => {
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

        return all_spools
      })
      return all_spools
    }
    return lines
  })

  // SET UP DORMANT OBJECT
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

  let shop_list = []
  let material_list = []

  // ADD JOB OBJECT TO DORMANT JOBS
  dormant.jobs.push({
    number: jobnum,
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

  all_spools.map((spool) => {
    if (spool.rtsc !== '' || spool.rtsc !== undefined) {
    }

    // ADD SHOP OBJECT TO DORMANT JOBS
    if (shop_list.includes(spool.shop) === false) {
      shop_list.push(spool.shop)
      console.log(shop_list)
      dormant.shops.push({
        shop: spool.shop,
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

    // ADD MATERIAL OBJECT TO DORMANT JOBS
    if (material_list.includes(spool.material) === false) {
      material_list.push(spool.material)
      dormant.materials.push({
        material: spool.material,
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

  // OVERALL TOTALS
  all_spools.map((spool) => {
    console.log(spool.lifespan)
    let totalAndSpools = (phase) => {
      if (spool[phase] !== undefined) {
        dormant.overall[phase].total += spool[phase]
        dormant.overall[phase].spools += 1
        // ADD OVERALL TOTALS FOR JOB
        dormant.jobs.map((each) => {
          if (each.number === job.number) {
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
        each[phase].avg = (each[phase].total / each[phase].spools).toFixed(0)
      }
      return each
    })
    // ADD OVERALL AVERAGES FOR SHOPS
    dormant.shops.map((each) => {
      if (each[phase].spools !== 0) {
        each[phase].avg = (each[phase].total / each[phase].spools).toFixed(0)
      }
      return each
    })
    // ADD OVERALL AVERAGES FOR MATERIALS
    dormant.materials.map((each) => {
      if (each[phase].spools !== 0) {
        each[phase].avg = (each[phase].total / each[phase].spools).toFixed(0)
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
}

export const updateDormant = (jobnums) => async (dispatch) => {
  try {
    jobnums.map((num) => {
      dispatch(updateOneJob(num))
    })
    dispatch({
      type: UPDATE_DORMANT,
      payload: { all_spools: all_spools, dormant: dormant },
    })
  } catch {
    dispatch({
      type: JOBS_ERROR,
      payload: { msg: 'Error' },
    })
  }
}
