import axios from 'axios'
import { JOBS_ERROR, SET_JOBS_LOADING, UPDATE_JOBS } from './types'

// SET LOADING TO TRUE
export const setJobsLoading = () => async (dispatch) => {
  dispatch({
    type: SET_JOBS_LOADING,
  })
}

//UPDATE DORMANT SPOOLS
export const updateJobs = (jobnums) => async (dispatch) => {
  try {
    let jobs = []
    let discrepancies = []

    // ADD EACH JOB TO JOBS
    for (let i = 0; i < jobnums.length; i++) {
      try {
        const res = await axios.get('/api/json/import/' + jobnums[i])
        let job = JSON.parse(res.data)
        jobs.push(job)
        console.log(jobs)
      } catch {
        console.log('No job found.')
      }
    }

    // ADD MATERIALS, SHOPS, STATUSES TO JOBS
    let all_materials = []
    let all_shops = []
    let all_priorities = []
    let all_spools = []
    jobs.map((job) => {
      job.spools.map((spool) => all_spools.push(spool))
      job.materials.map((material) => {
        if (all_materials.includes(material.material) === false) {
          all_materials.push(material.material)
        }
        return material
      })
      job.dormant.shops.map((shop) => {
        if (all_shops.includes(shop.shop) === false) {
          all_shops.push(shop.shop)
        }
        return shop
      })
      job.priorities.map((priority) => {
        if (all_priorities.includes(priority) === false) {
          all_priorities.push(priority)
        }
        return priority
      })
      return job
    })

    // DORMANT OBJECT
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

    // ADD SHOP OBJECTS TO DORMANT OBJECT
    all_shops.map((shop) => {
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
      return shop
    })
    jobs.map((job) => {
      dormant.jobs.push(job.dormant.overall)
      dormant.jobs[dormant.jobs.length - 1].jobnum = job.jobnum
      return job
    })

    // ADD MATERIAL OBJECTS TO DORMANT OBJECT
    all_materials.map((material) => {
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

    // ADD UP DORMANT OVERALLS
    jobs.map((job) => {
      dormant.overall.lifespan.total += job.dormant.overall.lifespan.total
      dormant.overall.lifespan.spools += job.dormant.overall.lifespan.spools
      dormant.overall.i_p.total += job.dormant.overall.i_p.total
      dormant.overall.i_p.spools += job.dormant.overall.i_p.spools
      dormant.overall.p_w.total += job.dormant.overall.p_w.total
      dormant.overall.p_w.spools += job.dormant.overall.p_w.spools
      dormant.overall.w_rtsc.total += job.dormant.overall.w_rtsc.total
      dormant.overall.w_rtsc.spools += job.dormant.overall.w_rtsc.spools
      dormant.overall.rtsc_stc.total += job.dormant.overall.rtsc_stc.total
      dormant.overall.rtsc_stc.spools += job.dormant.overall.rtsc_stc.spools
      dormant.overall.stc_rts.total += job.dormant.overall.stc_rts.total
      dormant.overall.stc_rts.spools += job.dormant.overall.stc_rts.spools
      dormant.overall.rts_d_p.total += job.dormant.overall.rts_d_p.total
      dormant.overall.rts_d_p.spools += job.dormant.overall.rts_d_p.spools
      dormant.overall.w_d_p.total += job.dormant.overall.w_d_p.total
      dormant.overall.w_d_p.spools += job.dormant.overall.w_d_p.spools
      dormant.overall.w_rts.total += job.dormant.overall.w_rts.total
      dormant.overall.w_rts.spools += job.dormant.overall.w_rts.spools
      dormant.overall.rts_d_p.total += job.dormant.overall.rts_d_p.total
      dormant.overall.rts_d_p.spools += job.dormant.overall.rts_d_p.spools
      dormant.overall.w_d_np.total += job.dormant.overall.w_d_np.total
      dormant.overall.w_d_np.spools += job.dormant.overall.w_d_np.spools
      dormant.overall.w_stc.total += job.dormant.overall.w_stc.total
      dormant.overall.w_stc.spools += job.dormant.overall.w_stc.spools

      job.dormant.shops.map((shop) => {
        dormant.shops.map((jobsshop) => {
          if (jobsshop.shop === shop.shop) {
            jobsshop.lifespan.total += shop.lifespan.total
            jobsshop.lifespan.spools += shop.lifespan.spools
            jobsshop.i_p.total += shop.i_p.total
            jobsshop.i_p.spools += shop.i_p.spools
            jobsshop.p_w.total += shop.p_w.total
            jobsshop.p_w.spools += shop.p_w.spools
            jobsshop.w_rtsc.total += shop.w_rtsc.total
            jobsshop.w_rtsc.spools += shop.w_rtsc.spools
            jobsshop.rtsc_stc.total += shop.rtsc_stc.total
            jobsshop.rtsc_stc.spools += shop.rtsc_stc.spools
            jobsshop.stc_rts.total += shop.stc_rts.total
            jobsshop.stc_rts.spools += shop.stc_rts.spools
            jobsshop.rts_d_p.total += shop.rts_d_p.total
            jobsshop.rts_d_p.spools += shop.rts_d_p.spools
            jobsshop.w_d_p.total += shop.w_d_p.total
            jobsshop.w_d_p.spools += shop.w_d_p.spools
            jobsshop.w_rts.total += shop.w_rts.total
            jobsshop.w_rts.spools += shop.w_rts.spools
            jobsshop.rts_d_p.total += shop.rts_d_p.total
            jobsshop.rts_d_p.spools += shop.rts_d_p.spools
            jobsshop.w_d_np.total += shop.w_d_np.total
            jobsshop.w_d_np.spools += shop.w_d_np.spools
            jobsshop.w_stc.total += shop.w_stc.total
            jobsshop.w_stc.spools += shop.w_stc.spools
          }
          return jobsshop
        })
        return shop
      })

      job.dormant.materials.map((material) => {
        dormant.materials.map((jobsmaterial) => {
          if (jobsmaterial.material === material.material) {
            jobsmaterial.lifespan.total += material.lifespan.total
            jobsmaterial.lifespan.spools += material.lifespan.spools
            jobsmaterial.i_p.total += material.i_p.total
            jobsmaterial.i_p.spools += material.i_p.spools
            jobsmaterial.p_w.total += material.p_w.total
            jobsmaterial.p_w.spools += material.p_w.spools
            jobsmaterial.w_rtsc.total += material.w_rtsc.total
            jobsmaterial.w_rtsc.spools += material.w_rtsc.spools
            jobsmaterial.rtsc_stc.total += material.rtsc_stc.total
            jobsmaterial.rtsc_stc.spools += material.rtsc_stc.spools
            jobsmaterial.stc_rts.total += material.stc_rts.total
            jobsmaterial.stc_rts.spools += material.stc_rts.spools
            jobsmaterial.rts_d_p.total += material.rts_d_p.total
            jobsmaterial.rts_d_p.spools += material.rts_d_p.spools
            jobsmaterial.w_d_p.total += material.w_d_p.total
            jobsmaterial.w_d_p.spools += material.w_d_p.spools
            jobsmaterial.w_rts.total += material.w_rts.total
            jobsmaterial.w_rts.spools += material.w_rts.spools
            jobsmaterial.rts_d_p.total += material.rts_d_p.total
            jobsmaterial.rts_d_p.spools += material.rts_d_p.spools
            jobsmaterial.w_d_np.total += material.w_d_np.total
            jobsmaterial.w_d_np.spools += material.w_d_np.spools
            jobsmaterial.w_stc.total += material.w_stc.total
            jobsmaterial.w_stc.spools += material.w_stc.spools
          }
          return jobsmaterial
        })
        return material
      })
      // DISCREPANCIES
      job.discrepancies.map((disc) => {
        discrepancies.push(disc)
        return disc
      })
      return job
    })

    // USE TOTALS AND SPOOLS TO FIND AVERAGES FOR DORMANT OBJECTS
    // OVERALL AVERAGES
    let findAvg = (phase) => {
      if (dormant.overall[phase].spools !== 0) {
        dormant.overall[phase].avg = (
          dormant.overall[phase].total / dormant.overall[phase].spools
        ).toFixed(0)
      }
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

    dispatch({
      type: UPDATE_JOBS,
      payload: {
        jobs: jobs,
        dormant: dormant,
        all_spools: all_spools,
        all_materials: all_materials,
        all_shops: all_shops,
        all_priorities: all_priorities,
        discrepancies: discrepancies,
      },
    })
  } catch {
    dispatch({
      type: JOBS_ERROR,
    })
  }
}
