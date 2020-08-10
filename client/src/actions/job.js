import axios from 'axios'
import moment from 'moment'
import {
  UPDATE_JOB,
  JOB_ERROR,
  SET_JOB_LOADING,
  SET_JOB,
  DOWNLOAD_JOB,
  DOWNLOAD_JOB_LOADING,
} from './types'

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
      shorts: [],
      welds: [],
      discrepancies: {
        fc_not_ll: [],
        sr_not_ll: [],
        notfc_notiss: [],
        fc_iss: [],
      },
      status: {
        not_workable: 0,
        workable: 0,
        issued: 0,
        pulled: 0,
        weldout: 0,
        stc: 0,
        rtd: 0,
        delivered: 0,
        on_hold: 0,
      },
      workable_not_issued: 0,
      issued_missing_item: 0,
      on_hold_no_shorts: 0,
      missingspools: {
        valves: { p: 0, c: 0, o: 0 },
        fittings: { p: 0, c: 0, o: 0 },
        flanges: { p: 0, c: 0, o: 0 },
        supports: { p: 0, c: 0, o: 0 },
        pipe: { p: 0, c: 0, o: 0 },
        total: { p: 0, c: 0, o: 0 },
      },
    }

    // DORMANT OBJECT
    let dormant = {
      overall: {
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
      },
      jobs: [],
      shops: [],
      materials: [],
    }

    // TO CHECK IF SPOOL ALREADY EXISTS
    let spools_list = []
    let areas_list = []
    let materials_list = []
    let ll_pms = []

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
        line.toUpperCase().includes('ISO') &&
        line.toUpperCase().includes('IN CHECKING') &&
        line.toUpperCase().includes('IN DETAILING')
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
    // let priority_group_col = undefined
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
        // } else if (header === 'Priority Group') {
        //   priority_group_col = count
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
    // if (priority_group_col === undefined)
    //   alert(
    //     'Error on ' +
    //       jobnum +
    //       ' linelist! Priority Group header should be titled "Priority Group".'
    //   )
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
            pulled: '',
            scope: 'Other',
            // priority_group: line.split(',')[priority_group_col],
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
            shorts: [],
          })

          spools_list.push(line.split(',')[spool_col])
          ll_pms.push(line.split(',')[piecemark_col])
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
    header = lines.filter((line) =>
      line.toUpperCase().includes('PCMKIPCMAR')
    )[0]
    headers = header.split(',')

    // FIND FIRST ROW OF SPOOLS
    count = 1
    first_row = undefined
    lines.map((line) => {
      count += 1
      if (line.toUpperCase().includes('PCMKIPCMAR')) {
        first_row = count
      }
      line.split(',').map((cell) => {
        if (cell.includes('FB8')) {
        }
        return cell
      })
      return line
    })

    // ASSIGN COLUMN NUMBER TO EACH HEADER
    let sr_piecemark_col = undefined
    let pulled_col = undefined
    let weldout_col = undefined
    let rts_col = undefined
    let rtsc_col = undefined
    let stc_col = undefined
    let delivered_col = undefined
    // let sr_on_hold_col = undefined

    count = 0
    headers.map((header) => {
      if (header.toUpperCase() === 'PCMKIPCMAR') {
        sr_piecemark_col = count
      } else if (header.toUpperCase() === 'PULLTRANDA') {
        pulled_col = count
      } else if (header.toUpperCase() === 'WOUTTRANDA') {
        weldout_col = count
      } else if (header.toUpperCase() === 'SHEETSKETC') {
        spool_col = count
      } else if (header.toUpperCase() === 'RTSTRANDAT') {
        rts_col = count
      } else if (header.toUpperCase() === 'RTCTRANDAT') {
        rtsc_col = count
      } else if (header.toUpperCase() === 'STCTRANDAT') {
        stc_col = count
      } else if (header.toUpperCase() === 'SITETRANDA') {
        delivered_col = count
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
    // if (sr_on_hold_col === undefined)
    //   alert(
    //     'Error on ' +
    //       jobnum +
    //       ' status report! Piecemark header should be titled "ON HOLD".'
    //   )

    // ADD INFORMATION FROM STATUS REPORT TO JOB
    count = 0
    let sr_pms = []
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
          // on_hold: line.split(',')[sr_on_hold_col],
        })
      }
      return line
    })

    // COMPARE SPOOLS AND ADD SCOPE
    job.spools.map((spool) => {
      sr_pms.map((pm) => {
        if (
          pm.piecemark.includes(spool.piecemark + ' ') ||
          pm.piecemark === spool.piecemark
        ) {
          spool.pulled = pm.pulled
          spool.weldout = pm.weldout
          spool.rts = pm.rts
          spool.rtsc = pm.rtsc
          spool.stc = pm.stc
          spool.delivered = pm.delivered
          spool.on_hold = pm.on_hold
          spool.workable = true
        }
        return pm
      })
      return spool
    })

    // ADD DISCREPANCIES
    sr_pms.map((pm) => {
      while (pm.piecemark[pm.piecemark.length - 1] === ' ') {
        pm.piecemark = pm.piecemark.slice(0, -1)
      }
      return pm
    })

    sr_pms.map((pm) => {
      if (ll_pms.includes(pm.piecemark) === false) {
        job.discrepancies.sr_not_ll.push({
          piecemark: pm.piecemark,
          spool: undefined,
          jobnum: jobnum,
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
    let be_description_col = undefined
    let be_tag_col = undefined
    let be_position_col = undefined
    let be_item_col = undefined
    let be_quantity_col = undefined
    let be_unit_col = undefined
    let be_size_col = undefined
    count = 0

    headers.map((header) => {
      if (header === '﻿BOM PATH' || header === 'BOM PATH') {
        be_bom_path_col = count
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
      } else if (header === ' DESCRIPTION') {
        be_description_col = count
      } else if (header === ' SIZE') {
        be_size_col = count
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
        let weld_type = undefined
        job.spools.map((spool) => {
          // DECIDE WELD TYPE FOR ITEM
          if (line.split(',')[be_item_col] === 'SUPPORTS') {
            weld_type = 'NA'
          }
          if (
            line.split(',')[be_bom_path_col].split('/').slice(-1)[0] ===
            spool.spool
          ) {
            spool.items.push({
              tag: line.split(',')[be_tag_col],
              item: line.split(',')[be_item_col],
              quantity: line.split(',')[be_quantity_col],
              weld_type: weld_type,
              size: line.split(',')[be_size_col],
              description: line.split(',')[be_description_col],
              unit: line.split(',')[be_unit_col],
              pos: line.split(',')[be_position_col],
              status: 'Complete',
            })
          }
          return spool
        })
        return job
      }
      return line
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
            // REMOVE BOM ITEM IF FORECAST HAS THAT ITEM
            spool.item = spool.items.filter(
              (item) => item.pos !== line.split(',')[position_col]
            )

            // SET SCOPE
            let item_scope = 'Other'
            // 6951
            if (job.number === '6951') {
              if (spool.material === 'Chrome') {
                item_scope = 'Client'
              } else {
                item_scope = 'Performance'
              }
            }
            // 7052
            if (job.number === '7052') {
              if (line.split(',')[item_col] === 'VALVES / IN-LINE ITEMS') {
                item_scope = 'Client'
              } else {
                item_scope = 'Performance'
              }
            }

            // CREATE FORCAST ITEM
            let item = {
              client: job.client,
              jobnum: spool.jobnum,
              spool: spool.spool,
              item: line.split(',')[item_col],
              tag: line.split(',')[tag_col],
              pos: line.split(',')[position_col],
              status: line.split(',')[status_col],
              po: line.split(',')[po_col],
              scope: item_scope,
              quantity: line.split(',')[quantity_col],
              unit: line.split(',')[unit_col],
              multiplier: spool.multiplier,
            }
            // PUSH ITEM TO SPOOL
            spool.items.push(item)
            // PUSH SHORTS TO JOB
            if (item.status === 'No Material' || item.status === 'Purchased') {
              job.shorts.push(item)
              spool.shorts.push(item.item)
              spool.workable = false
            }
          }
          return job
        })
        return job
      }
      return lines
    })

    // FORECAST DISCREPANCIES AND DECIDE SCOPE
    job.spools.map((spool) => {
      // SCOPE
      spool.scope = 'Other'
      spool.shorts.map((short) => {
        if (short.scope === 'Performance' && spool.scope !== 'Client') {
          spool.scope = 'Performance'
        }
        if (short.scope === 'Client') {
          spool.scope = 'Client'
        }
      })
      if (fc_spools.includes(spool.spool)) {
        if (spool.issued !== undefined && spool.issued !== '') {
          job.discrepancies.fc_iss.push({
            spool: spool.spool,
            piecemark: spool.piecemark,
            jobnum: spool.jobnum,
            type: 'fc_iss',
          })
        }
      } else {
        if (spool.issued === undefined && spool.issued === '') {
          job.discrepancies.notfc_notiss.push({
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
        job.forecast_not_linelist.push({
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
    job.pulled = 0
    job.workable = 0
    job.on_hold = 0
    job.weldout = 0
    job.stc = 0
    job.delivered = 0

    job.spools.map((each) => {
      // TOTAL SPOOLS
      job.total += each.multiplier
      each.status = 'Not Workable'
      // TOTAL WORKABLE
      if (each.workable) {
        job.workable += each.multiplier
        each.status = 'Workable'
      }
      // TOTAL ISSUED
      if (each.issued.includes('/')) {
        job.issued += each.multiplier
        each.status = 'Issued'
      }
      // TOTAL PULLED
      if (each.pulled.includes('/')) {
        job.pulled += each.multiplier
        each.status = 'Pulled'
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
      if (
        area.workable / area.spools === 1 ||
        area.workable / area.spools === 0
      ) {
        area.workable_perc = (area.workable / area.spools) * 100
      } else {
        area.workable_perc = ((area.workable / area.spools) * 100).toFixed(1)
      }
      // WELDOUT PERCENTAGE
      if (
        area.weldout / area.spools === 1 ||
        area.weldout / area.spools === 1
      ) {
        area.weldout_perc = (area.weldout / area.spools) * 100
      } else {
        area.weldout_perc = ((area.weldout / area.spools) * 100).toFixed(1)
      }
      // DELIVERED PERCENTAGE
      if (
        area.delivered / area.spools === 1 ||
        area.delivered / area.spools === 1
      ) {
        area.delivered_perc = (area.delivered / area.spools) * 100
      } else {
        area.delivered_perc = ((area.delivered / area.spools) * 100).toFixed(1)
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
        if (
          area.workable / area.spools === 1 ||
          area.workable / area.spools === 0
        ) {
          area.workable_perc = (area.workable / area.spools) * 100
        } else {
          area.workable_perc = ((area.workable / area.spools) * 100).toFixed(1)
        }
        // WELDOUT PERCENTAGE
        if (
          area.weldout / area.spools === 1 ||
          area.weldout / area.spools === 1
        ) {
          area.weldout_perc = (area.weldout / area.spools) * 100
        } else {
          area.weldout_perc = ((area.weldout / area.spools) * 100).toFixed(1)
        }
        // DELIVERED PERCENTAGE
        if (
          area.delivered / area.spools === 1 ||
          area.delivered / area.spools === 1
        ) {
          area.delivered_perc = (area.delivered / area.spools) * 100
        } else {
          area.delivered_perc = ((area.delivered / area.spools) * 100).toFixed(
            1
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

      if (spool.status === 'Not Workable') {
        job.status.not_workable += spool.multiplier
      }
      if (spool.status === 'Workable') {
        job.status.workable += spool.multiplier
      }
      if (spool.status === 'Issued') {
        job.status.issued += spool.multiplier
      }
      if (spool.status === 'Pulled') {
        job.status.pulled += spool.multiplier
      }
      if (spool.status === 'Welded Out') {
        job.status.weldout += spool.multiplier
      }
      if (spool.status === 'Shipped to Coating') {
        job.status.stc += spool.multiplier
      }
      if (spool.status === 'Ready to Deliver') {
        job.status.rtd += spool.multiplier
      }
      if (spool.status === 'Delivered') {
        job.status.delivered += spool.multiplier
      }
      if (spool.status === 'On Hold') {
        job.status.on_hold += spool.multiplier
      }
      // TOTAL WORKABLE
      // TOTAL ISSUED
      // TOTAL WELDED OUT
      // READY TO SHIP TO COATING
      // TOTAL STC
      // READY TO DELIVER
      // TOTAL DELIVERED
      // TOTAL ON HOLD
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

    // WORKABLE BUT NOT ISSUED
    job.spools.map((spool) => {
      if (spool.workable === true && spool.issued.includes('/') === false) {
        job.workable_not_issued += spool.multiplier
      }
      // ISSUED BUT MISSING ITEM
      if (spool.issued.includes('/') && spool.shorts.length > 0) {
        job.issued_missing_item += spool.multiplier
      }
      // ON HOLD
      if (spool.status === 'On Hold' && spool.shorts.length === 0) {
        job.on_hold_no_shorts += spool.multiplier
      }
      // MISSING VALVE ONLY
      let missing_items = spool.items.filter(
        (item) => item.status !== 'Complete'
      ).length
      let missing_valves = spool.items.filter(
        (item) => item.item === 'VALVES / IN-LINE ITEMS'
      ).length
      if (missing_items > 0 && missing_items === missing_valves) {
        spool.missing_valve_only = true
      } else {
        spool.missing_valve_only = false
      }
      return spool
    })

    //    // //  //
    ///  /// //  //
    // // // //////
    //    // //  //
    //    // //  //

    // GRAB WELD DATA CSV
    const res_weld = await axios.get('/api/csvs/man_hours/' + jobnum)
    let man_hours_csv = res_weld.data

    // FIND HEADERS FROM WELD DATA CSV
    lines = man_hours_csv.split('\n')
    header = lines[0]
    headers = header.split(',')

    // ASSIGN COLUMN NUMBER TO EACH HEADER
    let pipeline_col = undefined
    let revision_col = undefined
    let weld_size_col = undefined
    let weld_no_col = undefined
    let weld_type_col = undefined
    let weld_pipe_spec_col = undefined
    let weld_spool_col = undefined
    let weld_pm_col = undefined

    count = 0
    first_row = 1

    headers.map((header) => {
      if (header === 'PIPELINE-REFERENCE') {
        pipeline_col = count
      } else if (header === 'REVISION') {
        revision_col = count
      } else if (header === 'N_S_') {
        weld_size_col = count
      } else if (header === 'WELD-NO') {
        weld_no_col = count
      } else if (header === 'WELD-TYPE') {
        weld_type_col = count
      } else if (header === 'SPOOL-ID') {
        weld_pm_col = count
      } else if (header === 'PIPING-SPEC') {
        weld_pipe_spec_col = count
      } else if (header === 'SPOOL-DRAWING-SEQUENCE-NUMBER') {
        weld_spool_col = count
      }
      count += 1
      return header
    })

    // ADD SPOOLS FROM LINELIST TO JOB
    count = 0
    lines.map((line) => {
      count += 1
      if (
        line.split(',')[pipeline_col] !== '' &&
        line.split(',')[pipeline_col] !== undefined &&
        count > first_row
      ) {
        job.spools.map((spool) => {
          if (spool.piecemark === line.split(',')[weld_pm_col]) {
            // FIND SCHEDULE
            let weld_size = line.split(',')[weld_size_col]
            if (line.split(',')[weld_size_col] === '4-Mar') {
              weld_size = '.75'
            }
            job.welds.push({
              spool: spool.spool,
              size: weld_size,
              type: line.split(',')[weld_type_col],
              material: spool.material,
              schedule: undefined,
            })
          }
        })
      }
    })

    // ////// //  // ///   /// ///   ///   //   /////  //    //
    // //     //  // // /// // // /// // //  // //  //  //  //
    // ////// //  // //     // //     // ////// // //     //
    //     // //  // //     // //     // //  // //  //    //
    // ////// ////// //     // //     // //  // //  //    //

    let summary = {
      client: job.client,
      number: jobnum,
      spools: job.spools,
      shorts: job.shorts,
      dormant: dormant,
      priorities: job.priorities,
      issued: job.issued,
      workable: job.workable,
      total: job.total,
      on_hold: job.on_hold,
      weldout: job.weldout,
      status: job.status,
      stc: job.stc,
      delivered: job.delivered,
      workable_not_issued: job.workable_not_issued,
      issued_missing_item: job.issued_missing_item,
      on_hold_no_shorts: job.on_hold_no_shorts,
      areas: job.areas,
      materials: job.materials,
      discrepancies: job.discrepancies,
      welds: job.welds,
      spools_by_scope: {
        valves: {
          performance: undefined,
          client: undefined,
          other: undefined,
          total: undefined,
        },
        pipe: {
          performance: undefined,
          client: undefined,
          other: undefined,
          total: undefined,
        },
        flanges: {
          performance: undefined,
          client: undefined,
          other: undefined,
          total: undefined,
        },
        fittings: {
          performance: undefined,
          client: undefined,
          other: undefined,
          total: undefined,
        },
        supports: {
          performance: undefined,
          client: undefined,
          other: undefined,
          total: undefined,
        },
      },
      count_shorts: {
        missing_valve_only: {
          performance: undefined,
          client: undefined,
          other: undefined,
          total: undefined,
        },
        total: {
          valves: {
            performance: undefined,
            client: undefined,
            other: undefined,
            total: undefined,
          },
          pipe: {
            performance: undefined,
            client: undefined,
            other: undefined,
            total: undefined,
          },
          flanges: {
            performance: undefined,
            client: undefined,
            other: undefined,
            total: undefined,
          },
          fittings: {
            performance: undefined,
            client: undefined,
            other: undefined,
            total: undefined,
          },
          supports: {
            performance: undefined,
            client: undefined,
            other: undefined,
            total: undefined,
          },
        },
        no_material: {
          valves: {
            performance: undefined,
            client: undefined,
            other: undefined,
            total: undefined,
          },
          pipe: {
            performance: undefined,
            client: undefined,
            other: undefined,
            total: undefined,
          },
          flanges: {
            performance: undefined,
            client: undefined,
            other: undefined,
            total: undefined,
          },
          fittings: {
            performance: undefined,
            client: undefined,
            other: undefined,
            total: undefined,
          },
          supports: {
            performance: undefined,
            client: undefined,
            other: undefined,
            total: undefined,
          },
        },
        purchased: {
          valves: {
            performance: undefined,
            client: undefined,
            other: undefined,
            total: undefined,
          },
          pipe: {
            performance: undefined,
            client: undefined,
            other: undefined,
            total: undefined,
          },
          flanges: {
            performance: undefined,
            client: undefined,
            other: undefined,
            total: undefined,
          },
          fittings: {
            performance: undefined,
            client: undefined,
            other: undefined,
            total: undefined,
          },
          supports: {
            performance: undefined,
            client: undefined,
            other: undefined,
            total: undefined,
          },
        },
      },
    }

    // SPOOLS BY SCOPE
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    let spoollist = []
    let spools_valves = []
    let spools_pipe = []
    let spools_flanges = []
    let spools_fittings = []
    let spools_supports = []

    // CREATE ARRAYS OF MISSINGS SPOOLS BY PRIORITY OF ITEM
    job.shorts.map((each) => {
      if (
        spoollist.includes(each.spool) === false &&
        each.item === 'VALVES / IN-LINE ITEMS'
      ) {
        spoollist.push(each.spool)
        spools_valves.push(each)
      }
      return each
    })
    job.shorts.map((each) => {
      if (spoollist.includes(each.spool) === false && each.item === 'PIPE') {
        spoollist.push(each.spool)
        spools_pipe.push(each)
      }
      return each
    })
    job.shorts.map((each) => {
      if (spoollist.includes(each.spool) === false && each.item === 'FLANGES') {
        spoollist.push(each.spool)
        spools_flanges.push(each)
      }
      return each
    })
    job.shorts.map((each) => {
      if (
        spoollist.includes(each.spool) === false &&
        each.item === 'FITTINGS'
      ) {
        spoollist.push(each.spool)
        spools_fittings.push(each)
      }
      return each
    })
    job.shorts.map((each) => {
      if (
        spoollist.includes(each.spool) === false &&
        each.item === 'SUPPORTS'
      ) {
        spoollist.push(each.spool)
        spools_supports.push(each)
      }
      return each
    })

    // COUNT SPOOLS MISSING ITEMS USING MULTIPLIER
    const countSpools = (spoolsarray) => {
      let countspools = 0
      spoolsarray.map((spool) => (countspools += spool.multiplier))
      return countspools
    }

    // VALVES
    summary.spools_by_scope.valves.performance = countSpools(
      spools_valves.filter((spool) => spool.scope === 'Performance')
    )
    summary.spools_by_scope.valves.client = countSpools(
      spools_valves.filter((spool) => spool.scope === 'Client')
    )
    summary.spools_by_scope.valves.other = countSpools(
      spools_valves.filter((spool) => spool.scope === 'Other')
    )
    summary.spools_by_scope.valves.total = countSpools(spools_valves)
    // PIPE
    summary.spools_by_scope.pipe.performance = countSpools(
      spools_pipe.filter((spool) => spool.scope === 'Performance')
    )
    summary.spools_by_scope.pipe.client = countSpools(
      spools_pipe.filter((spool) => spool.scope === 'Client')
    )
    summary.spools_by_scope.pipe.other = countSpools(
      spools_pipe.filter((spool) => spool.scope === 'Other')
    )
    summary.spools_by_scope.pipe.total = countSpools(spools_pipe)
    // FLANGES
    summary.spools_by_scope.flanges.performance = countSpools(
      spools_flanges.filter((spool) => spool.scope === 'Performance')
    )
    summary.spools_by_scope.flanges.client = countSpools(
      spools_flanges.filter((spool) => spool.scope === 'Client')
    )
    summary.spools_by_scope.flanges.other = countSpools(
      spools_flanges.filter((spool) => spool.scope === 'Other')
    )
    summary.spools_by_scope.flanges.total = countSpools(spools_flanges)
    // FITTINGS
    summary.spools_by_scope.fittings.performance = countSpools(
      spools_fittings.filter((spool) => spool.scope === 'Performance')
    )
    summary.spools_by_scope.fittings.client = countSpools(
      spools_fittings.filter((spool) => spool.scope === 'Client')
    )
    summary.spools_by_scope.fittings.other = countSpools(
      spools_fittings.filter((spool) => spool.scope === 'Other')
    )
    summary.spools_by_scope.fittings.total = countSpools(spools_fittings)
    // SUPPORTS
    summary.spools_by_scope.supports.performance = countSpools(
      spools_supports.filter((spool) => spool.scope === 'Performance')
    )
    summary.spools_by_scope.supports.client = countSpools(
      spools_supports.filter((spool) => spool.scope === 'Client')
    )
    summary.spools_by_scope.supports.other = countSpools(
      spools_supports.filter((spool) => spool.scope === 'Other')
    )
    summary.spools_by_scope.supports.total = countSpools(spools_supports)

    // COUNT UP DISCREPANCIES
    summary.spools_by_scope.discrepancies =
      job.total -
      (summary.spools_by_scope.valves.total +
        summary.spools_by_scope.pipe.total +
        summary.spools_by_scope.flanges.total +
        summary.spools_by_scope.fittings.total +
        summary.spools_by_scope.supports.total +
        summary.issued +
        summary.workable_not_issued +
        summary.on_hold_no_shorts -
        summary.issued_missing_item)

    // SHORTS
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // NO MATERIAL
    // VALVES
    summary.count_shorts.no_material.valves.performance = summary.shorts.filter(
      (short) =>
        short.item === 'VALVES / IN-LINE ITEMS' &&
        short.status === 'No Material' &&
        short.scope === 'Performance'
    ).length
    summary.count_shorts.no_material.valves.client = summary.shorts.filter(
      (short) =>
        short.item === 'VALVES / IN-LINE ITEMS' &&
        short.status === 'No Material' &&
        short.scope === 'Client'
    ).length
    summary.count_shorts.no_material.valves.other = summary.shorts.filter(
      (short) =>
        short.item === 'VALVES / IN-LINE ITEMS' &&
        short.status === 'No Material' &&
        short.scope === 'Other'
    ).length
    summary.count_shorts.no_material.valves.total = summary.shorts.filter(
      (short) =>
        short.item === 'VALVES / IN-LINE ITEMS' &&
        short.status === 'No Material'
    ).length
    // PIPE
    let count_pipe = 0
    summary.shorts.filter((short) => {
      if (
        short.item === 'PIPE' &&
        short.status === 'No Material' &&
        short.scope === 'Performance'
      ) {
        count_pipe += parseFloat(short.quantity)
      }
      return short
    })
    summary.count_shorts.no_material.pipe.performance = parseFloat(
      count_pipe.toFixed(1)
    )
    count_pipe = 0
    summary.shorts.filter((short) => {
      if (
        short.item === 'PIPE' &&
        short.status === 'No Material' &&
        short.scope === 'Client'
      ) {
        count_pipe += parseFloat(short.quantity)
      }
      return short
    })
    summary.count_shorts.no_material.pipe.client = parseFloat(
      count_pipe.toFixed(1)
    )
    count_pipe = 0
    summary.shorts.filter((short) => {
      if (
        short.item === 'PIPE' &&
        short.status === 'No Material' &&
        short.scope === 'Other'
      ) {
        count_pipe += parseFloat(short.quantity)
      }
      return short
    })
    summary.count_shorts.no_material.pipe.other = parseFloat(
      count_pipe.toFixed(1)
    )
    count_pipe = 0
    summary.shorts.filter((short) => {
      if (short.item === 'PIPE' && short.status === 'No Material') {
        count_pipe += parseFloat(short.quantity)
      }
      return short
    })
    summary.count_shorts.no_material.pipe.total = parseFloat(
      count_pipe.toFixed(1)
    )
    // FLANGES
    summary.count_shorts.no_material.flanges.performance = summary.shorts.filter(
      (short) =>
        short.item === 'FLANGES' &&
        short.status === 'No Material' &&
        short.scope === 'Performance'
    ).length
    summary.count_shorts.no_material.flanges.client = summary.shorts.filter(
      (short) =>
        short.item === 'FLANGES' &&
        short.status === 'No Material' &&
        short.scope === 'Client'
    ).length
    summary.count_shorts.no_material.flanges.other = summary.shorts.filter(
      (short) =>
        short.item === 'FLANGES' &&
        short.status === 'No Material' &&
        short.scope === 'Other'
    ).length
    summary.count_shorts.no_material.flanges.total = summary.shorts.filter(
      (short) => short.item === 'FLANGES' && short.status === 'No Material'
    ).length
    // FITTINGS
    summary.count_shorts.no_material.fittings.performance = summary.shorts.filter(
      (short) =>
        short.item === 'FITTINGS' &&
        short.status === 'No Material' &&
        short.scope === 'Performance'
    ).length
    summary.count_shorts.no_material.fittings.client = summary.shorts.filter(
      (short) =>
        short.item === 'FITTINGS' &&
        short.status === 'No Material' &&
        short.scope === 'Client'
    ).length
    summary.count_shorts.no_material.fittings.other = summary.shorts.filter(
      (short) =>
        short.item === 'FITTINGS' &&
        short.status === 'No Material' &&
        short.scope === 'Other'
    ).length
    summary.count_shorts.no_material.fittings.total = summary.shorts.filter(
      (short) => short.item === 'FITTINGS' && short.status === 'No Material'
    ).length
    // SUPPORTS
    summary.count_shorts.no_material.supports.performance = summary.shorts.filter(
      (short) =>
        short.item === 'SUPPORTS' &&
        short.status === 'No Material' &&
        short.scope === 'Performance'
    ).length
    summary.count_shorts.no_material.supports.client = summary.shorts.filter(
      (short) =>
        short.item === 'SUPPORTS' &&
        short.status === 'No Material' &&
        short.scope === 'Client'
    ).length
    summary.count_shorts.no_material.supports.other = summary.shorts.filter(
      (short) =>
        short.item === 'SUPPORTS' &&
        short.status === 'No Material' &&
        short.scope === 'Other'
    ).length
    summary.count_shorts.no_material.supports.total = summary.shorts.filter(
      (short) => short.item === 'SUPPORTS' && short.status === 'No Material'
    ).length

    // PURCHASED
    // VALVES
    summary.count_shorts.purchased.valves.performance = summary.shorts.filter(
      (short) =>
        short.item === 'VALVES / IN-LINE ITEMS' &&
        short.status === 'Purchased' &&
        short.scope === 'Performance'
    ).length
    summary.count_shorts.purchased.valves.client = summary.shorts.filter(
      (short) =>
        short.item === 'VALVES / IN-LINE ITEMS' &&
        short.status === 'Purchased' &&
        short.scope === 'Client'
    ).length
    summary.count_shorts.purchased.valves.other = summary.shorts.filter(
      (short) =>
        short.item === 'VALVES / IN-LINE ITEMS' &&
        short.status === 'Purchased' &&
        short.scope === 'Other'
    ).length
    summary.count_shorts.purchased.valves.total = summary.shorts.filter(
      (short) =>
        short.item === 'VALVES / IN-LINE ITEMS' && short.status === 'Purchased'
    ).length
    // PIPE
    count_pipe = 0
    summary.shorts.filter((short) => {
      if (
        short.item === 'PIPE' &&
        short.status === 'Purchased' &&
        short.scope === 'Performance'
      ) {
        count_pipe += parseFloat(short.quantity)
      }
      return short
    })
    summary.count_shorts.purchased.pipe.performance = parseFloat(
      count_pipe.toFixed(1)
    )
    count_pipe = 0
    summary.shorts.filter((short) => {
      if (
        short.item === 'PIPE' &&
        short.status === 'Purchased' &&
        short.scope === 'Client'
      ) {
        count_pipe += parseFloat(short.quantity)
      }
      return short
    })
    summary.count_shorts.purchased.pipe.client = parseFloat(
      count_pipe.toFixed(1)
    )
    count_pipe = 0
    summary.shorts.filter((short) => {
      if (
        short.item === 'PIPE' &&
        short.status === 'Purchased' &&
        short.scope === 'Other'
      ) {
        count_pipe += parseFloat(short.quantity)
      }
      return short
    })
    summary.count_shorts.purchased.pipe.other = parseFloat(
      count_pipe.toFixed(1)
    )
    count_pipe = 0
    summary.shorts.filter((short) => {
      if (short.item === 'PIPE' && short.status === 'Purchased') {
        count_pipe += parseFloat(short.quantity)
      }
      return short
    })
    summary.count_shorts.purchased.pipe.total = parseFloat(
      count_pipe.toFixed(1)
    )
    // FLANGES
    summary.count_shorts.purchased.flanges.performance = summary.shorts.filter(
      (short) =>
        short.item === 'FLANGES' &&
        short.status === 'Purchased' &&
        short.scope === 'Performance'
    ).length
    summary.count_shorts.purchased.flanges.client = summary.shorts.filter(
      (short) =>
        short.item === 'FLANGES' &&
        short.status === 'Purchased' &&
        short.scope === 'Client'
    ).length
    summary.count_shorts.purchased.flanges.other = summary.shorts.filter(
      (short) =>
        short.item === 'FLANGES' &&
        short.status === 'Purchased' &&
        short.scope === 'Other'
    ).length
    summary.count_shorts.purchased.flanges.total = summary.shorts.filter(
      (short) => short.item === 'FLANGES' && short.status === 'Purchased'
    ).length
    // FITTINGS
    summary.count_shorts.purchased.fittings.performance = summary.shorts.filter(
      (short) =>
        short.item === 'FITTINGS' &&
        short.status === 'Purchased' &&
        short.scope === 'Performance'
    ).length
    summary.count_shorts.purchased.fittings.client = summary.shorts.filter(
      (short) =>
        short.item === 'FITTINGS' &&
        short.status === 'Purchased' &&
        short.scope === 'Client'
    ).length
    summary.count_shorts.purchased.fittings.other = summary.shorts.filter(
      (short) =>
        short.item === 'FITTINGS' &&
        short.status === 'Purchased' &&
        short.scope === 'Other'
    ).length
    summary.count_shorts.purchased.fittings.total = summary.shorts.filter(
      (short) => short.item === 'FITTINGS' && short.status === 'Purchased'
    ).length
    // SUPPORTS
    summary.count_shorts.purchased.supports.performance = summary.shorts.filter(
      (short) =>
        short.item === 'SUPPORTS' &&
        short.status === 'Purchased' &&
        short.scope === 'Performance'
    ).length
    summary.count_shorts.purchased.supports.client = summary.shorts.filter(
      (short) =>
        short.item === 'SUPPORTS' &&
        short.status === 'Purchased' &&
        short.scope === 'Client'
    ).length
    summary.count_shorts.purchased.supports.other = summary.shorts.filter(
      (short) =>
        short.item === 'SUPPORTS' &&
        short.status === 'Purchased' &&
        short.scope === 'Other'
    ).length
    summary.count_shorts.purchased.supports.total = summary.shorts.filter(
      (short) => short.item === 'SUPPORTS' && short.status === 'Purchased'
    ).length

    // TOTAL SHORTS
    // PERFORMANCE
    summary.count_shorts.total.valves.performance =
      summary.count_shorts.no_material.valves.performance +
      summary.count_shorts.purchased.valves.performance

    summary.count_shorts.total.pipe.performance =
      summary.count_shorts.no_material.pipe.performance +
      summary.count_shorts.purchased.pipe.performance

    summary.count_shorts.total.flanges.performance =
      summary.count_shorts.no_material.flanges.performance +
      summary.count_shorts.purchased.flanges.performance

    summary.count_shorts.total.fittings.performance =
      summary.count_shorts.no_material.fittings.performance +
      summary.count_shorts.purchased.fittings.performance

    summary.count_shorts.total.supports.performance =
      summary.count_shorts.no_material.supports.performance +
      summary.count_shorts.purchased.supports.performance
    // CLIENT
    summary.count_shorts.total.valves.client =
      summary.count_shorts.no_material.valves.client +
      summary.count_shorts.purchased.valves.client

    summary.count_shorts.total.pipe.client =
      summary.count_shorts.no_material.pipe.client +
      summary.count_shorts.purchased.pipe.client

    summary.count_shorts.total.flanges.client =
      summary.count_shorts.no_material.flanges.client +
      summary.count_shorts.purchased.flanges.client

    summary.count_shorts.total.fittings.client =
      summary.count_shorts.no_material.fittings.client +
      summary.count_shorts.purchased.fittings.client

    summary.count_shorts.total.supports.client =
      summary.count_shorts.no_material.supports.client +
      summary.count_shorts.purchased.supports.client
    // OTHER
    summary.count_shorts.total.valves.other =
      summary.count_shorts.no_material.valves.other +
      summary.count_shorts.purchased.valves.other

    summary.count_shorts.total.pipe.other =
      summary.count_shorts.no_material.pipe.other +
      summary.count_shorts.purchased.pipe.other

    summary.count_shorts.total.flanges.other =
      summary.count_shorts.no_material.flanges.other +
      summary.count_shorts.purchased.flanges.other

    summary.count_shorts.total.fittings.other =
      summary.count_shorts.no_material.fittings.other +
      summary.count_shorts.purchased.fittings.other

    summary.count_shorts.total.supports.other =
      summary.count_shorts.no_material.supports.other +
      summary.count_shorts.purchased.supports.other
    // TOTAL
    summary.count_shorts.total.valves.total =
      summary.count_shorts.no_material.valves.total +
      summary.count_shorts.purchased.valves.total

    summary.count_shorts.total.pipe.total =
      summary.count_shorts.no_material.pipe.total +
      summary.count_shorts.purchased.pipe.total

    summary.count_shorts.total.flanges.total =
      summary.count_shorts.no_material.flanges.total +
      summary.count_shorts.purchased.flanges.total

    summary.count_shorts.total.fittings.total =
      summary.count_shorts.no_material.fittings.total +
      summary.count_shorts.purchased.fittings.total

    summary.count_shorts.total.supports.total =
      summary.count_shorts.no_material.supports.total +
      summary.count_shorts.purchased.supports.total

    // SPOOL MISSING VALVE ONLY
    summary.count_shorts.missing_valve_only.performance = summary.spools.filter(
      (spool) =>
        spool.missing_valve_only === true && spool.scope === 'Performance'
    ).length
    summary.count_shorts.missing_valve_only.client = summary.spools.filter(
      (spool) => spool.missing_valve_only === true && spool.scope === 'Client'
    ).length
    summary.count_shorts.missing_valve_only.other = summary.spools.filter(
      (spool) => spool.missing_valve_only === true && spool.scope === 'Other'
    ).length
    summary.count_shorts.missing_valve_only.total = summary.spools.filter(
      (spool) => spool.missing_valve_only === true
    ).length

    // DOWNLOAD JSON FILE
    let obj = summary
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
      payload: job,
    })
  } catch {
    dispatch({
      type: JOB_ERROR,
    })
  }
}

export const downloadReport = (job) => async (dispatch) => {
  try {
    // GRAB XLSX SUMMARY TEMPLATE
    // eslint-disable-next-line
    const res = await axios.get('/api/summary/' + job.number + '/' + job.client)
    dispatch({
      type: DOWNLOAD_JOB,
    })
    alert('Summary saved to job folder!')
  } catch {
    dispatch({
      type: JOB_ERROR,
    })
    console.log('error')
  }
}

export const downloadLoading = () => async (dispatch) => {
  try {
    dispatch({
      type: DOWNLOAD_JOB_LOADING,
    })
  } catch {
    dispatch({
      type: JOB_ERROR,
    })
    console.log('error')
  }
}
