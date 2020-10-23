import axios from 'axios'
import XLSX from 'xlsx'
import { saveAs } from 'file-saver'

import { COMPARE_ITEMS } from '../actions/types'

export const compareItems = () => async (dispatch) => {
  // Grab input file data
  const res = await axios.get('/api/xlsx/input')
  let sp_data = res.data
  let sp_items = sp_data.rows
  let jobnum = sp_data.jobnum
  let type = sp_data.type

  // Add universal key names
  sp_items.map((sp_item) => {
    const addProps = (oldkey, newkey) => {
      if (sp_item[newkey] === undefined && sp_item[oldkey] !== undefined) sp_item[newkey] = sp_item[oldkey]
    }

    addProps('BOM PATH', 'sketch')
    addProps('SPOOL-ID', 'sketch')
    addProps('SISKETCH', 'sketch')
    addProps(' TAG NUMBER', 'tag')
    addProps('ITEM_NUMBER', 'tag')
    addProps('SBBOMPARTN', 'tag')
    addProps('SIZE', 'size')
    addProps(' SIZE', 'size')
    addProps('SIZE', 'origsize')
    addProps(' SIZE', 'origsize')
    addProps('SBBOMSIZE', 'size')
    addProps('SBBOMMATL', 'description')
    addProps('DESCRIPTION', 'description')
    addProps(' DESCRIPTION', 'description')
    addProps('GROUP', 'item')
    addProps('GROUP-PERF', 'item')
    addProps(' GROUP-PERF', 'item')
    addProps('PIPING-SPEC', 'spec')
    addProps('SILINESPEC', 'spec')
    addProps(' SPEC', 'spec')
    addProps(' SKETCH', 'spool')
  })

  // Remove items that don't go into SP MAT
  sp_items = sp_items.filter(
    (item) => item['SBMATLCLAS'] !== 'CUTPIPE' && item.sketch !== undefined && item.size !== undefined && item.tag !== undefined
  )

  // Iterate items for all jobs
  sp_items.map((sp_item) => {
    // Sketch
    sp_item.sketch = sp_item.sketch.split('/')[sp_item.sketch.split('/').length - 1]
    // Description
    sp_item.newdesc = sp_item.description.toUpperCase().replaceAll('SCH ', 'S-').replaceAll('STD WT', 'STD')
    // Material
    if (sp_item.newdesc.includes(' CS ') || sp_item.newdesc.includes('-CS ')) sp_item.material = 'CS'
    if (sp_item.newdesc.includes('A105')) sp_item.material = 'A105'
    if (sp_item.newdesc.includes('A53')) sp_item.material = 'A53'
    if (sp_item.newdesc.includes('A403')) sp_item.material = 'A403'
    if (sp_item.newdesc.includes('A234')) sp_item.material = 'A234'
    if (sp_item.newdesc.includes('A587')) sp_item.material = 'A587'
    if (sp_item.newdesc.includes('A106')) sp_item.material = 'A106'
    if (sp_item.newdesc.includes('A671')) sp_item.material = 'A671'
    if (sp_item.tag.includes('CS-')) sp_item.material = 'CS'
    if (sp_item.tag.includes('CSW-')) sp_item.material = 'CS'
    if (sp_item.tag.includes('A106-')) sp_item.material = 'A106'
    if (sp_item.tag.includes('A106W-')) sp_item.material = 'A106'
    if (sp_item.tag.includes('A53-')) sp_item.material = 'A53'
    if (sp_item.tag.includes('A53W-')) sp_item.material = 'A53'
    if (
      sp_item.newdesc.includes('F22') ||
      sp_item.newdesc.includes('F 22') ||
      sp_item.newdesc.includes('P22') ||
      sp_item.newdesc.includes('P 22') ||
      sp_item.newdesc.includes('WP22')
    )
      sp_item.material = 'P22'
    if (
      sp_item.newdesc.includes('F11') ||
      sp_item.newdesc.includes('F 11') ||
      sp_item.newdesc.includes('P11') ||
      sp_item.newdesc.includes('P 11') ||
      sp_item.newdesc.includes('WP11')
    )
      sp_item.material = 'P11'
    if (
      sp_item.newdesc.includes('P9') ||
      sp_item.newdesc.includes('P 9') ||
      sp_item.newdesc.includes('F9') ||
      sp_item.newdesc.includes('F 9')
    )
      sp_item.material = 'P9'

    if (
      sp_item.newdesc.includes('P91') ||
      sp_item.newdesc.includes('F 91') ||
      sp_item.newdesc.includes('P 91') ||
      sp_item.newdesc.includes('F91')
    )
      sp_item.material = 'P91'

    if (sp_item.newdesc.includes('304')) sp_item.material = '304'
    if (sp_item.newdesc.includes('316')) sp_item.material = '316'
    if (sp_item.newdesc.includes('A333') || sp_item.newdesc.includes('A420')) sp_item.material = 'LT'
    // Item detail
    if (
      sp_item.newdesc.includes(' SW ') ||
      sp_item.newdesc.includes(' PE,') ||
      sp_item.newdesc.includes(' PBE ') ||
      sp_item.newdesc.includes(' SWE ') ||
      sp_item.newdesc.includes(' PE ')
    )
      sp_item.end_type = 'Plain'

    if (
      sp_item.newdesc.includes(' BW ') ||
      sp_item.newdesc.includes(' BE,') ||
      sp_item.newdesc.includes(' BW-') ||
      sp_item.newdesc.includes(' BE ')
    )
      sp_item.end_type = 'Beveled'

    if (sp_item.newdesc.includes(' PXT') || sp_item.newdesc.includes(' TXP')) sp_item.end_type = 'Plain x Threaded'
    if (sp_item.newdesc.includes(' BXT') || sp_item.newdesc.includes(' TXB')) sp_item.end_type = 'Beveled x Threaded'
    if (sp_item.newdesc.includes(' BXP') || sp_item.newdesc.includes(' TBE')) sp_item.end_type = 'Beveled x Plain'
    if (sp_item.newdesc.includes(' NPT')) sp_item.end_type = 'Threaded'
    // Item detail
    // Weldneck Flange
    if (sp_item.newdesc.includes('WN ') || sp_item.newdesc.includes('NECK ')) sp_item.item_detail = 'Weldneck Flange'
    // Oriface Flange
    if (sp_item.newdesc.includes('OFIF')) sp_item.item_detail = 'Oriface Flange'
    // Blind Flange
    if (sp_item.newdesc.includes('BLIND') || sp_item.newdesc.includes('BLD ')) sp_item.item_detail = 'Blind Flange'
    // Slip On Flange
    if (sp_item.newdesc.includes('SLIP') || sp_item.newdesc.includes(' SO ')) sp_item.item_detail = 'Slip On Flange'
    // Lap Joint Flange
    if (sp_item.newdesc.includes(' LAP')) sp_item.item_detail = 'Lap Joint Flange'
    // Threaded Flange
    if (sp_item.newdesc.includes('THR') && sp_item.newdesc.includes('FL')) sp_item.item_detail = 'Threaded Flange'
    // Socketweld Flange
    if (sp_item.newdesc.includes('SW') && sp_item.newdesc.includes('FL')) sp_item.item_detail = 'Socketweld Flange'
    // Stub End Flange
    if (sp_item.newdesc.includes('STUB')) sp_item.item_detail = 'Stub End Flange'
    // Sockolet
    if (sp_item.newdesc.includes('SOCKO')) sp_item.item_detail = 'Sockolet'
    // Weldolet
    if (sp_item.newdesc.includes('WELDO')) sp_item.item_detail = 'Weldolet'
    // Thredolet
    if (sp_item.newdesc.includes('THREADO') || sp_item.newdesc.includes('THREDO')) sp_item.item_detail = 'Thredolet'
    // Flatolet
    if (sp_item.newdesc.includes('FLATO')) sp_item.item_detail = 'Flatolet'
    // Elbolet
    if (sp_item.newdesc.includes('ELBOLET')) sp_item.item_detail = 'Elbolet'
    // Latrolet
    if (sp_item.newdesc.includes('LATRO')) sp_item.item_detail = 'Latrolet'
    // Concentric Reducer
    if (sp_item.newdesc.includes('CON') && (sp_item.newdesc.includes('RED ') || sp_item.newdesc.includes('REDUCER')))
      sp_item.item_detail = 'Concentric Reducer'
    // Eccentric Reducer
    if (sp_item.newdesc.includes('ECC') && (sp_item.newdesc.includes('RED ') || sp_item.newdesc.includes('REDUCER')))
      sp_item.item_detail = 'Concentric Reducer'
    // Elbows
    if (sp_item.newdesc.includes('ELBOW') || sp_item.newdesc.includes('ELL ')) {
      if (sp_item.newdesc.includes('90')) sp_item.item_detail = '90 Degree Elbow'
      if (sp_item.newdesc.includes('45')) sp_item.item_detail = '45 Degree Elbow'
      if (sp_item.newdesc.includes('SR ') || sp_item.newdesc.includes('SHORT')) {
        sp_item.item_detail = sp_item.item_detail + ' - Short'
      }
    }
    // Nipple
    if (sp_item.newdesc.includes('NIPP')) sp_item.item_detail = 'Nipple'
    // Tee
    if (sp_item.newdesc.includes('TEE')) sp_item.item_detail = 'Tee'
    // Concentric Swage
    if (sp_item.newdesc.includes('CON') || sp_item.newdesc.includes('SWAGE')) sp_item.item_detail = 'Concentric Swage'
    // Eccentric Swage
    if (sp_item.newdesc.includes('ECC') || sp_item.newdesc.includes('SWAGE')) sp_item.item_detail = 'Eccentric Swage'
    // Cap
    if (sp_item.newdesc.includes('CAP ') || sp_item.newdesc.includes('CAP,') || sp_item.newdesc.includes('CAP;'))
      sp_item.item_detail = 'Cap'
    // Union
    if (sp_item.newdesc.includes('UNION')) sp_item.item_detail = 'Union'
    // Coupling
    if (sp_item.newdesc.includes('CPLG') || sp_item.newdesc.includes('COUP')) sp_item.item_detail = 'Coupling'
    // Strainer
    if (sp_item.newdesc.includes('STRAIN')) sp_item.item_detail = 'Strainer'
    // Plug
    if (sp_item.newdesc.includes('PLUG')) sp_item.item_detail = 'Plug'
    // Gasket
    if (sp_item.newdesc.includes('GASK')) sp_item.item_detail = 'Gasket'
    // Union
    if (sp_item.newdesc.includes('OUTLET')) {
      if (sp_item.newdesc.includes('SW')) sp_item.item_detail = 'Sockolet'
      if (sp_item.newdesc.includes('BE')) sp_item.item_detail = 'Weldolet'
    }
    // Reinforcment Pad
    if (sp_item.newdesc.includes('REINFORCE')) sp_item.item_detail = 'Reinforcment Pad'
    // Insert
    if (sp_item.newdesc.includes('SW INSERT')) sp_item.item_detail = 'Insert'
    // Cross
    if (sp_item.newdesc.includes('CROSS')) sp_item.item_detail = 'Cross'
    // Pipe
    if (sp_item.newdesc.includes('PIPE ')) sp_item.item_detail = 'Pipe'
    // Seam
    if (sp_item.newdesc.includes('WELDED')) sp_item.seam = 'Welded'
    if (sp_item.material === '316' && sp_item.end_type === 'Plain') sp_item.seam = 'Welded'
    if (sp_item.newdesc.includes('ERW')) sp_item.seam = 'Welded'
    if (sp_item.newdesc.includes('ELECTRIC FUSION')) sp_item.seam = 'Welded'
    if (sp_item.newdesc.includes('TYPE W,')) sp_item.seam = 'Welded'
    if (sp_item.newdesc.includes('SMLS OR WELDED')) sp_item.seam = undefined
    if (sp_item.newdesc.includes('SOCKET WELDED')) sp_item.seam = undefined
    if (sp_item.newdesc.includes('100% RAD')) sp_item.seam = 'Welded X-Ray'
    // Size
    sp_item.size = sp_item.size
      .replaceAll('X', 'x')
      .replaceAll('"', '')
      .replaceAll('0.', '.')
      .replaceAll('1 1/2', '1.5')
      .replaceAll('1 1/4', '1.25')
      .replaceAll('3 1/8', '3.125')
      .replaceAll('1 3/4', '1.75')
      .replaceAll('2 1/2', '2.5')
      .replaceAll('3/4', '.75')
      .replaceAll('1/2', '.5')
      .replaceAll('1/4', '.25')
    if (sp_item.size.includes('x') && sp_item.size.split('x')[0] < sp_item.size.split('x')[1] && sp_item.item_detail !== 'Nipple')
      sp_item.size = sp_item.size.split('x')[1] + 'x' + sp_item.size.split('x')[0]
    if (sp_item.item_detail !== undefined)
      if (sp_item.item_detail.includes('Elbow') && sp_item.size.includes('x')) sp_item.size = sp_item.size.split('x')[0]
    if (sp_item.item_detail === 'Tee' && sp_item.size.includes('x')) {
      if (sp_item.size.split('x')[0] > sp_item.size.split('x')[1]) sp_item.item_detail = 'Reducing Tee'
    } else if (sp_item.size.split('x')[0] === sp_item.size.split('x')[1]) sp_item.size = sp_item.size.split('x')[0]
    // Shcedule
    //CALC
    if (sp_item.newdesc.includes('CALC,')) sp_item.schedule = 'CALC'
    //10S
    if (sp_item.newdesc.includes('S-10S') || sp_item.newdesc.includes(' 10S ')) sp_item.schedule = '10S'
    //80
    if (sp_item.newdesc.includes('S-80') || sp_item.newdesc.includes(' 80 ')) sp_item.schedule = '80'
    //40
    if (sp_item.newdesc.includes('S-40') || sp_item.newdesc.includes(' 40 ')) sp_item.schedule = '40'
    //40S
    if (sp_item.newdesc.includes('S-40S') || sp_item.newdesc.includes(' 40S ')) sp_item.schedule = '40S'
    //STD
    if (sp_item.newdesc.includes(',STD') || sp_item.newdesc.includes(' STD')) sp_item.schedule = 'STD'
    //XS
    if (sp_item.newdesc.includes('S-XS') || sp_item.newdesc.includes(' XS ') || sp_item.newdesc.includes(' XH ')) sp_item.schedule = 'XS'
    //STD X XS
    if (sp_item.newdesc.includes('STD X XS')) sp_item.schedule = 'STDXXS'
    //40S X 10S
    if (sp_item.newdesc.includes('40S X 10S') || sp_item.newdesc.includes('S-40S X S-10S')) sp_item.schedule = '40SX10S'
    //10S X 40S
    if (sp_item.newdesc.includes('10S X 40S') || sp_item.newdesc.includes('S-10S X S-40S')) sp_item.schedule = '10SX40S'
    // Class
    if (
      sp_item.newdesc.includes('CL150') ||
      sp_item.newdesc.includes('CLASS 150') ||
      sp_item.newdesc.includes('150#') ||
      sp_item.newdesc.includes('150 LBS')
    )
      sp_item.class = '150'
    if (
      sp_item.newdesc.includes('CL300') ||
      sp_item.newdesc.includes('CLASS 300') ||
      sp_item.newdesc.includes('300#') ||
      sp_item.newdesc.includes('300 LBS')
    )
      sp_item.class = '300'
    if (
      sp_item.newdesc.includes('CL600') ||
      sp_item.newdesc.includes('CLASS 600') ||
      sp_item.newdesc.includes('600#') ||
      sp_item.newdesc.includes('600 LBS')
    )
      sp_item.class = '600'
    if (
      sp_item.newdesc.includes('CL800') ||
      sp_item.newdesc.includes('CLASS 800') ||
      sp_item.newdesc.includes('800#') ||
      sp_item.newdesc.includes('800 LBS')
    )
      sp_item.class = '800'
    if (
      sp_item.newdesc.includes('CL3000') ||
      sp_item.newdesc.includes('CLASS 3000') ||
      sp_item.newdesc.includes('3000#') ||
      sp_item.newdesc.includes(' 3M ') ||
      sp_item.newdesc.includes('3000 LBS')
    )
      sp_item.class = '3000'
    if (
      sp_item.newdesc.includes('CL6000') ||
      sp_item.newdesc.includes('CLASS 6000') ||
      sp_item.newdesc.includes('6000#') ||
      sp_item.newdesc.includes(' 6M ') ||
      sp_item.newdesc.includes('6000 LBS')
    )
      sp_item.class = '6000'
    if (
      sp_item.newdesc.includes('CL9000') ||
      sp_item.newdesc.includes('CLASS 9000') ||
      sp_item.newdesc.includes('9000#') ||
      sp_item.newdesc.includes(' 9M ') ||
      sp_item.newdesc.includes('9000 LBS')
    )
      sp_item.class = '9000'
    if (
      sp_item.newdesc.includes('CL2000') ||
      sp_item.newdesc.includes('CLASS 2000') ||
      sp_item.newdesc.includes('2000#') ||
      sp_item.newdesc.includes('2M') ||
      sp_item.newdesc.includes('2000 LBS')
    )
      sp_item.class = '3000'
    if (
      sp_item.newdesc.includes('CL2500') ||
      sp_item.newdesc.includes('CLASS 2500') ||
      sp_item.newdesc.includes('2500#') ||
      sp_item.newdesc.includes('2500 LBS')
    )
      sp_item.class = '2500'
    // Face
    if (sp_item.newdesc.includes(' RF') || sp_item.newdesc.includes('RAISED_FACE')) sp_item.face = 'Raised'
    if (sp_item.newdesc.includes(' FF') || sp_item.newdesc.includes('FLAT-FACE')) sp_item.face = 'Flat'
    // Schedule conversions for 40 and 80
    if (sp_item.schedule !== undefined)
      if (sp_item.size.includes('x')) {
        if (sp_item.size.split('x')[0] < 12 && sp_item.schedule === '40') sp_item.schedule = 'STD'
        if (sp_item.size.split('x')[0] < 10 && sp_item.schedule === '80') sp_item.schedule = 'XS'
        if (sp_item.size.split('x')[0] < 12 && sp_item.schedule.includes('40X')) sp_item.schedule = sp_item.schedule.replace('40X', 'STDX')
        if (sp_item.size.split('x')[0] < 10 && sp_item.schedule.includes('80X')) sp_item.schedule = sp_item.schedule.replace('80X', 'XSX')
        if (sp_item.size.split('x')[1] < 12 && sp_item.schedule.includes('X40')) sp_item.schedule = sp_item.schedule.replace('X40', 'XSTD')
        if (sp_item.size.split('x')[1] < 10 && sp_item.schedule.includes('X80')) sp_item.schedule = sp_item.schedule.replace('X80', 'XXS')
      } else {
        if (sp_item.size < 12 && sp_item.schedule === '40') sp_item.schedule = 'STD'
        if (sp_item.size < 10 && sp_item.schedule === '80') sp_item.schedule = 'XS'
      }
    return sp_item
  })

  // Edits for 7114
  if (type !== 'CVC') {
    // Filter by material
    sp_items = sp_items.filter((item) => item.item.includes('FITTING') || item.item.includes('PIPE') || item.item.includes('FLANGE'))
    // Iterete for edits
    sp_items.map((sp_item) => {
      // Description
      sp_item.newdesc = sp_item.description.replaceAll('TRIMMED ', '').replaceAll('W/BRANCH.CONN ', '')
      // Tag
      sp_item.tag = sp_item.tag
        .replaceAll('AAEA20T', 'AAEA200')
        .replaceAll('AAEA2TB', 'AAEA200')
        .replaceAll('AAEA20A', 'AAEA200')
        .replaceAll('A0EH200', 'AAEA200')
      // Size
      sp_item.size = sp_item.size.replaceAll('13/16', '.8125').replaceAll('3/8', '.375')
      if (sp_item.item_detail === 'Nipple' && sp_item.size.includes('x') === false) {
        if (sp_item.newdesc.includes('J_')) sp_item.size = sp_item.size + 'x2'
        if (sp_item.newdesc.includes('L_')) sp_item.size = sp_item.size + 'x3'
        if (sp_item.newdesc.includes('N_')) sp_item.size = sp_item.size + 'x4'
        if (sp_item.newdesc.includes('R_')) sp_item.size = sp_item.size + 'x6'
        if (sp_item.newdesc.includes('R_')) sp_item.size = sp_item.size + 'x9'
      }
      //Material
      if (sp_item.material === 'A587') sp_item.material = 'A106'
      // Change all A material that isn't pipe to CS
      if (sp_item.material !== undefined && sp_item.item_detail !== 'Pipe')
        sp_item.material.replace('A105', 'CS').replace('A53', 'CS').replace('A234', 'CS').replace('A106', 'CS')
      // Change all A106 pipe to seamless
      if (
        sp_item.item_detail === 'Pipe' &&
        sp_item.material === 'A106' &&
        (sp_item.size.split('x')[0] < 2 || (sp_item.size.split('x')[0] === 2 && sp_item.schedule === 'XS'))
      ) {
        sp_item.seam = undefined
      } else {
        if (sp_item.newdesc.includes('SMLS OR WELDED')) {
          sp_item.seam = 'Welded'
        }
      }
      return sp_item
    })
  }

  // Edits for 7116
  if (type !== 'CVC') {
    sp_items = sp_items.filter((item) => item.item.includes('FITTING') || item.item.includes('PIPE') || item.item.includes('FLANGE'))
    // Iterate items for edits
    sp_items.map((sp_item) => {
      // Size
      sp_item.size.replaceAll('3 1/8', '3').replaceAll('13/16', '3/4').replaceAll('1 15/16', '2')
      // Sketch
      sp_item.sketch = sp_item.sketch.replace('-1', '-A').replace('-2', '-B').replace('-3', '-C').replace('-4', '-D')
      // Seam
      if (sp_item.material === 'A234' && sp_item.spec === 'ZCSC01') sp_item.seam = undefined
      // Material
      if (sp_item.material !== undefined && sp_item.material === 'A234') sp_item.material = 'CS'
      return sp_item
    })
  }

  // Create new tag
  sp_items.map((sp_item) => {
    // Find abreviated code
    let abrcode = sp_item.tag.split('~')[0]
    if (abrcode.includes('-')) abrcode = abrcode.replace(abrcode.split('-')[0], '').replace('-', '')
    if (abrcode.includes('_')) abrcode = abrcode.replace(abrcode.split('_')[1], '').replace('_', '')
    if (abrcode.includes('/')) abrcode = abrcode.split('/')[1]

    // If there is no material found, use original code
    if (
      sp_item.material !== undefined &&
      sp_item.item.toUpperCase().includes('VALVE') === false &&
      sp_item.item.toUpperCase().includes('SUPPORTS') === false
    ) {
      // Items with 3000, 6000, or 9000 class
      if (sp_item.class === '3000' || sp_item.class === '6000' || sp_item.class === '9000')
        sp_item['NEW TAG'] = abrcode + '_' + sp_item.class + '~' + sp_item.origsize
      else {
        // Should have schedule but doesn't
        if (sp_item.schedule === undefined) sp_item['NEW TAG'] = abrcode + '_???~' + sp_item.origsize + ' (NO SCHEDULE FOUND)'
        // Has a schedule
        else sp_item['NEW TAG'] = abrcode + '_' + sp_item.schedule + '~' + sp_item.origsize
        // Special cases where class should be used with the schedule
        if (sp_item.item_detail !== undefined)
          if (sp_item.item_detail === 'Socketweld Flange' || sp_item.item_detail === 'Weldneck Flange')
            if (sp_item.schedule === undefined)
              sp_item['NEW TAG'] = abrcode + '_???' + ':' + sp_item.class + sp_item.origsize + ' (NO SCHEDULE FOUND)'
            // Has a schedule
            else if (sp_item.class === undefined)
              sp_item['NEW TAG'] = abrcode + '_' + sp_item.schedule + ':' + '???~' + sp_item.origsize + ' (NO CLASS FOUND)'
            else sp_item['NEW TAG'] = abrcode + '_' + sp_item.schedule + ':' + sp_item.class + '~' + sp_item.origsize
          // Special cases where class should only be used
          else if (
            sp_item.item_detail === 'Blind Flange' ||
            sp_item.item_detail === 'Slip On Flange' ||
            sp_item.item_detail === 'Lap Joint Flange'
          )
            if (sp_item.class === undefined) sp_item['NEW TAG'] = abrcode + '???~' + sp_item.origsize + ' (NO CLASS FOUND)'
            else sp_item['NEW TAG'] = abrcode + '_' + sp_item.class + '~' + sp_item.origsize
      }
    }
  })
  dispatch({
    type: COMPARE_ITEMS,
    payload: { sp_items: sp_items, headers: sp_data.headers },
  })
}

