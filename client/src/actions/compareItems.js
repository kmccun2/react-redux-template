import axios from 'axios'
import XLSX from 'xlsx'
import { saveAs } from 'file-saver'

import { COMPARE_ITEMS, ADD_MATCH } from '../actions/types'

export const compareItems = () => async (dispatch) => {
  // Grab input file data
  const res_sp = await axios.get('/api/xlsx/input')
  // Grab po file data
  const res_po = await axios.get('/api/xlsx/po')

  let sp_data = res_sp.data
  let po_data = res_po.data
  let sp_items = sp_data.rows
  let po_items = po_data.rows
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
    addProps('SBBOMSIZE', 'size')
    addProps('SIZE', 'origsize')
    addProps(' SIZE', 'origsize')
    addProps('SBBOMSIZE', 'origsize')
    addProps('SBBOMMATL', 'description')
    addProps('DESCRIPTION', 'description')
    addProps(' DESCRIPTION', 'description')    addProps('SPM DESCRIPTION', 'description')
    addProps('GROUP', 'item')
    addProps('GROUP-PERF', 'item')
    addProps(' GROUP-PERF', 'item')
    addProps('PIPING-SPEC', 'spec')
    addProps('SILINESPEC', 'spec')
    addProps(' SPEC', 'spec')
    addProps(' SKETCH', 'spool')

    return sp_item
  })

  // Remove items that don't go into SP MAT
  sp_items = sp_items.filter(
    (item) =>
      item['SBMATLCLAS'] !== 'CUTPIPE' && item.sketch !== undefined && item.size !== undefined && item.tag !== undefined
  )

  // Iterate input file items and add info
  sp_items.map((sp_item) => {
    // Sketch
    sp_item.sketch = sp_item.sketch.split('/')[sp_item.sketch.split('/').length - 1]
    // Description
    sp_item.newdesc = sp_item.description
      .toUpperCase()
      .replaceAll('SCH ', 'S-')
      .replaceAll('STD WT', 'STD')
      .replaceAll(',', ' ')
    // Material
    if (sp_item.tag.includes('CS-')) sp_item.material = 'CS'
    if (sp_item.tag.includes('CSW-')) sp_item.material = 'CS'
    if (sp_item.tag.includes('A106-')) sp_item.material = 'A106'
    if (sp_item.tag.includes('A106W-')) sp_item.material = 'A106'
    if (sp_item.tag.includes('A53-')) sp_item.material = 'A53'
    if (sp_item.tag.includes('A53W-')) sp_item.material = 'A53'
    if (sp_item.newdesc.includes(' CS ') || sp_item.newdesc.includes('-CS ')) sp_item.material = 'CS'
    if (sp_item.newdesc.includes('A105')) sp_item.material = 'A105'
    if (sp_item.newdesc.includes('A53')) sp_item.material = 'A53'
    if (sp_item.newdesc.includes('A403')) sp_item.material = 'A403'
    if (sp_item.newdesc.includes('A234')) sp_item.material = 'A234'
    if (sp_item.newdesc.includes('A587')) sp_item.material = 'A587'
    if (sp_item.newdesc.includes('A106')) sp_item.material = 'A106'
    if (sp_item.newdesc.includes('A671')) sp_item.material = 'A671'
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
    if (sp_item.newdesc.includes(' BXT') || sp_item.newdesc.includes(' TXB')) sp_item.end_type = 'Beveled x Threaded'
    if (sp_item.newdesc.includes(' BXP') || sp_item.newdesc.includes(' TBE')) sp_item.end_type = 'Beveled x Plain'
    if (sp_item.newdesc.includes(' NPT')) sp_item.end_type = 'Threaded'
    if (sp_item.newdesc.includes(' PXT') || sp_item.newdesc.includes(' TXP') || sp_item.newdesc.includes('POE/TOE'))
      sp_item.end_type = 'Plain x Threaded'
    // Item detail
    // Weldneck Flange
    if (sp_item.newdesc.includes('WN ') || sp_item.newdesc.includes('NECK ')) sp_item.item_detail = 'Weldneck Flange'
    // Oriface Flange
    if (sp_item.newdesc.includes('OFIF')) sp_item.item_detail = 'Oriface Flange'
    // Blind Flange
    if (sp_item.newdesc.includes('BLIND') || sp_item.newdesc.includes('BLD ')) sp_item.item_detail = 'Blind Flange'
    // Slip On Flange
    if (sp_item.newdesc.includes('SLIP') || sp_item.newdesc.includes(' SO ')) {
      sp_item.item_detail = 'Slip On Flange'
      if (sp_item.newdesc.includes('RED ') || sp_item.newdesc.includes('REDUC'))
        sp_item.item_detail = 'Reducing Slip On Flange'
    }
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
    // OUTLET
    if (sp_item.newdesc.includes('OUTLET')) {
      if (sp_item.newdesc.includes('SW')) sp_item.item_detail = 'Sockolet'
      if (sp_item.newdesc.includes('BE')) sp_item.item_detail = 'Weldolet'
    }
    // Concentric Reducer
    if (
      sp_item.newdesc.includes('CONC') ||
      (sp_item.newdesc.includes('CON ') && (sp_item.newdesc.includes('RED ') || sp_item.newdesc.includes('REDUCER')))
    )
      sp_item.item_detail = 'Concentric Reducer'
    // Eccentric Reducer
    if (sp_item.newdesc.includes('ECC') && (sp_item.newdesc.includes('RED ') || sp_item.newdesc.includes('REDUCER')))
      sp_item.item_detail = 'Eccentric Reducer'
    // Elbows
    if (sp_item.newdesc.includes('ELBOW') || sp_item.newdesc.includes('ELL ')) {
      if (sp_item.newdesc.includes('90')) sp_item.item_detail = '90 Degree Elbow'
      if (sp_item.newdesc.includes('45')) sp_item.item_detail = '45 Degree Elbow'
      if (sp_item.newdesc.includes('SR ') || sp_item.newdesc.includes('SHORT')) {
        sp_item.item_detail = sp_item.item_detail + ' - Short'
      }
      if (sp_item.newdesc.includes('RED')) sp_item.item_detail = sp_item.item_detail + ' Reducing'
      if (sp_item.newdesc.includes(' 3D ')) sp_item.item_detail = sp_item.item_detail + ' 3D'
    }
    // Nipple
    if (sp_item.newdesc.includes('NIPP')) sp_item.item_detail = 'Nipple'
    // Tee
    if (sp_item.newdesc.includes('TEE')) sp_item.item_detail = 'Tee'
    // Concentric Swage
    if (sp_item.newdesc.includes('CON') && sp_item.newdesc.includes('SWAGE')) sp_item.item_detail = 'Concentric Swage'
    // Eccentric Swage
    if (sp_item.newdesc.includes('ECC') && sp_item.newdesc.includes('SWAGE')) sp_item.item_detail = 'Eccentric Swage'
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
    // Reinforcment Pad
    if (sp_item.newdesc.includes('REINFORCE')) sp_item.item_detail = 'Reinforcment Pad'
    // Insert
    if (sp_item.newdesc.includes(' INSERT')) sp_item.item_detail = 'Insert'
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
      .replaceAll('0.', '.')
    // Reverse swapped sizes
    if (
      sp_item.size.includes('x') &&
      parseFloat(sp_item.size.split('x')[0]) < parseFloat(sp_item.size.split('x')[1]) &&
      sp_item.item_detail !== 'Nipple'
    )
      sp_item.size = sp_item.size.split('x')[1] + 'x' + sp_item.size.split('x')[0]
    // Remove repeated size
    if (sp_item.size.split('x')[0] === sp_item.size.split('x')[1]) sp_item.size = sp_item.size.split('x')[0]
    // Rename tees by size
    if (sp_item.item_detail === 'Tee') {
      if (sp_item.size.includes('x')) {
        if (sp_item.size.split('x')[0] > sp_item.size.split('x')[1]) sp_item.item_detail = 'Reducing Tee'
        else sp_item.item_detail = 'Equal Tee'
      } else sp_item.item_detail = 'Equal Tee'
    }
    // Rename couplings by size
    if (sp_item.item_detail === 'Coupling') {
      if (sp_item.size.includes('x')) {
        if (sp_item.size.split('x')[0] > sp_item.size.split('x')[1]) sp_item.item_detail = 'Reducing Coupling'
        if (sp_item.size.split('x')[0] < sp_item.size.split('x')[1]) {
          sp_item.item_detail = 'Reducing Coupling'
          sp_item.size = sp_item.size.split('x')[1] + 'x' + sp_item.size.split('x')[0]
        }
      }
    }
    // Mark all beveled pipe as plain
    if (sp_item.item_detail === 'Pipe' && sp_item.end_type)
      sp_item.end_type = sp_item.end_type.replace('Beveled x Plain', 'Plain').replace('Beveled', 'Plain')
    // Shcedule
    //CALC
    if (sp_item.newdesc.includes('CALC,')) sp_item.schedule = 'CALC'
    //10S
    if (sp_item.newdesc.includes('S-10S') || sp_item.newdesc.includes(' 10S')) sp_item.schedule = '10S'
    //80
    if (sp_item.newdesc.includes('S-80') || sp_item.newdesc.includes(' 80 ')) sp_item.schedule = '80'
    //40
    if (sp_item.newdesc.includes('S-40') || sp_item.newdesc.includes(' 40')) sp_item.schedule = '40'
    //40S
    if (sp_item.newdesc.includes('S-40S') || sp_item.newdesc.includes(' 40S')) sp_item.schedule = '40S'
    //STD
    if (sp_item.newdesc.includes(',STD') || sp_item.newdesc.includes(' STD') || sp_item.newdesc.includes('S-STD'))
      sp_item.schedule = 'STD'
    //XS
    if (sp_item.newdesc.includes('S-XS') || sp_item.newdesc.includes(' XS') || sp_item.newdesc.includes(' XH '))
      sp_item.schedule = 'XS'
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
        if (sp_item.size.split('x')[0] < 12 && sp_item.schedule.includes('40X'))
          sp_item.schedule = sp_item.schedule.replace('40X', 'STDX')
        if (sp_item.size.split('x')[0] < 10 && sp_item.schedule.includes('80X'))
          sp_item.schedule = sp_item.schedule.replace('80X', 'XSX')
        if (
          sp_item.size.split('x')[1] < 12 &&
          sp_item.schedule.includes('X40') &&
          sp_item.schedule.includes('X40S') === false
        )
          sp_item.schedule = sp_item.schedule.replace('X40', 'XSTD')
        if (sp_item.size.split('x')[1] < 10 && sp_item.schedule.includes('X80'))
          sp_item.schedule = sp_item.schedule.replace('X80', 'XXS')
      } else {
        if (sp_item.size < 12 && sp_item.schedule === '40') sp_item.schedule = 'STD'
        if (sp_item.size < 10 && sp_item.schedule === '80') sp_item.schedule = 'XS'
      }
    return sp_item
  })

  // Edits for 7114
  if (type !== 'CVC') {
    // Filter by material
    sp_items = sp_items.filter(
      (item) => item.item.includes('FITTING') || item.item.includes('PIPE') || item.item.includes('FLANGE')
    )
  }
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
    //Material
    if (sp_item.material === 'A587') sp_item.material = 'A106'
    // Size
    sp_item.size = sp_item.size.replaceAll('13/16', '.8125').replaceAll('3/8', '.375')
    // Change all A material that isn't pipe to CS
    if (sp_item.material !== undefined && sp_item.item_detail !== 'Pipe')
      sp_item.material = sp_item.material
        .replace('A105', 'CS')
        .replace('A53', 'CS')
        .replace('A234', 'CS')
        .replace('A106', 'CS')
    // Change all A106 pipe to seamless
    if (
      sp_item.item_detail === 'Pipe' &&
      sp_item.material === 'A106' &&
      (parseFloat(sp_item.size.split('x')[0]) < 2 ||
        (parseFloat(sp_item.size.split('x')[0]) === 2 && sp_item.schedule === 'XS'))
    ) {
      sp_item.seam = undefined
    } else {
      if (sp_item.newdesc.includes('SMLS OR WELDED')) {
        sp_item.seam = 'Welded'
      }
    }
    return sp_item
  })

  // Edits for 7116
  if (type !== 'CVC') {
    sp_items = sp_items.filter(
      (item) => item.item.includes('FITTING') || item.item.includes('PIPE') || item.item.includes('FLANGE')
    )
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

  // Create new tags for all jobs
  sp_items.map((sp_item) => {
    // Grab size and schedules from code on BOM

    // Find abreviated code
    let abrcode = sp_item.tag.split('~')[0]
    if (abrcode.includes('-')) abrcode = abrcode.replace(abrcode.split('-')[0], '').replace('-', '')
    if (abrcode.includes('-')) abrcode = abrcode.replace(abrcode.split('-')[1], '').replace('-', '')
    if (abrcode.includes('_')) abrcode = abrcode.replace(abrcode.split('_')[1], '').replace('_', '')
    if (abrcode.includes('/')) abrcode = abrcode.split('/')[1]

    // If there is no material found, use original code
    if (sp_item.material !== undefined) {
      // Items with 3000, 6000, or 9000 class
      if (sp_item.class === '3000' || sp_item.class === '6000' || sp_item.class === '9000')
        sp_item['NEW TAG'] = abrcode + '_' + sp_item.class + '~' + sp_item.origsize
      else {
        // Should have schedule but doesn't
        if (sp_item.schedule === undefined)
          sp_item['NEW TAG'] = abrcode + '_~' + sp_item.origsize + ' (NO SCHEDULE FOUND)'
        // Has a schedule
        else sp_item['NEW TAG'] = abrcode + '_' + sp_item.schedule + '~' + sp_item.origsize
        // Special cases where class should be used with the schedule
        if (sp_item.item_detail !== undefined)
          if (sp_item.item_detail === 'Socketweld Flange' || sp_item.item_detail === 'Weldneck Flange')
            if (sp_item.schedule === undefined)
              sp_item['NEW TAG'] = abrcode + '_:' + sp_item.class + '~' + sp_item.origsize + ' (NO SCHEDULE FOUND)'
            // Has a schedule
            else if (sp_item.class === undefined)
              sp_item['NEW TAG'] = abrcode + '_' + sp_item.schedule + ':~' + sp_item.origsize + ' (NO CLASS FOUND)'
            else sp_item['NEW TAG'] = abrcode + '_' + sp_item.schedule + ':' + sp_item.class + '~' + sp_item.origsize
          // Special cases where class should only be used
          else if (
            sp_item.item_detail === 'Blind Flange' ||
            sp_item.item_detail === 'Slip On Flange' ||
            sp_item.item_detail === 'Lap Joint Flange'
          )
            if (sp_item.class === undefined) sp_item['NEW TAG'] = abrcode + '~' + sp_item.origsize + ' (NO CLASS FOUND)'
            else sp_item['NEW TAG'] = abrcode + '_' + sp_item.class + '~' + sp_item.origsize
      }
      // Add material and welds for 7114
      if (jobnum === 7114)
        if (sp_item.seam === 'Welded') sp_item['NEW TAG'] = sp_item.material + 'W-' + sp_item['NEW TAG']
        else sp_item['NEW TAG'] = sp_item.material + '-' + sp_item['NEW TAG']
    }

    // Add lengths to nipples
    if (sp_item.item_detail === 'Nipple' && sp_item.size.includes('x') === false) {
      if (sp_item['NEW TAG'].includes('J_')) sp_item.size = sp_item.size + 'x2'
      if (sp_item['NEW TAG'].includes('L_')) sp_item.size = sp_item.size + 'x3'
      if (sp_item['NEW TAG'].includes('N_')) sp_item.size = sp_item.size + 'x4'
      if (sp_item['NEW TAG'].includes('R_')) sp_item.size = sp_item.size + 'x6'
      if (sp_item['NEW TAG'].includes('R_')) sp_item.size = sp_item.size + 'x9'
    }
    return sp_item
  })

  // // Iterate PO file items and add info
  po_items.map((po_item) => {
    po_item.description = po_item['Text69'] + ' ' + po_item['ItemDesc']
    po_item.newdesc = po_item.description
    po_item.newdesc = po_item.newdesc.toUpperCase()
    // Material
    if (po_item.newdesc.includes('A105')) po_item.material = 'A105'
    if (po_item.newdesc.includes('A106') || po_item.newdesc.includes('A-106')) po_item.material = 'A106'
    if (po_item.newdesc.includes('A234')) po_item.material = 'A234'
    if (po_item.newdesc.includes('CS ')) po_item.material = 'A105'
    if (po_item.newdesc.includes('A53') || po_item.newdesc.includes('A-53')) po_item.material = 'A53'
    if (po_item.newdesc.includes('304')) po_item.material = '304'
    if (po_item.newdesc.includes('316')) po_item.material = '316'
    if (po_item.newdesc.includes('P11')) po_item.material = 'P11'
    if (po_item.newdesc.includes('P22')) po_item.material = 'P22'
    if (
      (po_item.newdesc.includes('P9') && po_item.newdesc.includes('F9')) ||
      (po_item.newdesc.includes('P 9') && po_item.newdesc.includes('F 9'))
    )
      po_item.material = 'P9'
    if (
      (po_item.newdesc.includes('P91') && po_item.newdesc.includes('F91')) ||
      (po_item.newdesc.includes('P 91') && po_item.newdesc.includes('F 91'))
    )
      po_item.material = 'P91'
    if (po_item.newdesc.includes('A333') || po_item.newdesc.includes('A420')) po_item.material = 'LT'
    // Seam
    if (
      po_item.newdesc.includes('-W') ||
      po_item.newdesc.includes(' ERW') ||
      po_item.newdesc.includes(' EFW') ||
      po_item.newdesc.includes(' W ') ||
      (po_item.newdesc.includes('WELD') &&
        po_item.newdesc.includes('BUTT WELD') === false &&
        po_item.newdesc.includes('SOCK') === false)
    )
      po_item.seam = 'Welded'
    if (po_item.newdesc.includes('WP-X') || po_item.newdesc.includes(' WX ')) po_item.seam = 'Welded X-Ray'
    // End type
    if (
      po_item.newdesc.includes('SOCKET') ||
      po_item.newdesc.includes('PBE') ||
      po_item.newdesc.includes(' SW') ||
      po_item.newdesc.includes('SWAGE') === false
    )
      po_item.end_type = 'Plain'
    if (po_item.newdesc.includes('BUTT') || po_item.newdesc.includes('BW')) po_item.end_type = 'Beveled'

    if (po_item.newdesc.includes('TBE') || po_item.newdesc.includes('NPT') || po_item.newdesc.includes('THR '))
      po_item.end_type = 'Threaded'
    if (po_item.newdesc.includes(' PXT') || po_item.newdesc.includes('SWXTHR')) po_item.end_type = 'Plain x Threaded'
    if (po_item.newdesc.includes('TXB') || po_item.newdesc.includes('BXT')) po_item.end_type = 'Beveled x Threaded'
    if (po_item.newdesc.includes('BXP') || po_item.newdesc.includes('PXB')) po_item.end_type = 'Beveled x Plain'
    // Item Detail
    // Weldneck Flange
    if (po_item.newdesc.includes('WN ') || po_item.newdesc.includes('NECK')) {
      po_item.item_detail = 'Weldneck Flange'
      po_item.item = 'FLANGES'
    }
    // Oriface Flange
    if (po_item.newdesc.includes('ORI') && (po_item.newdesc.includes('FLG') || po_item.newdesc.includes('FLANGE'))) {
      po_item.item_detail = 'Oriface Flange'
      po_item.item = 'FLANGES'
    }
    // Blind Flange
    if (po_item.newdesc.includes('BLIND') || po_item.newdesc.includes('BLD')) {
      po_item.item_detail = 'Blind Flange'
      po_item.item = 'FLANGES'
    }
    // Slip On Flange
    if (po_item.newdesc.includes('FLANGE SLIP ON') || po_item.newdesc.includes('FLANGE SO')) {
      po_item.item_detail = 'Slip On Flange'
      po_item.item = 'FLANGES'
      if (po_item.newdesc.includes('RED ') || po_item.newdesc.includes('REDUC'))
        po_item.item_detail = 'Reducing Slip On FLange'
    }
    // Lap Joint Flange
    if (po_item.newdesc.includes('FLANGE') && po_item.newdesc.includes('LAP')) {
      po_item.item_detail = 'Lap Joint Flange'
      po_item.item = 'FLANGES'
    }
    // Threaded Flange
    if (po_item.newdesc.includes('FLANGE THR')) {
      po_item.item_detail = 'Threaded Flange'
      po_item.item = 'FLANGES'
    }
    // Socketweld Flange
    if (po_item.newdesc.includes('SW FL') || (po_item.newdesc.includes('SW ') && po_item.newdesc.includes('FLANGE'))) {
      po_item.item_detail = 'Socketweld Flange'
      po_item.item = 'FLANGES'
    }
    // Stub End Flange
    if (po_item.newdesc.includes('STUB END') || po_item.newdesc.includes('BLD')) {
      po_item.item_detail = 'Stub End Flange'
      po_item.item = 'FLANGES'
    }
    // Sockolet
    if (po_item.newdesc.includes('SOCKO') || (po_item.newdesc.includes('OUTLET') && po_item.newdesc.includes('SW;'))) {
      po_item.item_detail = 'Sockolet'
      po_item.item = 'FITTINGS'
    }
    // Weldolet
    if (po_item.newdesc.includes('WELDO') || (po_item.newdesc.includes('OUTLET') && po_item.newdesc.includes('BW;'))) {
      po_item.item_detail = 'Weldolet'
      po_item.item = 'FITTINGS'
    }
    // Thredolet
    if (po_item.newdesc.includes('THREDO') || po_item.newdesc.includes('THREADO')) {
      po_item.item_detail = 'Thredolet'
      po_item.item = 'FITTINGS'
    }
    // Flatolet
    if (po_item.newdesc.includes('FLATO')) {
      po_item.item_detail = 'Flatolet'
      po_item.item = 'FITTINGS'
    }
    // Elbolet
    if (po_item.newdesc.includes('ELBOLET')) {
      po_item.item_detail = 'Elbolet'
      po_item.item = 'FITTINGS'
    }
    // Latrolet
    if (po_item.newdesc.includes('LATRO')) {
      po_item.item_detail = 'Latrolet'
      po_item.item = 'FITTINGS'
    }
    // Concentric Reducer
    if ((po_item.newdesc.includes('CONC') || po_item.newdesc.includes('CON ')) && po_item.newdesc.includes('RED')) {
      po_item.item_detail = 'Concentric Reducer'
      po_item.item = 'FITTINGS'
    }
    // Eccentric Reducer
    if (po_item.newdesc.includes('ECC') && po_item.newdesc.includes('RED')) {
      po_item.item_detail = 'Eccentric Reducer'
      po_item.item = 'FITTINGS'
    }
    // Elbows
    if (po_item.newdesc.includes('ELBOW') || po_item.newdesc.includes('ELL ')) {
      if (po_item.newdesc.includes('90')) po_item.item_detail = '90 Degree Elbow'
      if (po_item.newdesc.includes('45')) po_item.item_detail = '45 Degree Elbow'
      if (po_item.newdesc.includes('SR ') || po_item.newdesc.includes('SHORT')) {
        po_item.item_detail = po_item.item_detail + ' - Short'
      }
      if (po_item.newdesc.includes('RED')) po_item.item_detail = po_item.item_detail + ' Reducing'
      if (po_item.newdesc.includes(' 3D ')) po_item.item_detail = po_item.item_detail + ' 3D'
      po_item.item = 'FITTINGS'
    }
    // Nipple
    if (po_item.newdesc.includes('NIPP')) {
      po_item.item_detail = 'Nipple'
      po_item.item = 'FITTINGS'
    }
    // Tee
    if (po_item.newdesc.includes('TEE,') || po_item.newdesc.includes('TEE ') || po_item.newdesc.includes('TEE:')) {
      po_item.item_detail = 'Tee'
      po_item.item = 'FITTINGS'
    }
    // Nipple
    if (po_item.newdesc.includes('NIPP')) {
      po_item.item_detail = 'Nipple'
      po_item.item = 'FITTINGS'
    }
    // Concentric Swage
    if (po_item.newdesc.includes('CON') && po_item.newdesc.includes('SWAGE')) {
      po_item.item_detail = 'Concentric Swage'
      po_item.item = 'FITTINGS'
    }
    // Eccentric Swage
    if (po_item.newdesc.includes('ECC') && po_item.newdesc.includes('SWAGE')) {
      po_item.item_detail = 'Eccentric Swage'
      po_item.item = 'FITTINGS'
    }
    // Cap
    if (po_item.newdesc.includes('CAP,') || po_item.newdesc.includes('CAP ') || po_item.newdesc.includes('CAP:')) {
      po_item.item_detail = 'Cap'
      po_item.item = 'FITTINGS'
    }
    // Union
    if (po_item.newdesc.includes('UNION')) {
      po_item.item_detail = 'Union'
      po_item.item = 'FITTINGS'
    }
    // Coupling
    if (po_item.newdesc.includes('COUPL') || po_item.newdesc.includes('CPLG')) {
      po_item.item_detail = 'Coupling'
      po_item.item = 'FITTINGS'
    }
    // Strainer
    if (po_item.newdesc.includes('STRAINER')) {
      po_item.item_detail = 'Strainer'
      po_item.item = 'FITTINGS'
    }
    // Plug
    if (po_item.newdesc.includes('PLUG')) {
      po_item.item_detail = 'Plug'
      po_item.item = 'FITTINGS'
    }
    // Gasket
    if (po_item.newdesc.includes('GASK')) {
      po_item.item_detail = 'Gasket'
      po_item.item = 'FITTINGS'
    }
    // Reinforcemnet Pad
    if (po_item.newdesc.includes('REINFORCEMENT PAD')) {
      po_item.item_detail = 'Reinforcemnet Pad'
      po_item.item = 'FITTINGS'
    }
    // Insert
    if (po_item.newdesc.includes('INSERT')) {
      po_item.item_detail = 'Insert'
      po_item.item = 'FITTINGS'
    }
    // Cross
    if (po_item.newdesc.includes('CROSS')) {
      po_item.item_detail = 'Cross'
      po_item.item = 'FITTINGS'
    }
    // Pipe
    if (po_item.newdesc.includes('PIPE ')) {
      po_item.item_detail = 'Pipe'
      po_item.item = 'PIPE'
    }
    // Schedule/Class
    if (po_item.newdesc.includes('40S ')) po_item.schedule = '40S'
    if (po_item.newdesc.includes('80S ')) po_item.schedule = '80S'
    if (po_item.newdesc.includes('10S ')) po_item.schedule = '10S'
    if (po_item.newdesc.includes('STD ') || po_item.newdesc.includes('Std ')) po_item.schedule = 'STD'
    if (po_item.newdesc.includes('S40 ') || po_item.newdesc.includes('SCH 40')) po_item.schedule = '40'
    if (po_item.newdesc.includes('S80 ') || po_item.newdesc.includes('SCH 80')) po_item.schedule = '80'
    if (po_item.newdesc.includes('S160 ') || po_item.newdesc.includes('SCH 160')) po_item.schedule = '160'
    if (po_item.newdesc.includes('S10 ') || po_item.newdesc.includes('SCH 10')) po_item.schedule = '10'
    if (po_item.newdesc.includes('XH ')) po_item.schedule = 'XS'
    if (po_item.newdesc.includes('STD X XH')) po_item.schedule = 'STDXXS'
    if (po_item.newdesc.includes('40S X 10S')) po_item.schedule = '40SX10S'
    if (po_item.newdesc.includes('150#')) po_item.class = '150'
    if (po_item.newdesc.includes('300#')) po_item.class = '300'
    if (po_item.newdesc.includes('600#')) po_item.class = '600'
    if (po_item.newdesc.includes('900#')) po_item.class = '900'
    if (po_item.newdesc.includes('1500#')) po_item.class = '1500'
    if (po_item.newdesc.includes('3000#') || po_item.newdesc.includes('3M ')) po_item.class = '3000'
    if (po_item.newdesc.includes('6000#')) po_item.class = '6000'
    if (po_item.newdesc.includes('9000#')) po_item.class = '9000'
    if (po_item.newdesc.includes('2500#')) po_item.class = '2500'
    if (po_item.newdesc.includes('2000#')) po_item.class = '3000'
    // Face
    if (po_item.newdesc.includes(' RF')) po_item.face = 'Raised'
    if (po_item.newdesc.includes(' FF')) po_item.face = 'Flat'
    // Size
    if (po_item.newdesc.includes('"') === false) po_item.size = 'No Size Found'
    else {
      if (po_item.newdesc.split(' ')[po_item.newdesc.split(' ').length - 1].includes('"') === false)
        po_item.size = po_item.newdesc
          .split(' ')
          [po_item.newdesc.split(' ').length - 2].replaceAll('"', '')
          .replaceAll('flatx', '')
      else
        po_item.size = po_item.newdesc
          .split(' ')
          [po_item.newdesc.split(' ').length - 1].replaceAll('"', '')
          .replaceAll('flatx', '')
    }
    // Fix reversed sizes
    if (po_item.size.includes('X') && po_item.size.includes('-') === false && po_item.item_detail !== 'Nipple') {
      if (parseFloat(po_item.size.split('X')[0]) < parseFloat(po_item.size.split('X')[1]))
        po_item.size = po_item.size.split('X')[1] + 'X' + po_item.size.split('X')[0]
    }
    // Rename tees by size
    if (po_item.item_detail === 'Tee') {
      if (po_item.size.includes('X')) {
        if (po_item.size.split('X')[0] === po_item.size.split('X')[1]) {
          po_item.item_detail = 'Eqaul Tee'
          po_item.size = po_item.size.split('X')[0]
        } else po_item.item_detail = 'Reducing Tee'
      } else {
        po_item.item_detail = 'Equal Tee'
      }
    }
    // Rename couplings by size
    if (po_item.item_detail === 'Coupling') {
      if (po_item.size.includes('X')) {
        if (po_item.size.split('X')[0] > po_item.size.split('X')[1]) po_item.item_detail = 'Reducing Coupling'
        if (po_item.size.split('X')[0] < po_item.size.split('X')[1]) {
          po_item.item_detail = 'Reducing Coupling'
          po_item.size = po_item.size.split('X')[1] + 'X' + po_item.size.split('X')[0]
        }
      }
    }
    // Mark all beveled pipe as plain
    if (po_item.item_detail === 'Pipe')
      po_item.end_type = po_item.end_type.replace('Beveled x Plain', 'Plain').replace('Beveled', 'Plain')
    // Convert sizes to decimals
    po_item.size = po_item.size
      .replaceAll('1 1/2', '1.5')
      .replaceAll('1 1/4', '1.25')
      .replaceAll('2 1/2', '2,5')
      .replaceAll('3/4', '.75')
      .replaceAll('1/2', '.5')
      .replaceAll('3/8', '.375')
      .replaceAll('1/4', '.25')
      .replaceAll('0.', '.')
    // Schedules by size
    let usesize = 100
    if (
      po_item.size.includes('-') === false &&
      po_item.size.includes('flat') === false &&
      po_item.size.includes('taps') === false &&
      po_item.size !== 'No Size Found'
    ) {
      if (po_item.size.includes('X')) {
        usesize = parseFloat(po_item.size.split('X')[0])
      } else {
        usesize = parseFloat(po_item.size)
      }
    }
    if (usesize < 12 && po_item.schedule === '40') po_item.schedule = 'STD'
    if (usesize < 10 && po_item.schedule === '80') po_item.schedule = 'XS'
    // Change material for 7114
    if (jobnum === 7114 && po_item.material === 'A105') po_item.material = 'CS'
    // For front end  purposes
    po_item.hide = true
    return po_item
  })

  //   // ////// ////// ////// //  // ////// //////
  /// /// //  //   //   //     //  // //     //
  // / // //////   //   //     ////// ////// //////
  //   // //  //   //   //     //  // //         //
  //   // //  //   //   ////// //  // ////// //////
  let forcematches = []

  po_items.map((po_item) => {
    // Create item breakpoints array for each po item
    po_item.breakpoints = []
    po_item.suggestions = []
    po_item.matches = []
    // Add force matches
    if (
      po_item['ForceMatch'] !== undefined &&
      po_item['ForceMatch'] !== 'OMIT' &&
      po_item['ForceMatch'] !== 'Import' &&
      po_item['ForceMatch'] !== 'No Match' &&
      forcematches.filter((match) => match.desc === po_item.description && match.tag === po_item['ForceMatch'])
        .length === 0
    ) {
      // Add to forcematches list
      forcematches.push({ desc: po_item.description, tag: po_item['ForceMatch'] })
    }
    let suggestionlist = []
    sp_items.map((sp_item) => {
      let itemmatch = false
      let itemdetmatch = false
      let sizematch = false
      let materialmatch = false
      let schedclassmatch = false
      let seammatch = false
      let endtypematch = false
      let facematch = false
      // Check item match
      if (po_item.item === sp_item.item) itemmatch = true
      // Check item details match
      if (po_item.item_detail === sp_item.item_detail) itemdetmatch = true
      // Check size match
      if (po_item.size.includes('-') && po_item.size.includes('X')) {
        // Check if size falls within a size range
        if (
          parseFloat(sp_item.size.split('x')[0]) < parseFloat(po_item.size.split('X')[0].split('-')[0]) &&
          parseFloat(sp_item.size.split('x')[0]) > parseFloat(po_item.size.split('X')[0].split('-')[1]) &&
          parseFloat(sp_item.size.split('x')[1]) === parseFloat(po_item.size.split('X')[1])
        ) {
          sizematch = true
        }
        // Check if sizes with X match
      } else if (po_item.size.includes('X')) {
        if (
          parseFloat(sp_item.size.split('x')[0]) === parseFloat(po_item.size.split('X')[0]) &&
          parseFloat(sp_item.size.split('x')[1]) === parseFloat(po_item.size.split('X')[1])
        )
          sizematch = true
      }
      // If no reange or X, just check size straight up
      else if (parseFloat(sp_item.size) === parseFloat(po_item.size)) sizematch = true
      // Check if materials match
      if (po_item.material === sp_item.material) materialmatch = true
      // Check if schedules/class match
      let schedmatch = false
      let classmatch = false
      // Check schdules
      if (
        po_item.schedule === sp_item.schedule ||
        (po_item.schedule === '40S' && sp_item.schedule === 'STD') ||
        (po_item.schedule === 'STD' && sp_item.schedule === '40S')
      )
        schedmatch = true
      // Check classes
      if (po_item.class === sp_item.class) classmatch = true
      // Stub end flange ( schedule only )
      if (po_item.item_detail === 'Stub End Flange' && schedmatch) schedclassmatch = true
      // Flanges that need only classes to match
      else if (
        (po_item.item_detail === 'Lap Joint Flange' ||
          po_item.item_detail === 'Slip On Flange' ||
          po_item.item_detail === 'Blind Flange') &&
        classmatch
      )
        schedclassmatch = true
      // All other flanges need both class and schedule
      else if (
        po_item.item === 'FLANGES' &&
        schedmatch &&
        classmatch &&
        (po_item.item_detail !== 'Lap Joint Flange' ||
          po_item.item_detail !== 'Slip On Flange' ||
          po_item.item_detail !== 'Blind Flange' ||
          po_item.item_detail !== 'Stub End Flange')
      )
        schedclassmatch = true
      // Classes that are 3000, 6000, or 9000
      else if (classmatch && (po_item.class === '3000' || po_item.class === '6000' || po_item.class === '9000'))
        schedclassmatch = true
      // All other items
      else if (po_item.item !== 'FLANGES' && schedmatch) schedclassmatch = true
      // Check if seams match
      if (po_item.seam === sp_item.seam) {
        seammatch = true
      }
      // Check end types
      if (po_item.end_type === sp_item.end_type || sp_item.end_type === undefined || po_item.end_type === undefined) {
        endtypematch = true
      }
      // Check faces
      if (po_item.face === sp_item.face || sp_item.face === undefined || po_item.face === undefined) {
        facematch = true
      }
      // If everything matches, push the tag of the SP item to the po matches array
      if (
        itemmatch &&
        itemdetmatch &&
        sizematch &&
        materialmatch &&
        schedclassmatch &&
        seammatch &&
        endtypematch &&
        facematch
      ) {
        sp_item.matched = true
        if (po_item.breakpoints.includes('Match') === false) po_item.breakpoints.push('Match')
        if (po_item.matches.includes(sp_item['NEW TAG']) === false) po_item.matches.push(sp_item['NEW TAG'])
        // Breaks at face
      } else if (
        itemmatch &&
        itemdetmatch &&
        sizematch &&
        materialmatch &&
        schedclassmatch &&
        seammatch &&
        endtypematch &&
        !facematch
      ) {
        // If first break, clear suggestion and add to breakpoints
        if (po_item.breakpoints.includes('Face') === false) {
          po_item.suggestions = []
          po_item.breakpoints.push('Face')
        }
        if (suggestionlist.includes(sp_item.description) === false) {
          suggestionlist.push(sp_item.description)
          po_item.suggestions.push(sp_item)
        }
        // Breaks at end type
      } else if (
        itemmatch &&
        itemdetmatch &&
        sizematch &&
        materialmatch &&
        schedclassmatch &&
        seammatch &&
        !endtypematch
      ) {
        // If first break this late in checking, clear suggestion and add to breakpoints
        if (po_item.breakpoints.includes('End Type') === false && po_item.breakpoints.includes('Face') === false) {
          po_item.suggestions = []
        }
        // Add breakpoint
        if (po_item.breakpoints.includes('End Type') === false) po_item.breakpoints.push('End Type')
        if (po_item.breakpoints.includes('Face') === false && suggestionlist.includes(sp_item.description) === false) {
          suggestionlist.push(sp_item.description)
          po_item.suggestions.push(sp_item)
        }

        // Breaks at seam
      } else if (itemmatch && itemdetmatch && sizematch && materialmatch && schedclassmatch && !seammatch) {
        // If first break this late in checking, clear suggestion and add to breakpoints
        if (
          po_item.breakpoints.includes('Seam') === false &&
          po_item.breakpoints.includes('End Type') === false &&
          po_item.breakpoints.includes('Face') === false
        ) {
          po_item.suggestions = []
        }
        // Add breakpoint
        if (po_item.breakpoints.includes('Seam') === false) po_item.breakpoints.push('Seam')
        if (
          po_item.breakpoints.includes('End Type') === false &&
          po_item.breakpoints.includes('Face') === false &&
          suggestionlist.includes(sp_item.description) === false
        ) {
          suggestionlist.push(sp_item.description)
          po_item.suggestions.push(sp_item)
        }
      } // Breaks at schedule/class
      else if (itemmatch && itemdetmatch && sizematch && materialmatch && !schedclassmatch) {
        // If first break this late in checking, clear suggestion and add to breakpoints
        if (
          po_item.breakpoints.includes('Schedule/Class') === false &&
          po_item.breakpoints.includes('Seam') === false &&
          po_item.breakpoints.includes('End Type') === false &&
          po_item.breakpoints.includes('Face') === false
        ) {
          po_item.suggestions = []
        }
        // Add breakpoint
        if (po_item.breakpoints.includes('Schedule/Class') === false) po_item.breakpoints.push('Schedule/Class')
        if (
          po_item.breakpoints.includes('Seam') === false &&
          po_item.breakpoints.includes('End Type') === false &&
          po_item.breakpoints.includes('Face') === false &&
          suggestionlist.includes(sp_item.description) === false
        ) {
          suggestionlist.push(sp_item.description)
          po_item.suggestions.push(sp_item)
        }
      } // Breaks at material
      else if (itemmatch && itemdetmatch && sizematch && !materialmatch) {
        // If first break this late in checking, clear suggestion and add to breakpoints

        if (
          po_item.breakpoints.includes('Material') === false &&
          po_item.breakpoints.includes('Schedule/Class') === false &&
          po_item.breakpoints.includes('Seam') === false &&
          po_item.breakpoints.includes('End Type') === false &&
          po_item.breakpoints.includes('Face') === false
        ) {
          po_item.suggestions = []
        }
        // Add breakpoint
        if (po_item.breakpoints.includes('Material') === false) po_item.breakpoints.push('Material')
        if (
          po_item.breakpoints.includes('Schedule/Class') === false &&
          po_item.breakpoints.includes('Seam') === false &&
          po_item.breakpoints.includes('End Type') === false &&
          po_item.breakpoints.includes('Face') === false &&
          suggestionlist.includes(sp_item.description) === false
        ) {
          suggestionlist.push(sp_item.description)
          po_item.suggestions.push(sp_item)
        }
      } // Breaks at size
      else if (itemmatch && itemdetmatch && !sizematch) {
        // If first break this late in checking, clear suggestion and add to breakpoints
        if (po_item.breakpoints.includes('Size') === false) po_item.breakpoints.push('Size')
        // Breaks at item detail
      } else if (itemmatch && !itemdetmatch) {
        // If first break this late in checking, clear suggestion and add to breakpoints
        if (po_item.breakpoints.includes('Item Detail') === false) po_item.breakpoints.push('Item Detail')
        // Breaks at item
      } else if (!itemmatch) {
        // If first break this late in checking, clear suggestion and add to breakpoints
        if (po_item.breakpoints.includes('Item') === false) po_item.breakpoints.push('Item')
      }
      // Error check formulas
      // if (po_item.item_detail === '45 Degree Elbow' && itemdetmatch && sizematch) console.log(sp_item.size, po_item.size)
      return po_item
    })
    // Decide breakpoint for each item
    if (po_item.breakpoints.includes('Match')) po_item.breakpoint = undefined
    else if (po_item.breakpoints.includes('Face')) po_item.breakpoint = 'Face'
    else if (po_item.breakpoints.includes('End Type')) po_item.breakpoint = 'End Type'
    else if (po_item.breakpoints.includes('Seam')) po_item.breakpoint = 'Seam'
    else if (po_item.breakpoints.includes('Schedule/Class')) po_item.breakpoint = 'Schedule/Class'
    else if (po_item.breakpoints.includes('Material')) po_item.breakpoint = 'Material'
    else if (po_item.breakpoints.includes('Size')) po_item.breakpoint = 'Size'
    else if (po_item.breakpoints.includes('Item Detail')) po_item.breakpoint = 'Item Detail'
    else if (po_item.breakpoints.includes('Item')) {
      po_item.breakpoint = 'Item'
    }
    return po_item
  })

  // Go back and add forced matches to items
  po_items.map((po_item) => {
    forcematches.map((match) => {
      if (po_item.description === match.desc && po_item.matches.includes(match.tag) === false) {
        po_item.matches.unshift(match.tag)
        po_item.breakpoint = undefined
      }
      return match
    })
    // Remove break point from unwanted items
    if (po_item['ForceMatch'] !== undefined) po_item.breakpoint = undefined
    // Add matches to item
    if (po_item.matches.length > 0) po_item.match1 = po_item.matches[0]
    if (po_item.matches.length > 1) po_item.match2 = po_item.matches[1]
    if (po_item.matches.length > 2) po_item.match3 = po_item.matches[2]
    if (po_item.matches.length > 3) po_item.match4 = po_item.matches[3]
    if (po_item.matches.length > 4) po_item.match5 = po_item.matches[4]
    if (po_item.matches.length > 5) po_item.match6 = po_item.matches[5]
    return po_item
  })

  // Discrepancies
  let discrepancies = [
    {
      type: 'Matches',
      value: po_items.filter((po_item) => po_item.breakpoint === undefined).length,
    },
    { type: 'Face', value: po_items.filter((po_item) => po_item.breakpoint === 'Face').length },
    {
      type: 'End Type',
      value: po_items.filter((po_item) => po_item.breakpoint === 'End Type').length,
    },
    { type: 'Seam', value: po_items.filter((po_item) => po_item.breakpoint === 'Seam').length },
    {
      type: 'Schedule/Class',
      value: po_items.filter((po_item) => po_item.breakpoint === 'Schedule/Class').length,
    },
    {
      type: 'Material',
      value: po_items.filter((po_item) => po_item.breakpoint === 'Material').length,
    },
    { type: 'Size', value: po_items.filter((po_item) => po_item.breakpoint === 'Size').length },
    {
      type: 'Item Detail',
      value: po_items.filter((po_item) => po_item.breakpoint === 'Item Detail').length,
    },
    { type: 'Item', value: po_items.filter((po_item) => po_item.breakpoint === 'Item').length },
    { type: 'Total', value: po_items.length },
  ]

  dispatch({
    type: COMPARE_ITEMS,
    payload: {
      sp_items: sp_items,
      po_items: po_items,
      sp_headers: sp_data.headers,
      po_headers: po_data.headers,
      discrepancies: discrepancies,
    },
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
    return header
  })

  // Add row info for each item
  sp_items.map((sp_item) => {
    let newrow = {}
    headersarray.map((header) => {
      newrow[header] = sp_item[header]
      return header
    })
    newrow.material = sp_item.material
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
  saveAs(new Blob([s2ab(wbout)], { type: 'application/octet-stream' }), 'new_input.xlsx')
}

export const downloadPO = (po_items, headers) => async (dispatch) => {
  // Create new workbook and add props
  let wb = XLSX.utils.book_new()
  wb.Props = {
    Title: 'New PO',
    Subject: 'New PO',
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
    return header
  })

  // Add row info for each item
  po_items.map((po_item) => {
    let newrow = {}
    headersarray.map((header) => {
      newrow[header] = po_item[header]
      return header
    })
    // Add new props
    newrow['match1'] = po_item['match1']
    newrow['match2'] = po_item['match2']
    newrow['match3'] = po_item['match3']
    newrow['match4'] = po_item['match4']
    newrow['match5'] = po_item['match5']
    ws_data.push(newrow)
    return po_item
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
  saveAs(new Blob([s2ab(wbout)], { type: 'application/octet-stream' }), 'new_po.xlsx')
}

export const downloadCompare = (sp_items, po_items, discrepancies) => async (dispatch) => {
  // Create new workbook and add props
  let wb = XLSX.utils.book_new()
  wb.Props = {
    Title: 'Compare',
    Subject: 'Compare',
    Author: 'Kurt McCune',
    CreatedDate: new Date(2017, 12, 19),
  }

  // Create json object for SP sheet along with new tag column
  let sp_ws_data = []
  let sp_ws_row = {}
  let headersarray = [
    'item',
    'item_detail',
    'size',
    'material',
    'schedule',
    'class',
    'seam',
    'end_type',
    'face',
    'matched',
    'NEW TAG',
    'description',
  ]
  headersarray.map((header) => {
    sp_ws_row[header] = undefined
    return header
  })

  // Add row info for each item
  sp_items.map((sp_item) => {
    let newrow = {}
    headersarray.map((header) => {
      newrow[header] = sp_item[header]
      return header
    })
    sp_ws_data.push(newrow)
    return sp_item
  })

  // Create a worksheet containing SP data from the object above
  let sp_ws = XLSX.utils.json_to_sheet(sp_ws_data)

  // Create json object for PO sheet along with new tag column
  let po_ws_data = []
  let po_ws_row = {}
  headersarray = [
    'item',
    'item_detail',
    'size',
    'material',
    'schedule',
    'class',
    'seam',
    'end_type',
    'face',
    'breakpoint',
    'description',
    'match1',
    'match2',
    'match3',
    'match4',
    'match5',
  ]
  headersarray.map((header) => {
    po_ws_row[header] = undefined
    return header
  })

  // Add row info for each item
  po_items.map((po_item) => {
    let newrow = {}
    headersarray.map((header) => {
      newrow[header] = po_item[header]
      return header
    })
    newrow['suggestions'] = po_item.suggestions.length
    po_ws_data.push(newrow)
    return po_item
  })

  // Create a worksheet containing data from the object above
  let po_ws = XLSX.utils.json_to_sheet(po_ws_data)

  // Create sheet for discrepancies
  // Create a worksheet containing discprepancy data
  let disc_ws = XLSX.utils.json_to_sheet(discrepancies)

  // Find the correct tab and write the worksheet to that tab
  wb.SheetNames.push('SP')
  wb.Sheets['SP'] = sp_ws
  wb.SheetNames.push('PO')
  wb.Sheets['PO'] = po_ws
  wb.SheetNames.push('Discrepancies')
  wb.Sheets['Discrepancies'] = disc_ws
  let wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' })

  // Download the file
  function s2ab(s) {
    let buf = new ArrayBuffer(s.length)
    let view = new Uint8Array(buf)
    for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff
    return buf
  }
  saveAs(new Blob([s2ab(wbout)], { type: 'application/octet-stream' }), 'compare.xlsx')
}

export const setMatch = (sp_items, po_items, item, suggestion) => async (dispatch) => {
  // Iterate po_items and add match
  po_items.map((po_item) => {
    if (po_item.description === item.description && po_item.size === item.size) {
      po_item.matches.push(suggestion['NEW TAG'])
      po_item.breakpoint = undefined
    }
    return po_item
  })

  sp_items.map((sp_item) => {
    if (sp_item.description === suggestion.description && sp_item.size === suggestion.size) sp_item.matched = true
    return sp_item
  })

  // Discrepancies
  let discrepancies = [
    { type: 'Matches', value: po_items.filter((po_item) => po_item.matches.length > 0).length },
    { type: 'Face', value: po_items.filter((po_item) => po_item.breakpoint === 'Face').length },
    {
      type: 'End Type',
      value: po_items.filter((po_item) => po_item.breakpoint === 'End Type').length,
    },
    { type: 'Seam', value: po_items.filter((po_item) => po_item.breakpoint === 'Seam').length },
    {
      type: 'Schedule/Class',
      value: po_items.filter((po_item) => po_item.breakpoint === 'Schedule/Class').length,
    },
    {
      type: 'Material',
      value: po_items.filter((po_item) => po_item.breakpoint === 'Material').length,
    },
    { type: 'Size', value: po_items.filter((po_item) => po_item.breakpoint === 'Size').length },
    {
      type: 'Item Detail',
      value: po_items.filter((po_item) => po_item.breakpoint === 'Item Detail').length,
    },
    { type: 'Item', value: po_items.filter((po_item) => po_item.breakpoint === 'Item').length },
    { type: 'Total', value: po_items.length },
  ]

  dispatch({
    type: ADD_MATCH,
    payload: {
      sp_items: sp_items,
      po_items: po_items,
      discrepancies: discrepancies,
    },
  })
}
