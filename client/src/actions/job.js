import axios from 'axios'
import moment from 'moment'
import { UPDATE_JOB, JOB_ERROR, SET_JOB_LOADING, SET_JOB } from './types'

// SET LOADING TO TRUE
export const setJobLoading = () => async (dispatch) => {
  dispatch({
    type: SET_JOB_LOADING,
  })
}

// UPDATE THE LINE LIST AND STORE IN STATE
export const updateJob = (jobnum) => async (dispatch) => {
  try {
    // CREATE LINE LIST OBJECT
    let job = {
      number: jobnum,
      spools: [],
      areas: [],
      materials: [],
      priorities: [],
      missing: [],
      discrepancies: [],
      workable_not_issued: 0,
      missingspools: {
        valves: { p: 0, c: 0, o: 0 },
        fittings: { p: 0, c: 0, o: 0 },
        flanges: { p: 0, c: 0, o: 0 },
        supports: { p: 0, c: 0, o: 0 },
        pipe: { p: 0, c: 0, o: 0 },
      },
    }

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

    // TO CHECK IF SPOOL ALREADY EXISTS
    let spools_list = []
    let areas_list = []
    let materials_list = []

    //     //
    //     //
    //     //
    //     //
    ////// //////

    // GRAB LINELIST CSV
    const res = await axios.get('/api/csvs/linelist/' + jobnum)
    let linelist_csv = res.data

    // FIND HEADERS FROM LINELIST CSV
    let lines = linelist_csv.split('\n')
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
        job.client = line.split(',')[1]
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
      if (header.toUpperCase() === 'SPOOL ID' || header === 'Spool Tag') {
        piecemark_col = count
      } else if (header === 'Material') {
        material_col = count
      } else if (header === 'Status' || header === 'Date Issued') {
        issued_col = count
      } else if (header.toUpperCase() === 'SPOOL' || header === 'Sketch No.') {
        spool_col = count
      } else if (header === 'Priority Group') {
        priority_group_col = count
      } else if (header === 'Priority #' || header === 'Individual Priority') {
        priority_col = count
      } else if (header.toUpperCase() === 'AREA') {
        area_col = count
      } else if (header.toUpperCase() === 'ISO' || header === 'Iso No.') {
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
    // CHECK FOR ERRORS ON COLUMN HEADERS
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

    // ADD SPOOLS FROM LINELIST TO JOB
    count = 0
    lines.map((line) => {
      count += 1
      if (
        line.split(',')[spool_col] !== '' &&
        line.split(',')[spool_col] !== undefined &&
        count >= first_row
      ) {
        if (spools_list.includes(line.split(',')[spool_col]) === false) {
          job.spools.push({
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
            jobnum: jobnum,
            client: job.client,
            status: 'Not Workable',
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
          job.spools.map((spool) => {
            if (spool.spool === line.split(',')[spool_col]) {
              spool.multiplier += 1
            }
            return job
          })
        }
        return job
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
    // CHECK FOR ERRORS ON COLUMN HEADERS
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
    let sr_pms = []
    let ll_pms = []
    let ll_spools = []

    lines.map((line) => {
      count += 1
      if (
        line.split(',')[sr_piecemark_col] !== '' &&
        line.split(',')[sr_piecemark_col] !== undefined &&
        count >= first_row
      ) {
        sr_pms.push({
          piecemark: line.split(',')[sr_piecemark_col],
          pulled: line.split(',')[pulled_col],
          weldout: line.split(',')[weldout_col],
          rts: line.split(',')[rts_col],
          rtsc: line.split(',')[rtsc_col],
          stc: line.split(',')[stc_col],
          delivered: line.split(',')[delivered_col],
          on_hold: line.split(',')[sr_on_hold_col],
        })
      }
      return line
    })

    // COMPARE SPOOLS
    job.spools.map((spool) => {
      sr_pms.map((pm) => {
        if (spool.piecemark === pm.piecemark) {
          spool.pulled = pm.pulled
          spool.weldout = pm.weldout
          spool.rts = pm.rts
          spool.rtsc = pm.rtsc
          spool.stc = pm.stc
          spool.delivered = pm.delivered
          spool.on_hold = pm.on_hold
        }
      })
    })

    // ADD DISCREPANCIES
    sr_pms.map((pm) => {
      if (ll_pms.includes(pm.piecemark) === false) {
        job.discrepancies.push({
          piecemark: pm.piecemark,
          spool: undefined,
          job: jobnum,
          type: 'sr_not_ll',
        })
      }
      return pm
    })

    /////  //////
    //  // //
    /////  /////
    //  // //
    /////  //////

    // GRAB BOM CSV
    const res_be = await axios.get('/api/csvs/bom_export/' + jobnum)
    let bom_export_csv = res_be.data

    // FIND HEADERS FROM BOM CSV
    lines = bom_export_csv.split('\n')
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
      return headers
    })

    // ADD INFORMATION FROM BOM EXPORT TO JOB
    count = lines.map((line) => {
      count += 1
      if (
        line.split(',')[be_bom_path_col] !== '' &&
        line.split(',')[be_bom_path_col] !== undefined &&
        count >= first_row
      ) {
        job.spools.map((spool) => {
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
          return job
        })
        return job
      }
      return lines
    })

    // ////// //////
    // //     //
    // ////// //
    // //     //
    // //     //////

    // GRAB FORECAST CSV
    const res_fc = await axios.get('/api/csvs/forecast/' + jobnum)
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
    let fc_spools = []
    lines.map((line) => {
      count += 1
      if (
        line.split(',')[bom_path_col] !== '' &&
        line.split(',')[bom_path_col] !== undefined &&
        count >= first_row
      ) {
        fc_spools.push(line.split(',')[bom_path_col].split('/').slice(-1)[0])
        job.spools.map((spool) => {
          // FIND SPOOL BY MATCHING BOM PATH TO SPOOL NAME
          if (
            line.split(',')[bom_path_col].split('/').slice(-1)[0] ===
            spool.spool
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
          return job
        })
        return job
      }
      return lines
    })

    // FORECAST DISCREPANCIES
    job.spools.map((spool) => {
      if (fc_spools.includes(spool.spool)) {
        if (spool.issued !== undefined && spool.issued !== '') {
          job.discrepancies.push({
            spool: spool.spool,
            piecemark: spool.piecemark,
            jobnum: spool.jobnum,
            type: 'fc_iss',
          })
        }
      } else {
        if (spool.issued === undefined && spool.issued === '') {
          job.discrepancies.push({
            spool: spool.spool,
            piecemark: spool.piecemark,
            jobnum: spool.jobnum,
            type: 'notfc_notiss',
          })
        }
      }
      return spool
    })

    fc_spools.map((spool) => {
      if (ll_spools.includes(spool === false)) {
        job.discrepancies.push({
          spool: spool.spool,
          piecemark: spool.piecemark,
          jobnum: spool.jobnum,
          type: 'fc_not_ll',
        })
      }
      return spool
    })

    // ADDITIONAL CALCULATIONS
    job.total = 0
    job.issued = 0
    job.workable = 0
    job.on_hold = 0
    job.weldout = 0
    job.stc = 0
    job.delivered = 0

    job.spools.map((each) => {
      // TOTAL SPOOLS
      job.total += each.multiplier
      // TOTAL WORKABLE
      if (each.workable) {
        job.workable += each.multiplier
        each.status = 'Workable'
      }
      // TOTAL ISSUED
      if (each.issued !== '' && each.issued !== undefined) {
        job.issued += each.multiplier
        each.status = 'Issued'
      }
      // TOTAL WELDED OUT
      if (each.weldout !== '' && each.weldout !== undefined) {
        job.weldout += each.multiplier
        each.status = 'Welded Out'
      }
      // READY TO SHIP TO COATING
      if (each.rtsc !== '' && each.rtsc !== undefined) {
        each.status = 'Ready to Ship to Coating'
      }
      // TOTAL STC
      if (each.stc !== '' && each.stc !== undefined) {
        job.stc += each.multiplier
        each.status = 'Shipped to Coating'
      }
      // READY TO DELIVER
      if (each.rts !== '' && each.rtsc !== undefined) {
        each.status = 'Ready to Deliver'
      }
      // TOTAL DELIVERED
      if (each.delivered !== '' && each.delivered !== undefined) {
        job.delivered += each.multiplier
        each.status = 'Delivered'
      }
      // TOTAL ON HOLD
      if (each.on_hold !== '' && each.on_hold !== undefined) {
        job.on_hold += each.multiplier
        each.status = 'On Hold'
      }
      // AREAS
      if (areas_list.includes(each.area) === false) {
        areas_list.push(each.area)
        job.areas.push({
          area: each.area,
          priority: each.priority,
          spools: 0,
          on_hold: 0,
          workable: 0,
          weldout: 0,
          stc: 0,
          delivered: 0,
        })
      }
      //MATERIALS
      if (materials_list.includes(each.material) === false) {
        materials_list.push(each.material)
        job.materials.push({
          material: each.material,
          areas_list: [],
          areas: [],
          total: 0,
          issued: 0,
          workable: 0,
          on_hold: 0,
          weldout: 0,
          stc: 0,
          delivered: 0,
        })
      }

      // PRIORITIES
      if (job.priorities.includes(each.priority) === false) {
        job.priorities.push(each.priority)
      }
      return each
    })

    // ADD AREAS TO MATERIALS
    job.materials.map((material) => {
      job.spools.map((spool) => {
        if (
          spool.material === material.material &&
          material.areas_list.includes(spool.area) === false
        ) {
          material.areas_list.push(spool.area)
          material.areas.push({
            area: spool.area,
            priority: spool.priority,
            spools: 0,
            on_hold: 0,
            workable: 0,
            weldout: 0,
            stc: 0,
            delivered: 0,
          })
        }
        return spool
      })
      return material
    })

    //ADD INFO TO AREAS
    job.areas.map((area) => {
      job.spools.map((spool) => {
        // FIND SPOOLS WITH CERTAIN AREA
        if (spool.area === area.area) {
          // TOTAL SPOOLS
          area.spools += spool.multiplier
          // TOTAL ON HOLD
          if (spool.on_hold !== '' && spool.on_hold !== undefined) {
            area.on_hold += spool.multiplier
          }
          // WORKABLE
          if (spool.workable) {
            area.workable += spool.multiplier
          }
          // TOTAL SHIPPED TO PAINT
          if (spool.stc !== '' && spool.stc !== undefined) {
            area.stc += spool.multiplier
          }
          // TOTAL WELDED OUT
          if (spool.weldout !== '' && spool.weldout !== undefined) {
            area.weldout += spool.multiplier
          }
          // TOTAL DELIVERED
          if (spool.delivered !== '' && spool.delivered !== undefined) {
            area.delivered += spool.multiplier
          }
        }
        return spool
      })
      // ASSIGN OTHER AREA VALUES
      area.not_workable = area.spools - area.workable
      area.not_delivered = area.spools - area.delivered
      area.not_weldout = area.spools - area.weldout
      // WORKABLE PERCENTAGE
      if (area.workable / area.spools === 1) {
        area.workable_perc = (area.workable / area.spools) * 100
      } else {
        area.workable_perc = ((area.workable / area.spools) * 100).toFixed(2)
      }
      // WELDOUT PERCENTAGE
      if (area.weldout / area.spools === 1) {
        area.weldout_perc = (area.weldout / area.spools) * 100
      } else {
        area.weldout_perc = ((area.weldout / area.spools) * 100).toFixed(2)
      }
      // DELIVERED PERCENTAGE
      if (area.delivered / area.spools === 1) {
        area.delivered_perc = (area.delivered / area.spools) * 100
      } else {
        area.delivered_perc = ((area.delivered / area.spools) * 100).toFixed(2)
      }
      return area
    })

    //ADD INFO TO AREAS FOR EACH MATERIAL
    job.materials.map((material) => {
      material.areas.map((area) => {
        let newspools = job.spools.filter(
          (spool) => spool.material === material.material
        )
        newspools.map((spool) => {
          // FIND SPOOLS WITH CERTAIN AREA
          if (spool.area === area.area) {
            // TOTAL SPOOLS
            area.spools += spool.multiplier
            material.total += spool.multiplier
            // TOTAL ON HOLD
            if (spool.on_hold !== '' && spool.on_hold !== undefined) {
              area.on_hold += spool.multiplier
              material.on_hold += spool.multiplier
              // TOTAL ON HOLD
            }
            // WORKABLE
            if (spool.workable) {
              area.workable += spool.multiplier
              material.workable += spool.multiplier
            }
            // TOTAL SHIPPED TO PAINT
            if (spool.stc !== '' && spool.stc !== undefined) {
              area.stc += spool.multiplier
              material.stc += spool.multiplier
            }
            // TOTAL WELDED OUT
            if (spool.weldout !== '' && spool.weldout !== undefined) {
              area.weldout += spool.multiplier
              material.weldout += spool.multiplier
            }
            // TOTAL DELIVERED
            if (spool.delivered !== '' && spool.delivered !== undefined) {
              area.delivered += spool.multiplier
              material.delivered += spool.multiplier
            }
          }
          return spool
        })
        // ASSIGN OTHER AREA VALUES
        area.not_workable = area.spools - area.workable
        area.not_delivered = area.spools - area.delivered
        area.not_weldout = area.spools - area.weldout
        // WORKABLE PERCENTAGE
        if (area.workable / area.spools === 1) {
          area.workable_perc = (area.workable / area.spools) * 100
        } else {
          area.workable_perc = ((area.workable / area.spools) * 100).toFixed(2)
        }
        // WELDOUT PERCENTAGE
        if (area.weldout / area.spools === 1) {
          area.weldout_perc = (area.weldout / area.spools) * 100
        } else {
          area.weldout_perc = ((area.weldout / area.spools) * 100).toFixed(2)
        }
        // DELIVERED PERCENTAGE
        if (area.delivered / area.spools === 1) {
          area.delivered_perc = (area.delivered / area.spools) * 100
        } else {
          area.delivered_perc = ((area.delivered / area.spools) * 100).toFixed(
            2
          )
        }
        return area
      })
      return material
    })

    // SORT BY NAME
    try {
      job.areas.sort(function (a, b) {
        return a.priority - b.priority
      })
    } catch {
      job.areas.sort(function (a, b) {
        var nameA = a.priority.toUpperCase() // ignore upper and lowercase
        var nameB = b.priority.toUpperCase() // ignore upper and lowercase

        if (nameA < nameB) {
          return -1
        } else if (nameA > nameB) {
          return 1
        } else return 0
      })
    }

    // FIND SHORTS
    // FORMULA FOR SHORTS
    let assignShort = (groupperf, item, spool) => {
      let missingitem = undefined
      if (groupperf.includes(item.item) && item.status === 'Purchased') {
        missingitem = groupperf + '-Purchased'
      }
      if (groupperf.includes(item.item) && item.status === 'No Material') {
        missingitem = groupperf + '-No Material'
      }
      // SET SCOPE
      // 6951
      if (job.number === '6951') {
        if (spool.material === 'Chrome') {
          item.scope = 'Client'
          missingitem = 'Client' + missingitem
        } else {
          item.scope = 'Performance'
          missingitem = 'Performance-' + missingitem
        }
      }
      if (!missingitem.includes('undefined')) {
        for (let i = 0; i < item.quantity; i++) {
          spool.missing.push(missingitem)
          job.missing.push(missingitem)
        }
      }
    }

    // ONLY IF INITIAL SCREEN LOAD
    job.spools.map((spool) => {
      spool.items.map((item) => {
        // IF ITEM IS A SHORT
        if (item.status !== 'Complete') {
          if ('VALVES / IN-LINE ITEMS'.includes(item.item))
            assignShort('VALVES / IN-LINE ITEMS', item, spool)
          if ('FITTINGS'.includes(item.item))
            assignShort('FITTINGS', item, spool)
          if ('FLANGES'.includes(item.item)) assignShort('FLANGES', item, spool)
          if ('SUPPORTS'.includes(item.item))
            assignShort('SUPPORTS', item, spool)
          if ('PIPE'.includes(item.item)) assignShort('PIPE', item, spool)
        }
        return item
      })
      return spool
    })

    // SET MISSING ITEMS BY SCOPE TO TRUE FOR EACH SPOOL TO BE COUNTED LATER
    job.spools.map((spool) => {
      // COUNT WORKABLE BUT NOT ISSUED
      if (spool.missing.length === 0 && spool.workable === false) {
        job.workable_not_issued += 1
      }
      let countSpools = (purchased, nomaterial) => {
        if (
          spool.missing.includes(purchased) ||
          spool.missing.includes(nomaterial)
        ) {
          // ADD TO JOB VARIABLE
          if (
            purchased.includes('Performance') &&
            purchased.includes('SUPPORT')
          ) {
            job.missingspools.supports.p += 1
          }
          if (
            purchased.includes('Performance') &&
            purchased.includes('FITTING')
          ) {
            job.missingspools.supports.p += 1
          }
          if (
            purchased.includes('Performance') &&
            purchased.includes('FLANGE')
          ) {
            job.missingspools.supports.p += 1
          }
          if (purchased.includes('Performance') && purchased.includes('PIPE')) {
            job.missingspools.supports.p += 1
          }
          if (
            purchased.includes('Performance') &&
            purchased.includes('VALVE')
          ) {
            job.missingspools.supports.p += 1
          }
          if (purchased.includes('Client') && purchased.includes('SUPPORT')) {
            job.missingspools.supports.p += 1
          }
          if (purchased.includes('Client') && purchased.includes('FITTING')) {
            job.missingspools.supports.p += 1
          }
          if (purchased.includes('Client') && purchased.includes('FLANGE')) {
            job.missingspools.supports.p += 1
          }
          if (purchased.includes('Client') && purchased.includes('PIPE')) {
            job.missingspools.supports.p += 1
          }
          if (purchased.includes('Client') && purchased.includes('VALVE')) {
            job.missingspools.supports.p += 1
          }
          if (purchased.includes('Other') && purchased.includes('SUPPORT')) {
            job.missingspools.supports.p += 1
          }
          if (purchased.includes('Other') && purchased.includes('FITTING')) {
            job.missingspools.supports.p += 1
          }
          if (purchased.includes('Other') && purchased.includes('FLANGE')) {
            job.missingspools.supports.p += 1
          }
          if (purchased.includes('Other') && purchased.includes('PIPE')) {
            job.missingspools.supports.p += 1
          }
          if (purchased.includes('Other') && purchased.includes('VALVE')) {
            job.missingspools.supports.p += 1
          }
        }
      }
      countSpools(
        'Performance-VALVES / IN-LINE ITEMS-Purchased',
        'Performance-VALVES / IN-LINE ITEMS-No Material'
      )
      countSpools(
        'Performance-FLANGES-Purchased',
        'Performance-FLANGES-No Material'
      )
      countSpools(
        'Performance-FITTINGS-Purchased',
        'Performance-FITTINGS-No Material'
      )
      countSpools(
        'Performance-SUPPORTS-Purchased',
        'Performance-SUPPORTS-No Material'
      )
      countSpools('Performance-PIPE-Purchased', 'Performance-PIPE-No Material')
      countSpools(
        'Client-VALVES / IN-LINE ITEMS-Purchased',
        'Client-VALVES / IN-LINE ITEMS-No Material'
      )
      countSpools('Client-FLANGES-Purchased', 'Client-FLANGES-No Material')
      countSpools('Client-FITTINGS-Purchased', 'Client-FITTINGS-No Material')
      countSpools('Client-SUPPORTS-Purchased', 'Client-SUPPORTS-No Material')
      countSpools('Client-PIPE-Purchased', 'Client-PIPE-No Material')
      countSpools(
        'Other-VALVES / IN-LINE ITEMS-Purchased',
        'Other-VALVES / IN-LINE ITEMS-No Material'
      )
      countSpools('Other-FLANGES-Purchased', 'Other-FLANGES-No Material')
      countSpools('Other-FITTINGS-Purchased', 'Other-FITTINGS-No Material')
      countSpools('Other-SUPPORTS-Purchased', 'Other-SUPPORTS-No Material')
      countSpools('Other-PIPE-Purchased', 'Other-PIPE-No Material')
      return spool
    })

    let shops_list = []

    // CREATE UNIQUE LISTS
    job.spools.map((spool) => {
      if (materials_list.includes(spool.material) === false) {
        materials_list.push(spool.material)
      }
      if (shops_list.includes(spool.shop) === false) {
        shops_list.push(spool.shop)
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
    job.spools.map((spool) => {
      let totalAndSpools = (phase) => {
        if (spool[phase] !== undefined) {
          dormant.overall[phase].total += spool[phase]
          dormant.overall[phase].spools += 1
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

    // DOWNLOAD JSON FILE
    let obj = { job: job, jobnum: jobnum, dormant: dormant }
    let str = JSON.stringify(obj)

    let encode = function (s) {
      let out = []
      for (let i = 0; i < s.length; i++) {
        out[i] = s.charCodeAt(i)
      }
      return new Uint8Array(out)
    }

    let data = encode(str)

    let blob = new Blob([data], {
      type: 'application/octet-stream',
    })

    let url = URL.createObjectURL(blob)
    let link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', 'data.json')
    let event = document.createEvent('MouseEvents')
    event.initMouseEvent(
      'click',
      true,
      true,
      window,
      1,
      0,
      0,
      0,
      0,
      false,
      false,
      false,
      false,
      0,
      null
    )
    link.dispatchEvent(event)

    // DISPATCH TO REDUCER
    dispatch({
      type: UPDATE_JOB,
      payload: false,
    })
  } catch (err) {
    console.log(err)
    dispatch({
      type: JOB_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status },
    })
  }
}

export const setJob = (jobnum) => async (dispatch) => {
  try {
    // GRAB JOB OBJECT
    const res = await axios.get('/api/json/import/' + jobnum)
    let job = JSON.parse(res.data)

    dispatch({
      type: SET_JOB,
      payload: { job: job.job, dormant: job.dormant, jobnum: job.jobnum },
    })
  } catch {
    dispatch({
      type: JOB_ERROR,
    })
  }
}
