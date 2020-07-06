import axios from 'axios'
import moment from 'moment'
import { UPDATE_JOBS, JOBS_ERROR, SET_JOBS_LOADING } from './types'

// SET LOADING TO TRUE
export const setJobLoading = () => async (dispatch) => {
  try {
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

    // jobs.map((job) => {
    //   // ADD JOB OBJECT TO DORMANT JOBS
    //   dormant.jobs.push({
    //     number: job.number,
    //     lifespan: { total: 0, spools: 0, avg: 0 },
    //     i_p: { total: 0, spools: 0, avg: 0 },
    //     p_w: { total: 0, spools: 0, avg: 0 },
    //     w_rtsc: { total: 0, spools: 0, avg: 0 },
    //     rtsc_stc: { total: 0, spools: 0, avg: 0 },
    //     w_stc: { total: 0, spools: 0, avg: 0 },
    //     stc_rts: { total: 0, spools: 0, avg: 0 },
    //     rts_d_p: { total: 0, spools: 0, avg: 0 },
    //     w_d_p: { total: 0, spools: 0, avg: 0 },
    //     w_rts: { total: 0, spools: 0, avg: 0 },
    //     rts_d_np: { total: 0, spools: 0, avg: 0 },
    //     w_d_np: { total: 0, spools: 0, avg: 0 },
    //   })

    job.spools.map((spool) => {
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
    job.spools.map((spool) => {
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

    // ASSIGN VARIABLES
    dispatch({
      type: UPDATE_DORMANT,
      payload: dormant,
    })
  } catch {
    dispatch({
      type: JOBS_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status },
    })
  }
}
