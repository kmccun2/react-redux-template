import axios from 'axios'
import {
  UPDATE_JOB,
  UPDATE_JOB_MATS,
  JOB_ERROR,
  SET_JOB_LOADING,
} from './types'

// SET LOADING TO TRUE
export const setJobLoading = () => async (dispatch) => {
  dispatch({
    type: SET_JOB_LOADING,
  })
}

// // SORT
// export const sortAreas = (object, key, type, lastsort) => async (dispatch) => {
//   try {
//     let newlastsort = undefined
//     if (type === 'value') {
//       // SORT BY VALUE
//       // ASCENDING
//       if (lastsort !== key + 'asc') {
//         newlastsort = key + 'asc'
//         object.sort(function (a, b) {
//           return a[key] - b[key]
//         })
//       } else {
//         // DESCENDING
//         object.sort(function (b, a) {
//           newlastsort = key + 'desc'
//           return a[key] - b[key]
//         })
//       }
//     } else if (type === 'name') {
//       // SORT BY NAME
//       object.sort(function (a, b) {
//         var nameA = a[key].toUpperCase() // ignore upper and lowercase
//         var nameB = b[key].toUpperCase() // ignore upper and lowercase

//         // ASCENDING
//         if (lastsort !== key + 'asc') {
//           newlastsort = key + 'asc'
//           if (nameA < nameB) {
//             return -1
//           }
//           if (nameA > nameB) {
//             return 1
//           }
//         } else {
//           // DESCENDING
//           newlastsort = key + 'desc'
//           if (nameA < nameB) {
//             return 1
//           }
//           if (nameA > nameB) {
//             return -1
//           }
//         }

//         // names must be equal
//         return 0
//       })
//     }

//     dispatch({
//       type: SORT_AREAS,
//       payload: { object: object, lastsort: newlastsort },
//     })
//   } catch {
//     dispatch({
//       type: SORT_ERROR,
//     })
//   }
// }

// UPDATE THE LINE LIST AND STORE IN STATE
export const updateJob = (jobnum, filtered, materialcheck) => async (
  dispatch
) => {
  try {
    // CREATE LINE LIST OBJECT
    let job = {
      number: jobnum,
      spools: [],
      areas: [],
      materials: [],
      missing: [],
      workable_not_issued: 0,
      missingspools: {
        valves: { p: 0, c: 0, o: 0 },
        fittings: { p: 0, c: 0, o: 0 },
        flanges: { p: 0, c: 0, o: 0 },
        supports: { p: 0, c: 0, o: 0 },
        pipe: { p: 0, c: 0, o: 0 },
      },
    }

    // TO CHECK IF SPOOL ALREADY EXISTS
    let spools_list = []
    let areas_list = []
    let materials_list = []

    if (filtered === null) {
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
        } else if (
          header === 'Priority #' ||
          header === 'Individual Priority'
        ) {
          priority_col = count
        } else if (header === 'Area') {
          area_col = count
        } else if (
          header === 'Iso' ||
          header === 'Iso No.' ||
          header === 'ISO'
        ) {
          iso_col = count
        } else if (header === 'In Detailing' || header === 'Detailing') {
          detailing_col = count
        } else if (header === 'In Checking' || header === 'Checking') {
          checking_col = count
        } else if (
          header === 'SHOP' ||
          (header === 'Fab. Location') === 'Shop'
        ) {
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
        } else if (
          header === 'SHIP TO COATING' ||
          header === 'DATE TO PAINTER'
        ) {
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
      lines.map((line) => {
        count += 1
        if (
          line.split(',')[bom_path_col] !== '' &&
          line.split(',')[bom_path_col] !== undefined &&
          count >= first_row
        ) {
          job.spools.map((spool) => {
            // FIND SPOOL BY MATCHING BOM PATH TO SPOOL NAME
            if (
              line.split(',')[bom_path_col].split('/').slice(-1)[0] ===
              spool.spool
            ) {
              // IF ALL ITEMS ON FORECAST ARE COMPLETE, MARK SPOOL AS WORKABLE
              if (
                line.split(',')[perc_comp_col].split('/').slice(-1)[0] ===
                '100%'
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
    } else {
      job.spools = filtered
    }

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
      // TOTAL ISSUED
      if (each.issued !== '' && each.issued !== undefined) {
        job.issued += each.multiplier
      }
      // TOTAL WORKABLE
      if (each.workable) {
        job.workable += each.multiplier
      }
      // TOTAL ON HOLD
      if (each.on_hold !== '' && each.on_hold !== undefined) {
        job.on_hold += each.multiplier
      }
      // TOTAL WELDED OUT
      if (each.weldout !== '' && each.weldout !== undefined) {
        job.weldout += each.multiplier
      }
      // TOTAL STC
      if (each.stc !== '' && each.stc !== undefined) {
        job.stc += each.multiplier
      }
      // TOTAL DELIVERED
      if (each.delivered !== '' && each.delivered !== undefined) {
        job.delivered += each.multiplier
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
        job.materials.push(each.material)
      }
      return each
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
    if (!materialcheck) {
      job.spools.map((spool) => {
        spool.items.map((item) => {
          // IF ITEM IS A SHORT
          if (item.status !== 'Complete') {
            if ('VALVES / IN-LINE ITEMS'.includes(item.item))
              assignShort('VALVES / IN-LINE ITEMS', item, spool)
            if ('FITTINGS'.includes(item.item))
              assignShort('FITTINGS', item, spool)
            if ('FLANGES'.includes(item.item))
              assignShort('FLANGES', item, spool)
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
            if (
              purchased.includes('Performance') &&
              purchased.includes('PIPE')
            ) {
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
        countSpools(
          'Performance-PIPE-Purchased',
          'Performance-PIPE-No Material'
        )
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
    }

    // DISPATCH TO REDUCER
    if (filtered === null) {
      dispatch({
        type: UPDATE_JOB,
        payload: { job: job, jobnum: jobnum },
      })
    } else {
      dispatch({
        type: UPDATE_JOB_MATS,
        payload: job,
      })
    }
  } catch (err) {
    console.log(err)
    dispatch({
      type: JOB_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status },
    })
  }
}