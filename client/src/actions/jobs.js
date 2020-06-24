import axios from 'axios'
import { UPDATE_JOB, JOB_ERROR } from './types'

// Update the line list and store in state
export const updateJob = (jobnum) => async (dispatch) => {
  try {
    // CREATE LINE LIST OBJECT
    let job = {
      spools: [],
    }

    // TO CHECK IF SPOOL ALREADY EXISTS
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
      count += 1
      if (
        (line.includes('ISO') || line.includes('Iso')) &&
        line.includes('Material')
      ) {
        first_row = count
        console.log(first_row)
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
            items: [],
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
    let date_pull_col = undefined
    let weld_out_col = undefined
    let ready_to_ship_col = undefined
    let ready_stc_col = undefined
    let stc_col = undefined
    let delivered_col = undefined
    let sr_on_hold_col = undefined

    count = 0

    headers.map((header) => {
      if (header === 'PIECE MARK' || header === 'PIECEMARK') {
        sr_piecemark_col = count
      } else if (header === 'DATE PULL') {
        date_pull_col = count
      } else if (header === 'WELD OUT') {
        weld_out_col = count
      } else if (header === 'SPOOL') {
        spool_col = count
      } else if (header === 'READY TO SHIP') {
        ready_to_ship_col = count
      } else if (header === 'READY TO SHIP COATING') {
        ready_stc_col = count
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
        job.spools.map((each) => {
          if (line.split(',')[sr_piecemark_col] === each.piecemark) {
            each.pulled = line.split(',')[date_pull_col]
            each.weldout = line.split(',')[weld_out_col]
            each.ready_to_ship = line.split(',')[ready_to_ship_col]
            each.readty_stc = line.split(',')[ready_stc_col]
            each.stc = line.split(',')[stc_col]
            each.delivered = line.split(',')[delivered_col]
            each.on_hold = line.split(',')[sr_on_hold_col]
          }
          return job
        })
        return job
      }
      return lines
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
    let be_piecemark_col = undefined
    let be_tag_col = undefined
    let be_position_col = undefined
    let be_item_col = undefined
    let be_quantity_col = undefined
    let be_unit_col = undefined
    let be_description_col = undefined

    count = 0

    headers.map((header) => {
      if (header === 'BOM PATH') {
        be_bom_path_col = count
      } else if (header === ' SKETCH') {
        be_piecemark_col = count
      } else if (header === ' TAG NUMBER') {
        be_tag_col = count
      } else if (header === ' POS') {
        be_position_col = count
      } else if (header === ' GROUP-PERF') {
        be_item_col = count
      } else if (header === ' LIST QUANTITY') {
        be_quantity_col = count
      } else if (header === ' DESCRIPTION') {
        be_description_col = count
      } else if (header === ' UNIT') {
        be_unit_col = count
      }
      count += 1
      return headers
    })

    // ADD INFORMATION FROM BOM EXPORT TO JOB
    count = 0
    lines.map((line) => {
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

    // // GRAB FORECAST CSV
    // const res_fc = await axios.get('/api/csvs/forecast/' + jobnum)
    // let forecast_csv = res_fc.data

    // // FIND HEADERS FROM FORECAST CSV
    // lines = forecast_csv.split('\n')
    // header = lines.filter((line) => line.includes('BOM PATH'))[0]
    // headers = header.split(',')

    // // FIND FIRST ROW OF SPOOLS
    // count = 1
    // first_row = undefined
    // lines.map((line) => {
    //   count += 1
    //   if (line.includes('BOM PATH')) {
    //     first_row = count
    //   }
    //   return lines
    // })

    // // ASSIGN COLUMN NUMBER TO EACH HEADER
    // let bom_path_col = undefined
    // let fc_piecemark_col = undefined
    // let tag_col = undefined
    // let position_col = undefined
    // let item_col = undefined
    // let quantity_col = undefined
    // let status_col = undefined
    // let po_col = undefined
    // let perc_comp_col = undefined

    // count = 0

    // headers.map((header) => {
    //   if (header === 'BOM PATH') {
    //     bom_path_col = count
    //   } else if (header === ' SKETCH') {
    //     fc_piecemark_col = count
    //   } else if (header === ' TAG NUMBER') {
    //     tag_col = count
    //   } else if (header === ' POS') {
    //     position_col = count
    //   } else if (header === ' GROUP-PERF') {
    //     item_col = count
    //   } else if (header === ' LIST QUANTITY') {
    //     quantity_col = count
    //   } else if (header === ' STATUS' && header > 4) {
    //     status_col = count
    //   } else if (header === ' PO NUMBER') {
    //     po_col = count
    //   } else if (header === 'PERCENTAGE COMPLETE') {
    //     perc_comp_col = count
    //   }
    //   count += 1
    //   return headers
    // })

    // // ADD INFORMATION FROM FORECAST TO JOB
    // count = 0
    // lines.map((line) => {
    //   count += 1
    //   if (
    //     line.split(',')[bom_path_col] !== '' &&
    //     line.split(',')[bom_path_col] !== undefined &&
    //     count >= first_row
    //   ) {
    //     job.spools.map((spool) => {
    //       if (
    //         line.split(',')[bom_path_col].split('/').slice(-1)[0] ===
    //         spool.spool
    //       ) {
    //         spool.pulled = line.split(',')[date_pull_col]
    //         spool.weldout = line.split(',')[weld_out_col]
    //         spool.ready_to_ship = line.split(',')[ready_to_ship_col]
    //         spool.readty_stc = line.split(',')[ready_stc_col]
    //         spool.stc = line.split(',')[stc_col]
    //         spool.delivered = line.split(',')[delivered_col]
    //         spool.on_hold = line.split(',')[sr_on_hold_col]
    //       }
    //       return job
    //     })
    //     return job
    //   }
    //   return lines
    // })

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
