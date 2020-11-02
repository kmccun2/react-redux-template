import axios from 'axios'
import moment from 'moment'
import { UPDATE_JOB, JOB_ERROR, SET_JOB_LOADING, SET_JOB, DOWNLOAD_JOB, DOWNLOAD_JOB_LOADING } from './types'

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
        bom_not_line_list: [],
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
      issued_on_hold: 0,
      on_hold_no_shorts: 0,
      workable_manhours: 0,
      workable_manhours_ss: 0,
      workable_manhours_cs: 0,
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
    let header = lines.filter((line) => line.includes('ISO') || (line.includes('Iso') && line.includes('Material')))[0]
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
      if (line.toUpperCase().includes('ISO') && line.toUpperCase().includes('IN CHECKING') && line.toUpperCase().includes('IN DETAILING')) {
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
      header = header.toUpperCase()
      if (header === 'SPOOL ID' || header === 'Spool Tag') {
        piecemark_col = count
      } else if (header === 'MATERIAL') {
        material_col = count
      } else if (header === 'STATUS' || header === 'DATE ISSUED') {
        issued_col = count
      } else if (header === 'SPOOL' || header === 'SKETCH NO.') {
        spool_col = count
        // } else if (header === 'Priority Group') {
        //   priority_group_col = count
      } else if (header === 'PRIORITY #' || header === 'INDIVIDUAL PRIORITY' || header === 'PRIORITY') {
        priority_col = count
      } else if (header === 'AREA' || header === 'PHASE' || header === 'PHASE / JOB NO.') {
        area_col = count
      } else if (header === 'ISO' || header === 'Iso No.') {
        iso_col = count
      } else if (header === 'IN DETAILING' || header === 'DETAILING') {
        detailing_col = count
      } else if (header === 'IN CHECKING' || header === 'CHECKING') {
        checking_col = count
      } else if (header === 'SHOP' || header === 'FAB. LOCATION') {
        shop_col = count
      } else if (header === 'HOLD' || header === 'HOLD STATUS') {
        on_hold_col = count
      }
      count += 1
      return headers
    })
    // CHECK FOR ERRORS ON COLUMN HEADERS
    if (piecemark_col === undefined) alert('Error on ' + jobnum + ' linelist! Spool Id header should be titled "Spool ID".')
    if (material_col === undefined) alert('Error on ' + jobnum + ' linelist! Material header should be titled "Material".')
    if (issued_col === undefined) alert('Error on ' + jobnum + ' linelist! Issued header should be titled "Status".')
    if (spool_col === undefined) alert('Error on ' + jobnum + ' linelist! Spool/sketch header should be titled SPOOL.')
    // if (priority_group_col === undefined)
    //   alert(
    //     'Error on ' +
    //       jobnum +
    //       ' linelist! Priority Group header should be titled "Priority Group".'
    //   )
    if (priority_col === undefined) alert('Error on ' + jobnum + ' linelist! Priority header should be titled "Priority".')
    if (area_col === undefined) alert('Error on ' + jobnum + ' linelist! Area header should be titled "Area".')
    if (iso_col === undefined) alert('Error on ' + jobnum + ' linelist! Iso header should be titled "Iso".')
    if (detailing_col === undefined) alert('Error on ' + jobnum + ' linelist! Detailing header should be titled "Detailing".')
    if (checking_col === undefined) alert('Error on ' + jobnum + ' linelist! header should be titled "Checking".')
    if (shop_col === undefined) alert('Error on ' + jobnum + ' linelist! Shop header should be titled "Shop".')
    if (on_hold_col === undefined) alert('Error on ' + jobnum + ' linelist! On hold header should be titled "HOLD".')

    // ADD SPOOLS FROM LINELIST TO JOB
    count = 0
    lines.map((line) => {
      count += 1
      if (line.split(',')[piecemark_col] !== '' && line.split(',')[piecemark_col] !== undefined && count >= first_row) {
        if (spools_list.includes(line.split(',')[piecemark_col]) === false) {
          // Rename sketch numbers that were converted to month/day
          let fix_spool = line.split(',')[spool_col]
          if (line.split(',')[spool_col] === '1-Jan') fix_spool = '1-1'
          if (line.split(',')[spool_col] === '1-Feb') fix_spool = '2-1'
          if (line.split(',')[spool_col] === '1-Mar') fix_spool = '3-1'
          if (line.split(',')[spool_col] === '1-Apr') fix_spool = '4-1'
          if (line.split(',')[spool_col] === '1-May') fix_spool = '5-1'
          if (line.split(',')[spool_col] === '1-Jun') fix_spool = '6-1'
          if (line.split(',')[spool_col] === '1-Jul') fix_spool = '7-1'
          if (line.split(',')[spool_col] === '1-Aug') fix_spool = '8-1'
          if (line.split(',')[spool_col] === '1-Sep') fix_spool = '9-1'
          if (line.split(',')[spool_col] === '1-Oct') fix_spool = '10-1'
          if (line.split(',')[spool_col] === '1-Nov') fix_spool = '11-1'
          if (line.split(',')[spool_col] === '1-Dec') fix_spool = '12-1'
          // Add spool to job
          job.spools.push({
            spool: fix_spool,
            piecemark: line.split(',')[piecemark_col],
            material: line.split(',')[material_col],
            issued: line.split(',')[issued_col],
            pulled: '',
            scope: 'Other',
            workable: true,
            // priority_group: line.split(',')[priority_group_col],
            priority: line.split(',')[priority_col],
            area: line.split(',')[area_col],
            iso: line.split(',')[iso_col],
            detailing: line.split(',')[detailing_col],
            checking: line.split(',')[checking_col],
            shop: line.split(',')[shop_col],
            on_hold: line.split(',')[on_hold_col].toUpperCase(),
            multiplier: 1,
            jobnum: jobnum,
            client: job.client,
            status: 'Workable',
            items: [],
            shorts: [],
            schedules: [],
            classes: [],
            manhours: 0,
            welds_counted: 0,
            welds: 0,
          })
          spools_list.push(line.split(',')[piecemark_col])
          ll_pms.push(line.split(',')[piecemark_col])
        } else {
          job.spools.map((spool) => {
            if (spool.piecemark_col === line.split(',')[piecemark_col]) {
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
      (line) =>
        line.toUpperCase().includes('PCMKIPCMAR') || line.toUpperCase().includes('PIECE MARK') || line.toUpperCase().includes('PIECEMARK')
    )[0]
    headers = header.split(',')

    // FIND FIRST ROW OF SPOOLS
    count = 1
    first_row = undefined
    lines.map((line) => {
      count += 1
      if (
        line.toUpperCase().includes('PCMKIPCMAR') ||
        line.toUpperCase().includes('PIECE MARK') ||
        line.toUpperCase().includes('PIECEMARK')
      ) {
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
    let loadno_col = undefined

    count = 0
    headers.map((header) => {
      if (header.toUpperCase() === 'PCMKIPCMAR' || header.toUpperCase() === 'PIECE MARK' || header.toUpperCase() === 'PIECEMARK') {
        sr_piecemark_col = count
      } else if (header.toUpperCase() === 'PULLTRANDA' || header.toUpperCase() === 'DATE PULL') {
        pulled_col = count
      } else if (header.toUpperCase() === 'WOUTTRANDA' || header.toUpperCase() === 'WELD OUT') {
        weldout_col = count
      } else if (header.toUpperCase() === 'SHEETSKETC' || header.toUpperCase() === 'Sheetsketc') {
        spool_col = count
      } else if (header.toUpperCase() === 'RTSTRANDAT' || header.toUpperCase() === 'READY TO SHIP') {
        rts_col = count
      } else if (header.toUpperCase() === 'RTCTRANDAT' || header.toUpperCase() === 'READY TO SHIP COATING') {
        rtsc_col = count
      } else if (header.toUpperCase() === 'STCTRANDAT' || header.toUpperCase() === 'SHIP TO COATING') {
        stc_col = count
      } else if (header.toUpperCase() === 'SITETRANDA' || header.toUpperCase() === 'TO SITE') {
        delivered_col = count
      } else if (header.toUpperCase() === 'IDFILLOADN') {
        loadno_col = count
      }
      count += 1
      return headers
    })
    // CHECK FOR ERRORS ON COLUMN HEADERS
    if (sr_piecemark_col === undefined) alert('Error on ' + jobnum + ' status report! Piecemark header should be titled "PIECEMARK".')
    if (pulled_col === undefined) alert('Error on ' + jobnum + ' status report! Pull header should be titled "DATE PULL".')
    if (weldout_col === undefined) alert('Error on ' + jobnum + ' status report! Weld out header should be titled "WELD OUT".')
    if (rts_col === undefined) alert('Error on ' + jobnum + ' status report! Ready to ship header should be titled "READY TO SHIP".')
    if (rtsc_col === undefined)
      alert('Error on ' + jobnum + ' status report! Ready to ship to coating header should be titled "READY TO SHIP COATING".')
    if (stc_col === undefined) alert('Error on ' + jobnum + ' status report! Shipped to coating header should be titled "SHIP TO COATING".')
    if (delivered_col === undefined) alert('Error on ' + jobnum + ' status report! Delivered header should be titled "TO SITE".')

    // ADD INFORMATION FROM STATUS REPORT TO JOB
    count = 0
    let sr_pms = []
    let ll_spools = []

    lines.map((line) => {
      count += 1
      if (line.split(',')[sr_piecemark_col] !== '' && line.split(',')[sr_piecemark_col] !== undefined && count >= first_row) {
        sr_pms.push({
          piecemark: line.split(',')[sr_piecemark_col],
          pulled: line.split(',')[pulled_col],
          weldout: line.split(',')[weldout_col],
          rts: line.split(',')[rts_col],
          rtsc: line.split(',')[rtsc_col],
          stc: line.split(',')[stc_col],
          delivered: line.split(',')[delivered_col],
          loadno: line.split(',')[loadno_col],
        })
      }
      return line
    })

    // COMPARE SPOOLS AND ADD SCOPE
    job.spools.map((spool) => {
      sr_pms.map((pm) => {
        if (pm.piecemark.includes(spool.piecemark + ' ') || pm.piecemark === spool.piecemark) {
          spool.pulled = pm.pulled
          spool.weldout = pm.weldout
          spool.rts = pm.rts
          spool.rtsc = pm.rtsc
          spool.stc = pm.stc
          spool.delivered = pm.delivered
          spool.load_no = pm.loadno
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
    let be_description_col = undefined
    let be_tag_col = undefined
    let be_position_col = undefined
    let be_item_col = undefined
    let be_quantity_col = undefined
    let be_unit_col = undefined
    let be_size_col = undefined
    let be_sched_col = undefined
    let be_class_col = undefined
    let be_pm_col = undefined
    let be_spool_col = undefined
    count = 0

    headers.map((header) => {
      if (header === ' TAG NUMBER') {
        be_tag_col = count
      } else if (header === 'BOM PATH') {
        be_spool_col = count
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
      } else if (header === ' SKETCH') {
        be_pm_col = count
      } else if (header === 'SCHEDULE') {
        be_sched_col = count
      } else if (header === 'CLASS') {
        be_class_col = count
      }
      count += 1
      return headers
    })

    // ADD INFORMATION FROM BOM EXPORT TO JOB
    count = lines.map((line) => {
      count += 1
      if (line.split(',')[be_pm_col] !== '' && line.split(',')[be_pm_col] !== undefined && count >= first_row) {
        // Find schedule and class
        let itemsched = line.split(',')[be_sched_col]
        let itemclass = line.split(',')[be_class_col]
        if (itemsched !== 'None') itemclass = undefined
        // Find weld type
        let itemweld = undefined
        let itemdesc = line.split(',')[be_description_col].toUpperCase()
        // Butt weld
        if (
          (itemdesc.includes(' BE ') && itemdesc.includes('X BE') === false) ||
          itemdesc.includes('BE END') ||
          itemdesc.includes('GRV END') ||
          itemdesc.includes('FLG WN') ||
          itemdesc.includes(' BW ')
        )
          itemweld = 'BW'
        // Socket weld
        if (
          (itemdesc.includes(' PE;') && itemdesc.includes('X PE') === false) ||
          itemdesc.includes('PL END') ||
          itemdesc.includes(' SW;') ||
          itemdesc.includes(' PBE') ||
          (itemdesc.includes(' SW ') && itemdesc.includes(' SW X') === false)
        )
          itemweld = 'SW'
        // Slip on
        if (itemdesc.includes('FLG PL')) itemweld = 'SO'
        // Olet
        if (itemdesc.includes('SOCKOLET') || itemdesc.includes('THREDOLET') || itemdesc.includes('FLATOLET')) itemweld = 'OLET'
        // Olet by socket weld
        if (itemdesc.includes('WELDOLET')) itemweld = 'OLET X SW'
        // Threaded
        if (itemdesc.includes('MNPT') || itemdesc.includes('FNPT')) itemweld = 'THR'
        // Socket weld by threaded
        if (
          itemdesc.includes('POE X TOE') ||
          itemdesc.includes('PLE X TSE') ||
          itemdesc.includes('SW X FNPT') ||
          itemdesc.includes('SW X MNPT')
        )
          itemweld = 'SW X THR'
        // Butt weld by socket weld
        if (itemdesc.includes('BLE X PSE')) itemweld = 'BW X SW'
        // No weld
        if (itemdesc.includes('BLIND')) itemweld = 'NONE'
        // Add discrepancy if the item piecemark isn't on the line list
        let bompm = line.split(',')[be_pm_col]
        if (
          job.spools.filter((spool) => spool.piecemark === bompm).length === 0 &&
          job.discrepancies.bom_not_line_list.includes(bompm) === false &&
          bompm.includes('SKETCH') === false
        ) {
          job.discrepancies.bom_not_line_list.push(bompm)
        }
        job.spools.map((spool) => {
          // Create item
          if (line.split(',')[be_pm_col] === spool.piecemark) {
            // Assign material to item
            let calcmaterial = ''
            if (spool.material === '' || spool.material === undefined) {
              // Search for material in item
              if (itemdesc.replace(' ', '').includes('304')) calcmaterial = '304'
              else if (itemdesc.replace(' ', '').includes('316')) calcmaterial = '316'
              else if (itemdesc.replace(' ', '').includes('A106')) calcmaterial = 'A106'
              else if (itemdesc.replace(' ', '').includes('A105')) calcmaterial = 'A105'
              else if (itemdesc.replace(' ', '').includes('A53')) calcmaterial = 'A53'
              else if (itemdesc.replace(' ', '').includes('A403')) calcmaterial = 'A403'
              else if (itemdesc.replace(' ', '').includes('A234')) calcmaterial = 'A234'
              else if (itemdesc.replace(' ', '').includes('A587')) calcmaterial = 'A587'
              else if (itemdesc.replace(' ', '').includes('A351')) calcmaterial = 'A351'
              else if (itemdesc.replace(' ', '').includes('A216')) calcmaterial = 'A216'
              else if (itemdesc.replace(' ', '').includes('P22')) calcmaterial = 'P22'
              else if (itemdesc.replace(' ', '').includes('F22')) calcmaterial = 'P22'
              else if (itemdesc.replace(' ', '').includes('P9')) calcmaterial = 'P9'
              else if (itemdesc.replace(' ', '').includes('F9')) calcmaterial = 'P9'
              else if (itemdesc.replace(' ', '').includes('P11')) calcmaterial = 'P11'
              else if (itemdesc.replace(' ', '').includes('F11')) calcmaterial = 'P11'
              else if (itemdesc.replace(' ', '').includes('P91')) calcmaterial = 'P91'
              else if (itemdesc.replace(' ', '').includes('F91')) calcmaterial = 'P91'
              else if (itemdesc.replace(' ', '').includes('P22')) calcmaterial = 'P22'
              else if (itemdesc.replace(' ', '').includes('F22')) calcmaterial = 'P22'
              // Assign item material to spool material
              spool.material = calcmaterial
            } else {
              calcmaterial = spool.material
            }
            // Check if spool name is equal to line list spool name
            let mismatch = undefined
            let bomspool = line.split(',')[be_spool_col].split('/')
            bomspool = bomspool[bomspool.length - 1]
            if (bomspool !== spool.spool) {
              mismatch = bomspool
            }
            spool.items.push({
              tag: line.split(',')[be_tag_col],
              item: line.split(',')[be_item_col],
              quantity: line.split(',')[be_quantity_col],
              size: line
                .split(',')
                [be_size_col].replace('1/2', '.5')
                .replace('1/2', '.5')
                .replace('3/4', '.75')
                .replace('3/4', '.75')
                .replace('4-Mar', '.75')
                .replace('2-Jan', '.5')
                .replace(/\s/g, ''),
              description: itemdesc,
              unit: line.split(',')[be_unit_col],
              pos: line.split(',')[be_position_col],
              status: 'Complete',
              schedule: itemsched,
              class: itemclass,
              material: calcmaterial,
              weld_type: itemweld,
              spool: spool.spool,
              mismatch: mismatch,
              multiplier: spool.multiplier,
              shop: undefined,
            })
            // Push schedule and class to spool
            if (line.split(',')[be_sched_col] !== 'None') spool.schedules.push(line.split(',')[be_sched_col])
            if (
              line.split(',')[be_class_col] === '3000' ||
              line.split(',')[be_class_col] === '6000' ||
              line.split(',')[be_class_col] === '9000'
            )
              spool.classes.push(line.split(',')[be_class_col])
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
    let fc_pm_col = undefined
    let tag_col = undefined
    let position_col = undefined
    let item_col = undefined
    let quantity_col = undefined
    let status_col = undefined
    let po_col = undefined
    let unit_col = undefined

    count = 0

    headers.map((header) => {
      if (header === ' SKETCH') {
        fc_pm_col = count
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
      if (line.split(',')[fc_pm_col] !== '' && line.split(',')[fc_pm_col] !== undefined && count >= first_row) {
        fc_spools.push(line.split(',')[fc_pm_col])
        job.spools.map((spool) => {
          // FIND SPOOL BY MATCHING BOM PATH TO SPOOL NAME
          if (line.split(',')[fc_pm_col].split('/').slice(-1)[0] === spool.piecemark) {
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
            // 7052, 7114, 7116
            if (job.number === '7052' || job.number === '7114' || job.number === '7116') {
              if (line.split(',')[item_col].includes('VALVE')) {
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
            spool.items.map((one) => {
              // Find forecast/bom match and add attributes
              if (one.pos === item.pos) {
                one.status = item.status
                one.po = item.po
                one.quantity = item.quantity
                one.unit = item.unit
              }

              // Set scope to items
              one.scope = 'Other'
              // 6951
              if (job.number === '6951') {
                if (spool.material === 'Chrome') {
                  one.scope = 'Client'
                } else {
                  one.scope = 'Performance'
                }
              }
              // 7052, 7114, 7116
              if (job.number === '7052' || job.number === '7114' || job.number === '7116') {
                if (one.item === 'VALVES / IN-LINE ITEMS') {
                  one.scope = 'Client'
                } else {
                  one.scope = 'Performance'
                }
              }
              return one
            })

            // PUSH SHORTS TO JOB
            if (item.status === 'No Material' || item.status === 'Purchased') {
              if (item.item !== 'PIPE') {
                for (let i = 0; i < item.quantity; i++) {
                  job.shorts.push(item)
                  spool.shorts.push(item.item)
                  spool.workable = false
                  spool.status = 'Not Workable'
                }
              } else {
                job.shorts.push(item)
                spool.shorts.push(item.item)
                spool.workable = false
                spool.status = 'Not Workable'
              }
            }
            // Set spools on hold to Not Workable
            if (spool.on_hold.toUpperCase() === 'HOLD') {
              spool.status = 'On Hold'
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
        return short
      })
      if (fc_spools.includes(spool.piecemark)) {
        if (spool.issued !== undefined && spool.issued !== '' && spool.shorts.length > 0) {
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
      if (each.items.length === 0) {
        each.status = 'Not in SP'
        each.workable = false
      }

      // COUNT ALL STATUSES!
      // TOTAL SPOOLS
      job.total += each.multiplier
      each.status = 'Not Workable'
      // TOTAL WORKABLE
      if (each.workable) {
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
      // SHORTS AFTER ISSUE
      if (each.workable === false) {
        each.status = 'Not Workable'
      }
      // TOTAL ON HOLD
      if (each.on_hold !== '' && each.on_hold !== undefined) {
        job.on_hold += each.multiplier
        each.status = 'On Hold'
        each.workable = false
      }

      // COUNT WORKABLE AFTER ALL OTHER CALCULATIONS
      if (each.workable === true) job.workable += each.multiplier

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
        if (spool.material === material.material && material.areas_list.includes(spool.area) === false) {
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
      if (area.workable / area.spools === 1 || area.workable / area.spools === 0) {
        area.workable_perc = (area.workable / area.spools) * 100
      } else {
        area.workable_perc = ((area.workable / area.spools) * 100).toFixed(1)
      }
      // WELDOUT PERCENTAGE
      if (area.weldout / area.spools === 1 || area.weldout / area.spools === 1) {
        area.weldout_perc = (area.weldout / area.spools) * 100
      } else {
        area.weldout_perc = ((area.weldout / area.spools) * 100).toFixed(1)
      }
      // DELIVERED PERCENTAGE
      if (area.delivered / area.spools === 1 || area.delivered / area.spools === 1) {
        area.delivered_perc = (area.delivered / area.spools) * 100
      } else {
        area.delivered_perc = ((area.delivered / area.spools) * 100).toFixed(1)
      }
      return area
    })

    //ADD INFO TO AREAS FOR EACH MATERIAL
    job.materials.map((material) => {
      material.areas.map((area) => {
        let newspools = job.spools.filter((spool) => spool.material === material.material)
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
        if (area.workable / area.spools === 1 || area.workable / area.spools === 0) {
          area.workable_perc = (area.workable / area.spools) * 100
        } else {
          area.workable_perc = ((area.workable / area.spools) * 100).toFixed(1)
        }
        // WELDOUT PERCENTAGE
        if (area.weldout / area.spools === 1 || area.weldout / area.spools === 1) {
          area.weldout_perc = (area.weldout / area.spools) * 100
        } else {
          area.weldout_perc = ((area.weldout / area.spools) * 100).toFixed(1)
        }
        // DELIVERED PERCENTAGE
        if (area.delivered / area.spools === 1 || area.delivered / area.spools === 1) {
          area.delivered_perc = (area.delivered / area.spools) * 100
        } else {
          area.delivered_perc = ((area.delivered / area.spools) * 100).toFixed(1)
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
          if (start !== '' && finish !== '' && spool.stc !== '' && start !== undefined && finish !== undefined && spool.stc !== undefined) {
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
          if (start !== '' && finish !== '' && start !== undefined && finish !== undefined) {
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

      if (spool.status === 'On Hold') {
        job.status.on_hold += spool.multiplier
      }
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
        dormant.overall[phase].avg = (dormant.overall[phase].total / dormant.overall[phase].spools).toFixed(0)
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
      if (spool.workable === true && spool.issued.includes('/') === false && spool.status !== 'On Hold') {
        job.workable_not_issued += spool.multiplier
      }
      // ISSUED BUT MISSING ITEM
      if (spool.issued.includes('/') && spool.shorts.length > 0) {
        job.issued_missing_item += spool.multiplier
      }
      // ON HOLD NO SHORTS
      if (spool.status === 'On Hold' && spool.shorts.length === 0 && spool.issued.includes('/') === false) {
        job.on_hold_no_shorts += spool.multiplier
      }
      // MISSING VALVE ONLY
      let missing_valves = []
      let missing_items = spool.items.filter((item) => item.status !== 'Complete')
      if (missing_items.length > 0) {
        missing_valves = missing_items.filter((item) => item.item === 'VALVES / IN-LINE ITEMS')
      }
      if (missing_items.length > 0 && missing_items.length === missing_valves.length) {
        spool.missing_valve_only = true
      } else {
        spool.missing_valve_only = false
      }
      // ISSUED ON HOLD
      if (spool.issued.includes('/') && spool.on_hold === 'HOLD') {
        job.issued_on_hold += spool.multiplier
      }

      spool.items.map((item) => {
        item.shop = spool.shop
        return item
      })
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
    let weld_size_col = undefined
    let weld_type_col = undefined
    let weld_pipe_spec_col = undefined
    let weld_pm_col = undefined
    let weld_schedule_col = undefined

    count = 0
    first_row = 1

    headers.map((header) => {
      if (header === 'PIPELINE-REFERENCE') {
        pipeline_col = count
      } else if (header === 'N_S_') {
        weld_size_col = count
      } else if (header === 'WELD-TYPE') {
        weld_type_col = count
      } else if (header === 'SPOOL-ID') {
        weld_pm_col = count
      } else if (header === 'PIPING-SPEC') {
        weld_pipe_spec_col = count
      } else if (header === 'SCHEDULE') {
        weld_schedule_col = count
      }

      count += 1
      return header
    })

    // ADD WELD DATA TO JOB
    count = 0
    lines.map((line) => {
      count += 1
      if (line.split(',')[pipeline_col] !== '' && line.split(',')[pipeline_col] !== undefined && count > first_row) {
        job.spools.map((spool) => {
          if (spool.piecemark === line.split(',')[weld_pm_col]) {
            let weld_type = line.split(',')[weld_type_col].replace('SOF', 'SO').replace('SOB', 'N90')
            // Edit sizes to match manhour codes
            let weld_size = line.split(',')[weld_size_col]
            if (weld_size === '4-Mar') {
              weld_size = '.75'
            }
            if (weld_size === '2-Jan') {
              weld_size = '.5'
            }
            if (weld_size === '4-Jan') {
              weld_size = '.25'
            }
            weld_size = weld_size
              .replace('1/2', '.5')
              .replace('1/2', '.5')
              .replace('1/4', '.25')
              .replace('1/4', '.25')
              .replace('3/4', '.75')
              .replace('3/4', '.75')
              .replace(/\s/g, '')

            let weld_schedule = undefined
            if (line.split(',')[weld_schedule_col] !== '') {
              weld_schedule = line.split(',')[weld_schedule_col]
            }

            // Edit material names to match manhour codes
            let weldmat = spool.material
            if (weldmat.toUpperCase() === 'ALUMINUM') weldmat = 'AL'
            if (weldmat.includes('304') || weldmat.includes('316')) weldmat = 'SS'
            if (weldmat.includes('CS')) weldmat = 'CS'

            // Spools not in SP
            let jobmanhours = undefined
            if (spool.items.length === 0) {
              jobmanhours = 'Not in SP'
            }

            job.welds.push({
              spool: spool.spool,
              piecemark: spool.piecemark,
              spec: line.split(',')[weld_pipe_spec_col],
              size: weld_size,
              type: weld_type,
              material: weldmat,
              schedule: weld_schedule,
              manhours: jobmanhours,
            })
          }
          return spool
        })
      }
      return line
    })

    // SINGLE SCHEDULE WITH NO CLASSES
    const assignSchedules = (job) => {
      job.welds.map((weld) => {
        job.spools.map((spool) => {
          let numscheds = 0
          let listscheds = []
          spool.schedules.map((each) => {
            if (listscheds.includes(each) === false) {
              listscheds.push(each)
              numscheds += 1
            }
            return spool
          })
          spool.items.map((item) => {
            if (
              item.item !== 'SUPPORTS' &&
              spool.piecemark === weld.piecemark &&
              numscheds === 1 &&
              weld.type !== 'SW' &&
              weld.type !== 'N90' &&
              item.schedule !== 'None' &&
              spool.classes.length === 0 &&
              weld.schedule === undefined
            ) {
              weld.schedule = item.schedule

              // Create variables for sched deletion
              let scheditem = item.sched
              let newarray = []

              // Delete item schedfrom spool.schedules
              spool.schedules.map((each) => {
                if (each === scheditem) {
                  scheditem = 'unique'
                } else {
                  newarray.push(each)
                }
                return each
              })
              spool.schedules = newarray
            }
            return item
          })
          return spool
        })
        return weld
      })
    }

    // Classes
    const assignSWs = (job) => {
      job.welds.map((weld) => {
        job.spools.map((spool) => {
          let listclasses = []
          spool.classes.map((one) => {
            if (listclasses.includes(one) === false && one !== undefined) {
              listclasses.push(one)
            }
            return one
          })
          if (spool.piecemark === weld.piecemark && weld.type === 'SW' && listclasses.length === 1 && weld.schedule === undefined) {
            // Assign class to weld
            weld.schedule = listclasses[0]
          }
          return spool
        })
        return weld
      })
    }

    // Classes
    const assignClasses = (job) => {
      job.welds.map((weld) => {
        job.spools.map((spool) => {
          spool.items.map((item) => {
            if (
              item.item !== 'SUPPORTS' &&
              spool.piecemark === weld.piecemark &&
              item.size === weld.size &&
              item.weld_type === weld.type &&
              // Material options
              (spool.material === weld.material ||
                (spool.material.includes('304/304L SS') && weld.material === 'SS') ||
                (spool.material === 'A333' && weld.material === 'CS') ||
                (spool.material === 'ALUMINUM' && weld.material === 'AL')) &&
              item.class !== '' &&
              spool.classes.includes(item.class)
            ) {
              // Assign class to weld
              weld.schedule = item.class

              // Create variables for class deletion
              let classitem = item.class
              let newarray = []

              // Delete item class from spool.classes
              spool.classes.map((each) => {
                if (each === classitem) {
                  classitem = 'unique'
                } else {
                  newarray.push(each)
                }
                return each
              })
              spool.classes = newarray
            }
            return item
          })
          return spool
        })
        return weld
      })
    }

    // Mulitple schedules
    const multipleSchedules = (job) => {
      job.welds.map((weld) => {
        job.spools.map((spool) => {
          spool.items.map((item) => {
            if (
              item.item !== 'SUPPORTS' &&
              spool.piecemark === weld.piecemark &&
              item.size === weld.size &&
              weld.type !== 'N90' &&
              // Material options
              (spool.material === weld.material ||
                (spool.material.includes('304/304L SS') && weld.material === 'SS') ||
                (spool.material === 'A333' && weld.material === 'CS') ||
                (spool.material === 'ALUMINUM' && weld.material === 'AL')) &&
              item.schedule !== 'None' &&
              weld.type !== 'SW' &&
              weld.schedule === undefined
            ) {
              weld.schedule = item.schedule

              // Create variables for sched deletion
              let scheditem = item.sched
              let newarray = []

              // Delete item schedfrom spool.schedules
              spool.schedules.map((each) => {
                if (each === scheditem) {
                  scheditem = 'unique'
                } else {
                  newarray.push(each)
                }
                return each
              })
              spool.schedules = newarray
            }
            return item
          })
          return spool
        })
        return weld
      })
    }

    assignSchedules(job)
    assignSWs(job)
    assignClasses(job)
    assignSchedules(job)
    assignSWs(job)
    assignClasses(job)
    assignSchedules(job)
    assignSWs(job)
    assignClasses(job)
    multipleSchedules(job)

    // Extra calculations
    job.spools.map((spool) => {
      job.welds.map((weld) => {
        // Match spool and weld and search only welds that are missing a schedule
        if (spool.piecemark === weld.piecemark) {
          // Fill in blank socket welds with #6000
          if (weld.schedule === undefined && weld.type === 'SW') {
            weld.schedule = '6000'
          }
          // Grab schedule of header for olets
          if (weld.schedule === undefined && weld.type === 'OLET') {
            let listscheds = []
            spool.items.map((item) => {
              if (listscheds.includes(item.schedule) === false && item.schedule !== 'None') {
                listscheds.push(item.schedule)
              }
              return item
            })
            if (listscheds.length === 1) {
              weld.schedule = listscheds[0]
            }
          }
          // Grab class for SOs
          if (weld.type === 'SO') {
            weld.schedule = undefined
            let listclasses = []
            spool.items.map((item) => {
              if (
                listclasses.includes(item.class) === false &&
                (item.class === '150' || item.class === '300' || item.class === '400' || item.class === '600' || item.class === '900')
              ) {
                listclasses.push(item.class)
              }
              return item
            })
            if (listclasses.length === 1) {
              weld.schedule = listclasses[0]
            }
          }
          // Grab schedule for N90s
          if (weld.type === 'N90' && weld.schedule === undefined) {
            let maxuse = 0
            spool.items.map((item) => {
              if (item.item === 'PIPE' && item.quantity > maxuse && item.schedule !== 'None') {
                weld.schedule = item.schedule
              }
              return item
            })
          }
        }
        return weld
      })
      return spool
    })

    // Man hour codes
    const res_mh = await axios.get('/api/csvs/manhour_codes')
    let manhour_codes_csv = res_mh.data

    // Find headers from manhour codes csv
    lines = manhour_codes_csv.split('\n')
    header = lines[0]
    headers = header.split(',')

    let mh_codes = []
    count = 0

    lines.map((line) => {
      count += 1
      if (line.split(',')[4] !== undefined && count > 1) {
        mh_codes.push({
          code: line.split(',')[4],
          hours: line.split(',')[5],
        })
      }
      return line
    })

    // Match weld data to man hour codes
    job.welds.map((weld) => {
      mh_codes.map((code) => {
        if (weld.size + weld.type + weld.material + weld.schedule === code.code) {
          weld.manhours = parseFloat(code.hours, 2)
        }
        return code
      })
      return weld
    })

    // Add hours to spool
    job.welds.map((weld) => {
      job.spools.map((spool) => {
        if (spool.spool === weld.spool) {
          spool.welds += 1
          if (weld.manhours !== undefined && weld.manhours !== 'Not in SP' && weld.schedule !== 'Omit') {
            spool.manhours += weld.manhours
            spool.welds_counted += 1
          }
          // Workable man hours
          if (
            (spool.status === 'Workable' || spool.status === 'Issued' || spool.status === 'Pulled') &&
            weld.manhours !== 'Not in SP' &&
            weld.schedule !== 'Omit'
          ) {
            job.workable_manhours += weld.manhours
            if (spool.material.includes('304') || spool.material.includes('316') || spool.material.toUpperCase().includes('ALUM')) {
              job.workable_manhours_ss += weld.manhours
            } else {
              job.workable_manhours_cs += weld.manhours
            }
          }
        }
        return spool
      })
      return weld
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
      workable_manhours: job.workable_manhours.toFixed(2),
      workable_manhours_ss: job.workable_manhours_ss.toFixed(2),
      workable_manhours_cs: job.workable_manhours_cs.toFixed(2),
      issued_on_hold: job.issued_on_hold,
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
      if (spoollist.includes(each.spool) === false && each.item === 'VALVES / IN-LINE ITEMS') {
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
      if (spoollist.includes(each.spool) === false && each.item === 'FITTINGS') {
        spoollist.push(each.spool)
        spools_fittings.push(each)
      }
      return each
    })
    job.shorts.map((each) => {
      if (spoollist.includes(each.spool) === false && each.item === 'SUPPORTS') {
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
    summary.spools_by_scope.valves.performance = countSpools(spools_valves.filter((spool) => spool.scope === 'Performance'))
    summary.spools_by_scope.valves.client = countSpools(spools_valves.filter((spool) => spool.scope === 'Client'))
    summary.spools_by_scope.valves.other = countSpools(spools_valves.filter((spool) => spool.scope === 'Other'))
    summary.spools_by_scope.valves.total = countSpools(spools_valves)
    // PIPE
    summary.spools_by_scope.pipe.performance = countSpools(spools_pipe.filter((spool) => spool.scope === 'Performance'))
    summary.spools_by_scope.pipe.client = countSpools(spools_pipe.filter((spool) => spool.scope === 'Client'))
    summary.spools_by_scope.pipe.other = countSpools(spools_pipe.filter((spool) => spool.scope === 'Other'))
    summary.spools_by_scope.pipe.total = countSpools(spools_pipe)
    // FLANGES
    summary.spools_by_scope.flanges.performance = countSpools(spools_flanges.filter((spool) => spool.scope === 'Performance'))
    summary.spools_by_scope.flanges.client = countSpools(spools_flanges.filter((spool) => spool.scope === 'Client'))
    summary.spools_by_scope.flanges.other = countSpools(spools_flanges.filter((spool) => spool.scope === 'Other'))
    summary.spools_by_scope.flanges.total = countSpools(spools_flanges)
    // FITTINGS
    summary.spools_by_scope.fittings.performance = countSpools(spools_fittings.filter((spool) => spool.scope === 'Performance'))
    summary.spools_by_scope.fittings.client = countSpools(spools_fittings.filter((spool) => spool.scope === 'Client'))
    summary.spools_by_scope.fittings.other = countSpools(spools_fittings.filter((spool) => spool.scope === 'Other'))
    summary.spools_by_scope.fittings.total = countSpools(spools_fittings)
    // SUPPORTS
    summary.spools_by_scope.supports.performance = countSpools(spools_supports.filter((spool) => spool.scope === 'Performance'))
    summary.spools_by_scope.supports.client = countSpools(spools_supports.filter((spool) => spool.scope === 'Client'))
    summary.spools_by_scope.supports.other = countSpools(spools_supports.filter((spool) => spool.scope === 'Other'))
    summary.spools_by_scope.supports.total = countSpools(spools_supports)

    // COUNT UP DISCREPANCIES
    summary.spools_by_scope.discrepancies =
      job.discrepancies.fc_not_ll.length +
      job.discrepancies.sr_not_ll.length +
      job.discrepancies.notfc_notiss.length +
      job.discrepancies.fc_iss.length +
      job.discrepancies.bom_not_line_list.length

    // SHORTS
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // NO MATERIAL
    // VALVES
    summary.count_shorts.no_material.valves.performance = summary.shorts.filter(
      (short) => short.item === 'VALVES / IN-LINE ITEMS' && short.status === 'No Material' && short.scope === 'Performance'
    ).length
    summary.count_shorts.no_material.valves.client = summary.shorts.filter(
      (short) => short.item === 'VALVES / IN-LINE ITEMS' && short.status === 'No Material' && short.scope === 'Client'
    ).length
    summary.count_shorts.no_material.valves.other = summary.shorts.filter(
      (short) => short.item === 'VALVES / IN-LINE ITEMS' && short.status === 'No Material' && short.scope === 'Other'
    ).length
    summary.count_shorts.no_material.valves.total = summary.shorts.filter(
      (short) => short.item === 'VALVES / IN-LINE ITEMS' && short.status === 'No Material'
    ).length
    // PIPE
    let count_pipe = 0
    summary.shorts.filter((short) => {
      if (short.item === 'PIPE' && short.status === 'No Material' && short.scope === 'Performance') {
        count_pipe += parseFloat(short.quantity)
      }
      return short
    })
    summary.count_shorts.no_material.pipe.performance = parseFloat(count_pipe.toFixed(1))
    count_pipe = 0
    summary.shorts.filter((short) => {
      if (short.item === 'PIPE' && short.status === 'No Material' && short.scope === 'Client') {
        count_pipe += parseFloat(short.quantity)
      }
      return short
    })
    summary.count_shorts.no_material.pipe.client = parseFloat(count_pipe.toFixed(1))
    count_pipe = 0
    summary.shorts.filter((short) => {
      if (short.item === 'PIPE' && short.status === 'No Material' && short.scope === 'Other') {
        count_pipe += parseFloat(short.quantity)
      }
      return short
    })
    summary.count_shorts.no_material.pipe.other = parseFloat(count_pipe.toFixed(1))
    count_pipe = 0
    summary.shorts.filter((short) => {
      if (short.item === 'PIPE' && short.status === 'No Material') {
        count_pipe += parseFloat(short.quantity)
      }
      return short
    })
    summary.count_shorts.no_material.pipe.total = parseFloat(count_pipe.toFixed(1))
    // FLANGES
    summary.count_shorts.no_material.flanges.performance = summary.shorts.filter(
      (short) => short.item === 'FLANGES' && short.status === 'No Material' && short.scope === 'Performance'
    ).length
    summary.count_shorts.no_material.flanges.client = summary.shorts.filter(
      (short) => short.item === 'FLANGES' && short.status === 'No Material' && short.scope === 'Client'
    ).length
    summary.count_shorts.no_material.flanges.other = summary.shorts.filter(
      (short) => short.item === 'FLANGES' && short.status === 'No Material' && short.scope === 'Other'
    ).length
    summary.count_shorts.no_material.flanges.total = summary.shorts.filter(
      (short) => short.item === 'FLANGES' && short.status === 'No Material'
    ).length
    // FITTINGS
    summary.count_shorts.no_material.fittings.performance = summary.shorts.filter(
      (short) => short.item === 'FITTINGS' && short.status === 'No Material' && short.scope === 'Performance'
    ).length
    summary.count_shorts.no_material.fittings.client = summary.shorts.filter(
      (short) => short.item === 'FITTINGS' && short.status === 'No Material' && short.scope === 'Client'
    ).length
    summary.count_shorts.no_material.fittings.other = summary.shorts.filter(
      (short) => short.item === 'FITTINGS' && short.status === 'No Material' && short.scope === 'Other'
    ).length
    summary.count_shorts.no_material.fittings.total = summary.shorts.filter(
      (short) => short.item === 'FITTINGS' && short.status === 'No Material'
    ).length
    // SUPPORTS
    summary.count_shorts.no_material.supports.performance = summary.shorts.filter(
      (short) => short.item === 'SUPPORTS' && short.status === 'No Material' && short.scope === 'Performance'
    ).length
    summary.count_shorts.no_material.supports.client = summary.shorts.filter(
      (short) => short.item === 'SUPPORTS' && short.status === 'No Material' && short.scope === 'Client'
    ).length
    summary.count_shorts.no_material.supports.other = summary.shorts.filter(
      (short) => short.item === 'SUPPORTS' && short.status === 'No Material' && short.scope === 'Other'
    ).length
    summary.count_shorts.no_material.supports.total = summary.shorts.filter(
      (short) => short.item === 'SUPPORTS' && short.status === 'No Material'
    ).length

    // PURCHASED
    // VALVES
    summary.count_shorts.purchased.valves.performance = summary.shorts.filter(
      (short) => short.item === 'VALVES / IN-LINE ITEMS' && short.status === 'Purchased' && short.scope === 'Performance'
    ).length
    summary.count_shorts.purchased.valves.client = summary.shorts.filter(
      (short) => short.item === 'VALVES / IN-LINE ITEMS' && short.status === 'Purchased' && short.scope === 'Client'
    ).length
    summary.count_shorts.purchased.valves.other = summary.shorts.filter(
      (short) => short.item === 'VALVES / IN-LINE ITEMS' && short.status === 'Purchased' && short.scope === 'Other'
    ).length
    summary.count_shorts.purchased.valves.total = summary.shorts.filter(
      (short) => short.item === 'VALVES / IN-LINE ITEMS' && short.status === 'Purchased'
    ).length
    // PIPE
    count_pipe = 0
    summary.shorts.filter((short) => {
      if (short.item === 'PIPE' && short.status === 'Purchased' && short.scope === 'Performance') {
        count_pipe += parseFloat(short.quantity)
      }
      return short
    })
    summary.count_shorts.purchased.pipe.performance = parseFloat(count_pipe.toFixed(1))
    count_pipe = 0
    summary.shorts.filter((short) => {
      if (short.item === 'PIPE' && short.status === 'Purchased' && short.scope === 'Client') {
        count_pipe += parseFloat(short.quantity)
      }
      return short
    })
    summary.count_shorts.purchased.pipe.client = parseFloat(count_pipe.toFixed(1))
    count_pipe = 0
    summary.shorts.filter((short) => {
      if (short.item === 'PIPE' && short.status === 'Purchased' && short.scope === 'Other') {
        count_pipe += parseFloat(short.quantity)
      }
      return short
    })
    summary.count_shorts.purchased.pipe.other = parseFloat(count_pipe.toFixed(1))
    count_pipe = 0
    summary.shorts.filter((short) => {
      if (short.item === 'PIPE' && short.status === 'Purchased') {
        count_pipe += parseFloat(short.quantity)
      }
      return short
    })
    summary.count_shorts.purchased.pipe.total = parseFloat(count_pipe.toFixed(1))
    // FLANGES
    summary.count_shorts.purchased.flanges.performance = summary.shorts.filter(
      (short) => short.item === 'FLANGES' && short.status === 'Purchased' && short.scope === 'Performance'
    ).length
    summary.count_shorts.purchased.flanges.client = summary.shorts.filter(
      (short) => short.item === 'FLANGES' && short.status === 'Purchased' && short.scope === 'Client'
    ).length
    summary.count_shorts.purchased.flanges.other = summary.shorts.filter(
      (short) => short.item === 'FLANGES' && short.status === 'Purchased' && short.scope === 'Other'
    ).length
    summary.count_shorts.purchased.flanges.total = summary.shorts.filter(
      (short) => short.item === 'FLANGES' && short.status === 'Purchased'
    ).length
    // FITTINGS
    summary.count_shorts.purchased.fittings.performance = summary.shorts.filter(
      (short) => short.item === 'FITTINGS' && short.status === 'Purchased' && short.scope === 'Performance'
    ).length
    summary.count_shorts.purchased.fittings.client = summary.shorts.filter(
      (short) => short.item === 'FITTINGS' && short.status === 'Purchased' && short.scope === 'Client'
    ).length
    summary.count_shorts.purchased.fittings.other = summary.shorts.filter(
      (short) => short.item === 'FITTINGS' && short.status === 'Purchased' && short.scope === 'Other'
    ).length
    summary.count_shorts.purchased.fittings.total = summary.shorts.filter(
      (short) => short.item === 'FITTINGS' && short.status === 'Purchased'
    ).length
    // SUPPORTS
    summary.count_shorts.purchased.supports.performance = summary.shorts.filter(
      (short) => short.item === 'SUPPORTS' && short.status === 'Purchased' && short.scope === 'Performance'
    ).length
    summary.count_shorts.purchased.supports.client = summary.shorts.filter(
      (short) => short.item === 'SUPPORTS' && short.status === 'Purchased' && short.scope === 'Client'
    ).length
    summary.count_shorts.purchased.supports.other = summary.shorts.filter(
      (short) => short.item === 'SUPPORTS' && short.status === 'Purchased' && short.scope === 'Other'
    ).length
    summary.count_shorts.purchased.supports.total = summary.shorts.filter(
      (short) => short.item === 'SUPPORTS' && short.status === 'Purchased'
    ).length

    // TOTAL SHORTS
    // PERFORMANCE
    summary.count_shorts.total.valves.performance =
      summary.count_shorts.no_material.valves.performance + summary.count_shorts.purchased.valves.performance

    summary.count_shorts.total.pipe.performance =
      summary.count_shorts.no_material.pipe.performance + summary.count_shorts.purchased.pipe.performance

    summary.count_shorts.total.flanges.performance =
      summary.count_shorts.no_material.flanges.performance + summary.count_shorts.purchased.flanges.performance

    summary.count_shorts.total.fittings.performance =
      summary.count_shorts.no_material.fittings.performance + summary.count_shorts.purchased.fittings.performance

    summary.count_shorts.total.supports.performance =
      summary.count_shorts.no_material.supports.performance + summary.count_shorts.purchased.supports.performance
    // CLIENT
    summary.count_shorts.total.valves.client = summary.count_shorts.no_material.valves.client + summary.count_shorts.purchased.valves.client

    summary.count_shorts.total.pipe.client = summary.count_shorts.no_material.pipe.client + summary.count_shorts.purchased.pipe.client

    summary.count_shorts.total.flanges.client =
      summary.count_shorts.no_material.flanges.client + summary.count_shorts.purchased.flanges.client

    summary.count_shorts.total.fittings.client =
      summary.count_shorts.no_material.fittings.client + summary.count_shorts.purchased.fittings.client

    summary.count_shorts.total.supports.client =
      summary.count_shorts.no_material.supports.client + summary.count_shorts.purchased.supports.client
    // OTHER
    summary.count_shorts.total.valves.other = summary.count_shorts.no_material.valves.other + summary.count_shorts.purchased.valves.other

    summary.count_shorts.total.pipe.other = summary.count_shorts.no_material.pipe.other + summary.count_shorts.purchased.pipe.other

    summary.count_shorts.total.flanges.other = summary.count_shorts.no_material.flanges.other + summary.count_shorts.purchased.flanges.other

    summary.count_shorts.total.fittings.other =
      summary.count_shorts.no_material.fittings.other + summary.count_shorts.purchased.fittings.other

    summary.count_shorts.total.supports.other =
      summary.count_shorts.no_material.supports.other + summary.count_shorts.purchased.supports.other
    // TOTAL
    summary.count_shorts.total.valves.total = summary.count_shorts.no_material.valves.total + summary.count_shorts.purchased.valves.total

    summary.count_shorts.total.pipe.total = summary.count_shorts.no_material.pipe.total + summary.count_shorts.purchased.pipe.total

    summary.count_shorts.total.flanges.total = summary.count_shorts.no_material.flanges.total + summary.count_shorts.purchased.flanges.total

    summary.count_shorts.total.fittings.total =
      summary.count_shorts.no_material.fittings.total + summary.count_shorts.purchased.fittings.total

    summary.count_shorts.total.supports.total =
      summary.count_shorts.no_material.supports.total + summary.count_shorts.purchased.supports.total

    // SPOOL MISSING VALVE ONLY
    summary.count_shorts.missing_valve_only.performance = summary.spools.filter(
      (spool) => spool.missing_valve_only === true && spool.scope === 'Performance'
    ).length
    summary.count_shorts.missing_valve_only.client = summary.spools.filter(
      (spool) => spool.missing_valve_only === true && spool.scope === 'Client'
    ).length
    summary.count_shorts.missing_valve_only.other = summary.spools.filter(
      (spool) => spool.missing_valve_only === true && spool.scope === 'Other'
    ).length
    summary.count_shorts.missing_valve_only.total = summary.spools.filter((spool) => spool.missing_valve_only === true).length

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
    event.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null)
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