export const downloadSP = (sp_items, headers) => async (dispatch) => {
  // Create new workbook and add props
  let wb = XLSX.utils.book_new()
  wb.Props = {
    Title: 'Export File',
    Subject: 'Export File',
    Author: 'Kurt McCune',
    CreatedDate: new Date(2017, 12, 19),
  }

  // Create json object for sheet along with new tag column
  let ws_data = []
  let ws_row = {}
  let headersarray = []
  headers.map((header) => {
    ws_row[header] = undefined
    headersarray.push(header)
    if (header === ' TAG NUMBER' || header === 'ITEM_NUMBER' || header === 'SBBOMPARTN') {
      ws_row['NEW TAG'] = undefined
      headersarray.push('NEW TAG')
    }
  })

  // Add row info for each item
  sp_items.map((sp_item) => {
    let newrow = {}
    headersarray.map((header) => {
      newrow[header] = sp_item[header]
    })
    ws_data.push(newrow)
    return sp_item
  })

  // Create a worksheet containing data from the object above
  let ws = XLSX.utils.json_to_sheet(ws_data)

  // Find the correct tab and write the worksheet to that tab
  wb.SheetNames.push('Items')
  wb.Sheets['Items'] = ws
  let wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' })

  // Download the file
  function s2ab(s) {
    let buf = new ArrayBuffer(s.length)
    let view = new Uint8Array(buf)
    for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff
    return buf
  }
  saveAs(new Blob([s2ab(wbout)], { type: 'application/octet-stream' }), 'test.xlsx')
}
