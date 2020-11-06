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
    addProps(' DESCRIPTION', 'description')
    addProps('SPM DESCRIPTION', 'description')
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

  // Edit SP items before main edit
  sp_items.map((sp_item) => {
    // Sketch
    sp_item.sketch = sp_item.sketch.split('/')[sp_item.sketch.split('/').length - 1]
    // Description
    sp_item.newdesc =
      ' ' +
      sp_item.description
        .replaceAll(';', ' ')
        .toUpperCase()
        .replaceAll('SCH ', 'S-')
        .replaceAll('STD WT', 'STD')
        .replaceAll(',', ' ')
    // Sizes
    sp_item.size = sp_item.size
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
    // Add material from old tag
    if (sp_item.tag.includes('CS-') || sp_item.tag.includes(' CS ') || sp_item.tag.includes('-CS ')) {
      sp_item.material = 'CS'
    }
    if (sp_item.tag.includes('CSW-')) sp_item.material = 'CS'
    if (sp_item.tag.includes('A106-')) sp_item.material = 'A106'
    if (sp_item.tag.includes('A106W-')) sp_item.material = 'A106'
    if (sp_item.tag.includes('A53-')) sp_item.material = 'A53'
    if (sp_item.tag.includes('A53W-')) sp_item.material = 'A53'
    return sp_item
  })

  // Edit PO items before main edit
  po_items.map((po_item) => {
    // Description
    po_item.description = ' ' + po_item['Text69'] + ' ' + po_item['ItemDesc']
    po_item.newdesc = po_item.description.replaceAll(';', ' ')
    po_item.newdesc = po_item.newdesc.toUpperCase()
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
    if (po_item.newdesc.includes('~')) po_item.size = po_item.newdesc.split('~')[1].replace('1-1/2', '1 1/2')
    return po_item
  })

  // Add info to sp_items and po_items
  const addInfo = (file_items) => {
    file_items.map((file_item) => {
      // Material
      if (
        file_item.newdesc.includes('CS-') ||
        file_item.newdesc.includes(' CS ') ||
        file_item.newdesc.includes('-CS ')
      ) {
        file_item.material = 'CS'
      }
      if (file_item.newdesc.includes('A105') || file_item.newdesc.includes('A-105')) file_item.material = 'A105'
      if (file_item.newdesc.includes('A53') || file_item.newdesc.includes('A-53')) file_item.material = 'A53'
      if (file_item.newdesc.includes('A403') || file_item.newdesc.includes('A-403')) file_item.material = 'A403'
      if (file_item.newdesc.includes('A234') || file_item.newdesc.includes('A-234')) file_item.material = 'A234'
      if (file_item.newdesc.includes('A587') || file_item.newdesc.includes('A-587')) file_item.material = 'A587'
      if (file_item.newdesc.includes('A106') || file_item.newdesc.includes('A-106')) file_item.material = 'A106'
      if (file_item.newdesc.includes('A671') || file_item.newdesc.includes('A-671')) file_item.material = 'A671'
      if (file_item.newdesc.includes('A197') || file_item.newdesc.includes('A-197')) file_item.material = 'A197'
      if (
        file_item.newdesc.includes('F22') ||
        file_item.newdesc.includes('F 22') ||
        file_item.newdesc.includes('P22') ||
        file_item.newdesc.includes('P 22') ||
        file_item.newdesc.includes('WP22')
      )
        file_item.material = 'P22'
      if (
        file_item.newdesc.includes('F11') ||
        file_item.newdesc.includes('F 11') ||
        file_item.newdesc.includes('P11') ||
        file_item.newdesc.includes('P 11') ||
        file_item.newdesc.includes('WP11')
      )
        file_item.material = 'P11'
      if (
        file_item.newdesc.includes('P9') ||
        file_item.newdesc.includes('P 9') ||
        file_item.newdesc.includes('F9') ||
        file_item.newdesc.includes('F 9')
      )
        file_item.material = 'P9'

      if (
        file_item.newdesc.includes('P91') ||
        file_item.newdesc.includes('F 91') ||
        file_item.newdesc.includes('P 91') ||
        file_item.newdesc.includes('F91')
      )
        file_item.material = 'P91'

      if (file_item.newdesc.includes('304')) file_item.material = '304'
      if (file_item.newdesc.includes('316')) file_item.material = '316'
      if (file_item.newdesc.includes('HDPE')) file_item.material = 'HDPE'
      if (file_item.newdesc.includes(' AL ') || file_item.newdesc.includes('Alum ')) file_item.material = 'AL'
      if (
        file_item.newdesc.includes('A333') ||
        file_item.newdesc.includes('A420') ||
        file_item.newdesc.includes('A350')
      )
        file_item.material = 'LT'
      if (file_item.newdesc.includes('GAL ') || file_item.newdesc.includes('GALV')) file_item.material = 'GALV'
      // Rename CS materials
      if (file_item.material)
        file_item.material = file_item.material.replace('A234', 'CS').replace('A105', 'CS').replace('A587', 'A106')
      // End type
      file_item.end_type = 'Plain'

      if (
        file_item.newdesc.includes(' BW ') ||
        file_item.newdesc.includes(' BE,') ||
        file_item.newdesc.includes(' BW-') ||
        file_item.newdesc.includes(' BE ')
      )
        file_item.end_type = 'Beveled'
      if (file_item.newdesc.includes(' BXT') || file_item.newdesc.includes(' TXB'))
        file_item.end_type = 'Beveled x Threaded'
      if (
        file_item.newdesc.includes(' BXP') ||
        file_item.newdesc.includes(' PXB') ||
        file_item.newdesc.includes('BLE X PSE')
      )
        file_item.end_type = 'Beveled x Plain'
      if (file_item.newdesc.includes(' NPT') || file_item.newdesc.includes(' TBE')) file_item.end_type = 'Threaded'
      if (
        file_item.newdesc.includes(' PXT') ||
        file_item.newdesc.includes(' TXP') ||
        file_item.newdesc.includes('POE/TOE') ||
        file_item.newdesc.includes('POE X TOE')
      )
        file_item.end_type = 'Plain x Threaded'
      // Item detail
      // Weldneck Flange
      if (file_item.newdesc.includes('WN ') || file_item.newdesc.includes('NECK '))
        file_item.item_detail = 'Weldneck Flange'
      // Oriface Flange
      if (file_item.newdesc.includes('OFIF')) file_item.item_detail = 'Oriface Flange'
      // Blind Flange
      if (file_item.newdesc.includes('BLIND') || file_item.newdesc.includes('BLD '))
        file_item.item_detail = 'Blind Flange'
      // Slip On Flange
      if (file_item.newdesc.includes('SLIP') || file_item.newdesc.includes(' SO ')) {
        file_item.item_detail = 'Slip On Flange'
      }
      // Lap Joint Flange
      if (file_item.newdesc.includes(' LAP')) file_item.item_detail = 'Lap Joint Flange'
      // Threaded Flange
      if ((file_item.newdesc.includes('THR') || file_item.newdesc.includes('THD')) && file_item.newdesc.includes('FL'))
        file_item.item_detail = 'Threaded Flange'
      // Socketweld Flange
      if (file_item.newdesc.includes('SW') && file_item.newdesc.includes('FL'))
        file_item.item_detail = 'Socketweld Flange'
      // Stub End Flange
      if (file_item.newdesc.includes('STUB')) file_item.item_detail = 'Stub End Flange'
      // Plate Flange
      if (
        file_item.newdesc.includes(' PL ') &&
        (file_item.newdesc.includes('FLG') || file_item.newdesc.includes('FLANGE'))
      )
        file_item.item_detail = 'Plate Flange'
      // Sockolet
      if (file_item.newdesc.includes('SOCKO') || file_item.newdesc.includes(' SOL ')) file_item.item_detail = 'Sockolet'
      // Weldolet
      if (file_item.newdesc.includes('WELDO')) file_item.item_detail = 'Weldolet'
      // Thredolet
      if (
        file_item.newdesc.includes('THREADO') ||
        file_item.newdesc.includes('THREDO') ||
        file_item.newdesc.includes(' TOL ')
      )
        file_item.item_detail = 'Thredolet'
      // Flatolet
      if (file_item.newdesc.includes('FLATO')) file_item.item_detail = 'Flatolet'
      // Elbolet
      if (file_item.newdesc.includes('ELBOLET')) file_item.item_detail = 'Elbolet'
      // Latrolet
      if (file_item.newdesc.includes('LATRO')) file_item.item_detail = 'Latrolet'
      // OUTLET
      if (file_item.newdesc.includes('OUTLET')) {
        if (file_item.newdesc.includes('SW')) file_item.item_detail = 'Sockolet'
        if (file_item.newdesc.includes('BE')) file_item.item_detail = 'Weldolet'
      }
      // Concentric Reducer
      if (
        file_item.newdesc.includes('CONC') ||
        (file_item.newdesc.includes('CON ') &&
          (file_item.newdesc.includes('RED ') || file_item.newdesc.includes('REDUCER')))
      )
        file_item.item_detail = 'Concentric Reducer'
      // Eccentric Reducer
      if (
        file_item.newdesc.includes('ECC') &&
        (file_item.newdesc.includes('RED ') || file_item.newdesc.includes('REDUCER'))
      )
        file_item.item_detail = 'Eccentric Reducer'
      // Elbows
      if (file_item.newdesc.includes('ELBOW') || file_item.newdesc.includes('ELL ')) {
        if (file_item.newdesc.includes('90')) file_item.item_detail = '90 Degree Elbow'
        if (file_item.newdesc.includes('45')) file_item.item_detail = '45 Degree Elbow'
        if (file_item.newdesc.includes('SR ') || file_item.newdesc.includes('SHORT')) {
          file_item.item_detail = file_item.item_detail + ' - Short'
        }
        if (file_item.newdesc.includes(' 3D ')) file_item.item_detail = file_item.item_detail + ' 3D'
      }
      // Miter
      if (file_item.newdesc.includes('MITER')) {
        if (file_item.newdesc.includes('90')) file_item.item_detail = '90 Degree Miter'
        if (file_item.newdesc.includes('45')) file_item.item_detail = '45 Degree Miter'
      }
      // Nipple
      if (file_item.newdesc.includes('NIPP')) file_item.item_detail = 'Nipple'
      // Tee
      if (file_item.newdesc.includes('TEE')) file_item.item_detail = 'Tee'
      // Concentric Swage
      if (file_item.newdesc.includes('CON') && file_item.newdesc.includes('SWAGE'))
        file_item.item_detail = 'Concentric Swage'
      // Eccentric Swage
      if (file_item.newdesc.includes('ECC') && file_item.newdesc.includes('SWAGE'))
        file_item.item_detail = 'Eccentric Swage'
      // Cap
      if (
        file_item.newdesc.includes('CAP ') ||
        file_item.newdesc.includes('CAP,') ||
        file_item.newdesc.includes('CAP;')
      )
        file_item.item_detail = 'Cap'
      // Union
      if (file_item.newdesc.includes('UNION')) file_item.item_detail = 'Union'
      // Coupling
      if (file_item.newdesc.includes('CPLG') || file_item.newdesc.includes('COUP')) file_item.item_detail = 'Coupling'
      // Strainer
      if (file_item.newdesc.includes('STRAIN')) file_item.item_detail = 'Strainer'
      // Plug
      if (file_item.newdesc.includes('PLUG') || file_item.newdesc.includes('PLG ')) file_item.item_detail = 'Plug'
      // Gasket
      if (file_item.newdesc.includes('GASK')) file_item.item_detail = 'Gasket'
      // Reinforcment Pad
      if (file_item.newdesc.includes('REINFORCE')) file_item.item_detail = 'Reinforcment Pad'
      // Insert
      if (file_item.newdesc.includes(' INSERT')) file_item.item_detail = 'Insert'
      // Cross
      if (file_item.newdesc.includes('CROSS')) file_item.item_detail = 'Cross'
      // Eccentric swage niipple
      if (file_item.newdesc.includes('SWG NIP ECC')) file_item.item_detail = 'Eccentric Swage Nipple'
      // Pipe
      if (file_item.newdesc.includes('PIPE ')) file_item.item_detail = 'Pipe'
      // Seam
      if (file_item.newdesc.includes('WELDED')) file_item.seam = 'Welded'
      if (file_item.material === '316' && file_item.end_type === 'Beveled') file_item.seam = 'Welded'
      if (file_item.newdesc.includes('ERW')) file_item.seam = 'Welded'
      if (file_item.newdesc.includes('ELECTRIC FUSION')) file_item.seam = 'Welded'
      if (file_item.newdesc.includes('TYPE W,')) file_item.seam = 'Welded'
      if (file_item.newdesc.includes('SMLS OR WELDED')) file_item.seam = undefined
      if (file_item.newdesc.includes('SOCKET WELDED')) file_item.seam = undefined
      if (file_item.newdesc.includes('100% RAD')) file_item.seam = 'Welded X-Ray'
      // Reverse swapped sizes
      if (
        file_item.size.includes('X') &&
        parseFloat(file_item.size.split('X')[0]) < parseFloat(file_item.size.split('X')[1]) &&
        file_item.item_detail !== 'Nipple'
      )
        file_item.size = file_item.size.split('X')[1] + 'X' + file_item.size.split('X')[0]
      // Remove repeated size
      if (file_item.size.split('X')[0] === file_item.size.split('X')[1]) file_item.size = file_item.size.split('X')[0]
      // Schedule
      //CALC
      if (file_item.newdesc.includes('CALC,')) file_item.schedule = 'CALC'
      //10
      if (file_item.newdesc.includes('S-10') || file_item.newdesc.includes(' 10') || file_item.newdesc.includes('S10'))
        file_item.schedule = '10'
      //10S
      if (
        file_item.newdesc.includes('S-10S') ||
        file_item.newdesc.includes(' 10S') ||
        file_item.newdesc.includes('S10S')
      )
        file_item.schedule = '10S'
      //80
      if (file_item.newdesc.includes('S-80') || file_item.newdesc.includes(' 80 ') || file_item.newdesc.includes('S80'))
        file_item.schedule = '80'
      //80S
      if (
        file_item.newdesc.includes('S-80S') ||
        file_item.newdesc.includes(' 80S') ||
        file_item.newdesc.includes('S80S')
      )
        file_item.schedule = '80S'
      //160
      if (
        file_item.newdesc.includes('S-160') ||
        file_item.newdesc.includes(' 160') ||
        file_item.newdesc.includes('S160')
      )
        file_item.schedule = '160'
      //160S
      if (
        file_item.newdesc.includes('S-160S') ||
        file_item.newdesc.includes(' 160S') ||
        file_item.newdesc.includes('S160S')
      )
        file_item.schedule = '160S'
      //40
      if (file_item.newdesc.includes('S-40') || file_item.newdesc.includes(' 40') || file_item.newdesc.includes('S40'))
        file_item.schedule = '40'
      //40S
      if (
        file_item.newdesc.includes('S-40S') ||
        file_item.newdesc.includes(' 40S') ||
        file_item.newdesc.includes('S40S')
      )
        file_item.schedule = '40S'
      //STD
      if (
        file_item.newdesc.includes(',STD') ||
        file_item.newdesc.includes(' STD') ||
        file_item.newdesc.includes('S-STD')
      )
        file_item.schedule = 'STD'
      //XS
      if (file_item.newdesc.includes('S-XS') || file_item.newdesc.includes(' XS') || file_item.newdesc.includes(' XH '))
        file_item.schedule = 'XS'
      //STD X XS
      if (file_item.newdesc.includes('STD X XS')) file_item.schedule = 'STDXXS'
      //XS X 160
      if (file_item.newdesc.includes('XS X 160')) file_item.schedule = 'XSX160'
      //40S X 10S
      if (
        file_item.newdesc.includes('40S X 10S') ||
        file_item.newdesc.includes('S-40S X S-10S') ||
        file_item.newdesc.includes('10SX40S')
      )
        file_item.schedule = '40SX10S'
      //40S X 80S
      if (
        file_item.newdesc.includes('40S X 80S') ||
        file_item.newdesc.includes('S-40S X S-80S') ||
        file_item.newdesc.includes('40SX80S')
      )
        file_item.schedule = '40SX80S'
      //10S X 40S
      if (
        file_item.newdesc.includes('10S X 40S') ||
        file_item.newdesc.includes('S-10S X S-40S') ||
        file_item.newdesc.includes('10SX40S')
      )
        file_item.schedule = '10SX40S'
      // Class
      if (
        file_item.newdesc.includes('CL125') ||
        file_item.newdesc.includes('CL 125') ||
        file_item.newdesc.includes('CLASS 125') ||
        file_item.newdesc.includes('125#') ||
        file_item.newdesc.includes('125 LBS') ||
        file_item.newdesc.includes(' 125 ')
      )
        file_item.class = '125'
      if (
        file_item.newdesc.includes('CL150') ||
        file_item.newdesc.includes('CL 150') ||
        file_item.newdesc.includes('CLASS 150') ||
        file_item.newdesc.includes('150#') ||
        file_item.newdesc.includes('150 LBS') ||
        file_item.newdesc.includes(' 150 ')
      )
        file_item.class = '150'
      if (
        file_item.newdesc.includes('CL300') ||
        file_item.newdesc.includes('CL 300') ||
        file_item.newdesc.includes('CLASS 300') ||
        file_item.newdesc.includes('300#') ||
        file_item.newdesc.includes('300 LBS') ||
        file_item.newdesc.includes(' 300 ')
      )
        file_item.class = '300'
      if (
        file_item.newdesc.includes('CL600') ||
        file_item.newdesc.includes('CL 600') ||
        file_item.newdesc.includes('CLASS 600') ||
        file_item.newdesc.includes('600#') ||
        file_item.newdesc.includes('600 LBS') ||
        file_item.newdesc.includes(' 600 ')
      )
        file_item.class = '600'
      if (
        file_item.newdesc.includes('CL800') ||
        file_item.newdesc.includes('CL 800') ||
        file_item.newdesc.includes('CLASS 800') ||
        file_item.newdesc.includes('800#') ||
        file_item.newdesc.includes('800 LBS') ||
        file_item.newdesc.includes(' 800 ')
      )
        file_item.class = '800'
      if (
        file_item.newdesc.includes('CL3000') ||
        file_item.newdesc.includes('CL 3000') ||
        file_item.newdesc.includes('CLASS 3000') ||
        file_item.newdesc.includes('3000#') ||
        file_item.newdesc.includes(' 3M ') ||
        file_item.newdesc.includes('3000 LBS') ||
        file_item.newdesc.includes(' 3000 ')
      )
        file_item.class = '3000'
      if (
        file_item.newdesc.includes('CL6000') ||
        file_item.newdesc.includes('CL 6000') ||
        file_item.newdesc.includes('CLASS 6000') ||
        file_item.newdesc.includes('6000#') ||
        file_item.newdesc.includes(' 6M ') ||
        file_item.newdesc.includes('6000 LBS') ||
        file_item.newdesc.includes(' 6000 ')
      )
        file_item.class = '6000'
      if (
        file_item.newdesc.includes('CL9000') ||
        file_item.newdesc.includes('CL 9000') ||
        file_item.newdesc.includes('CLASS 9000') ||
        file_item.newdesc.includes('9000#') ||
        file_item.newdesc.includes(' 9M ') ||
        file_item.newdesc.includes('9000 LBS') ||
        file_item.newdesc.includes(' 9000 ')
      )
        file_item.class = '9000'
      if (
        file_item.newdesc.includes('CL2000') ||
        file_item.newdesc.includes('CL 2000') ||
        file_item.newdesc.includes('CLASS 2000') ||
        file_item.newdesc.includes('2000#') ||
        file_item.newdesc.includes('2M') ||
        file_item.newdesc.includes('2000 LBS') ||
        file_item.newdesc.includes(' 3000 ')
      )
        file_item.class = '3000'
      if (
        file_item.newdesc.includes('CL2500') ||
        file_item.newdesc.includes('CL 2500') ||
        file_item.newdesc.includes('CLASS 2500') ||
        file_item.newdesc.includes('2500#') ||
        file_item.newdesc.includes('2500 LBS') ||
        file_item.newdesc.includes(' 2500 ')
      )
        file_item.class = '2500'
      // Face
      if (file_item.newdesc.includes(' RF') || file_item.newdesc.includes('RAISED_FACE')) file_item.face = 'Raised'
      if (file_item.newdesc.includes(' FF') || file_item.newdesc.includes('FLAT-FACE')) file_item.face = 'Flat'
      // Schedule conversions for 40 and 80
      if (file_item.schedule !== undefined)
        if (file_item.size.includes('X')) {
          if (file_item.size.split('X')[0] < 12 && file_item.schedule === '40') file_item.schedule = 'STD'
          if (file_item.size.split('X')[0] < 10 && file_item.schedule === '80') file_item.schedule = 'XS'
          if (file_item.size.split('X')[0] < 12 && file_item.schedule.includes('40X'))
            file_item.schedule = file_item.schedule.replace('40X', 'STDX')
          if (file_item.size.split('X')[0] < 10 && file_item.schedule.includes('80X'))
            file_item.schedule = file_item.schedule.replace('80X', 'XSX')
          if (
            file_item.size.split('X')[1] < 12 &&
            file_item.schedule.includes('X40') &&
            file_item.schedule.includes('X40S') === false
          )
            file_item.schedule = file_item.schedule.replace('X40', 'XSTD')
          if (
            file_item.size.split('X')[1] < 10 &&
            file_item.schedule.includes('X80') &&
            file_item.schedule.includes('X80S') === false
          )
            file_item.schedule = file_item.schedule.replace('X80', 'XXS')
        } else {
          if (file_item.size < 12 && file_item.schedule === '40') file_item.schedule = 'STD'
          if (file_item.size < 10 && file_item.schedule === '80') file_item.schedule = 'XS'
        }
      // Find item lengths (Nipples/Couplings)
      if (file_item.item_detail === 'Nipple') {
        // Nipples with 'LONG' in description
        let length_search = file_item.newdesc
          .replace(' LONG', 'LONG')
          .split(' ')
          .filter((each) => each.includes('LONG'))
        if (length_search.length === 1) file_item.long = length_search[0].replace('"LONG', '').replace('LONG', '')
        // Nipples in PO descriptions
        length_search = file_item.newdesc.split(' ').filter((each) => each.includes('"') && each.includes('X'))
        if (length_search.length === 1 && file_item.long === undefined)
          file_item.long = length_search[0].split('X')[1].replace('"', '')
        // Add lengths to nipples
        if (file_item.item_detail === 'Nipple' && file_item.size.includes('X') === false) {
          if (file_item.long) file_item.size = file_item.size + 'X' + file_item.long
          else file_item.size = file_item.size + ' (NO LENGTH FOUND)'
        }
      }
      return file_item
    })
  }
  // Add info from SP data sheet and PO reciept
  addInfo(sp_items)
  addInfo(po_items)

  // Remove valves and supports from cvc
  if (type !== 'CVC') {
    // Filter by material
    sp_items = sp_items.filter(
      (item) => item.item.includes('FITTING') || item.item.includes('PIPE') || item.item.includes('FLANGE')
    )
  }

  // Additional edits
  sp_items.map((sp_item) => {
    // Edits for 7114
    if (jobnum === 7114) {
      // Description
      sp_item.newdesc = sp_item.description.replaceAll('TRIMMED ', '').replaceAll('W/BRANCH.CONN ', '')
      // Tag
      sp_item.tag = sp_item.tag
        .replaceAll('AAEA20T', 'AAEA200')
        .replaceAll('AAEA2TB', 'AAEA200')
        .replaceAll('AAEA20A', 'AAEA200')
        .replaceAll('A0EH200', 'AAEA200')
      // Change all A material that isn't pipe to CS
      if (sp_item.material !== undefined && sp_item.item_detail !== 'Pipe')
        sp_item.material = sp_item.material.replace('A53', 'CS').replace('A106', 'CS')
      // Size
      sp_item.size = sp_item.size.replaceAll('13/16', '.8125').replaceAll('3/8', '.375')

      // Change all A106 pipe to seamless
      if (
        sp_item.item_detail === 'Pipe' &&
        sp_item.material === 'A106' &&
        (parseFloat(sp_item.size.split('X')[0]) < 2 ||
          (parseFloat(sp_item.size.split('X')[0]) === 2 && sp_item.schedule === 'XS'))
      ) {
        sp_item.seam = undefined
      } else {
        if (sp_item.newdesc.includes('SMLS OR WELDED')) {
          sp_item.seam = 'Welded'
        }
      }
    }
    return sp_item
  })

  // Create new tags
  sp_items.map((sp_item) => {
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
            sp_item.item_detail === 'Lap Joint Flange' ||
            sp_item.item_detail === 'Plate Flange'
          )
            if (sp_item.class === undefined) sp_item['NEW TAG'] = abrcode + '~' + sp_item.origsize + ' (NO CLASS FOUND)'
            else sp_item['NEW TAG'] = abrcode + '_' + sp_item.class + '~' + sp_item.origsize
      }
      // Add material and welds for 7114
      if (jobnum === 7114)
        if (sp_item.seam === 'Welded') sp_item['NEW TAG'] = sp_item.material + 'W-' + sp_item['NEW TAG']
        else sp_item['NEW TAG'] = sp_item.material + '-' + sp_item['NEW TAG']
    }

    // Create tags for new tag system
    sp_item.newsys_tag = undefined
    // Material
    if (sp_item.material !== undefined) {
      sp_item.newsys_tag = sp_item.material
      // Seam
      if (sp_item.seam === 'Welded') sp_item.newsys_tag = sp_item.newsys_tag + 'W-'
      if (sp_item.seam === 'Welded X-Ray') sp_item.newsys_tag = sp_item.newsys_tag + 'WX-'
      if (sp_item.seam === undefined) sp_item.newsys_tag = sp_item.newsys_tag + '-'
      // Face
      if (sp_item.face === 'Raised') sp_item.newsys_tag = sp_item.newsys_tag + 'RF'
      if (sp_item.face === 'Flat') sp_item.newsys_tag = sp_item.newsys_tag + 'FF'
      // Item
      if (sp_item.item_detail === 'Pipe') sp_item.newsys_tag = sp_item.newsys_tag + 'PIP'
      if (sp_item.item_detail === 'Blind Flange') sp_item.newsys_tag = sp_item.newsys_tag + 'BLF'
      if (sp_item.item_detail === 'Plate Flange') sp_item.newsys_tag = sp_item.newsys_tag + 'PLF'
      if (sp_item.item_detail === 'Slip On Flange') sp_item.newsys_tag = sp_item.newsys_tag + 'SOF'
      if (sp_item.item_detail === 'Weldneck Flange') sp_item.newsys_tag = sp_item.newsys_tag + 'WNF'
      if (sp_item.item_detail === 'Oriface Flange') sp_item.newsys_tag = sp_item.newsys_tag + 'ORF'
      if (sp_item.item_detail === 'Socketweld Flange') sp_item.newsys_tag = sp_item.newsys_tag + 'SWF'
      if (sp_item.item_detail === 'Lap Joint Flange') sp_item.newsys_tag = sp_item.newsys_tag + 'LJF'
      if (sp_item.item_detail === 'Threaded Flange') sp_item.newsys_tag = sp_item.newsys_tag + 'THF'
      if (sp_item.item_detail === 'Weldolet') sp_item.newsys_tag = sp_item.newsys_tag + 'WLET'
      if (sp_item.item_detail === 'Sockolet') sp_item.newsys_tag = sp_item.newsys_tag + 'SLET'
      if (sp_item.item_detail === 'Thredolet') sp_item.newsys_tag = sp_item.newsys_tag + 'TLET'
      if (sp_item.item_detail === 'Elbolet') sp_item.newsys_tag = sp_item.newsys_tag + 'ELET'
      if (sp_item.item_detail === 'Tee') sp_item.newsys_tag = sp_item.newsys_tag + 'TEE'
      if (sp_item.item_detail === 'Coupling') sp_item.newsys_tag = sp_item.newsys_tag + 'CPL'
      if (sp_item.item_detail === 'Union') sp_item.newsys_tag = sp_item.newsys_tag + 'UNI'
      if (sp_item.item_detail === 'Cap') sp_item.newsys_tag = sp_item.newsys_tag + 'CAP'
      if (sp_item.item_detail === 'Insert') sp_item.newsys_tag = sp_item.newsys_tag + 'INS'
      if (sp_item.item_detail === 'Plug') sp_item.newsys_tag = sp_item.newsys_tag + 'PLG'
      if (sp_item.item_detail === 'Concentric Reducer') sp_item.newsys_tag = sp_item.newsys_tag + 'CRED'
      if (sp_item.item_detail === 'Eccentric Reducer') sp_item.newsys_tag = sp_item.newsys_tag + 'ERED'
      if (sp_item.item_detail === 'Nipple') sp_item.newsys_tag = sp_item.newsys_tag + 'NIP'
      if (sp_item.item_detail === 'Concentric Swage') sp_item.newsys_tag = sp_item.newsys_tag + 'CSWG'
      if (sp_item.item_detail === 'Eccentric Swage') sp_item.newsys_tag = sp_item.newsys_tag + 'ESWG'
      if (sp_item.item_detail === '45 Degree Elbow') sp_item.newsys_tag = sp_item.newsys_tag + '45'
      if (sp_item.item_detail === '90 Degree Elbow') sp_item.newsys_tag = sp_item.newsys_tag + '90'
      if (sp_item.item_detail === '45 Degree Elbow 3D') sp_item.newsys_tag = sp_item.newsys_tag + '3D45'
      if (sp_item.item_detail === '90 Degree Elbow 3D') sp_item.newsys_tag = sp_item.newsys_tag + '3D90'
      if (sp_item.item_detail === '90 Degree Elbow - Short') sp_item.newsys_tag = sp_item.newsys_tag + '90SR'
      if (sp_item.item_detail === '45 Degree Elbow - Short') sp_item.newsys_tag = sp_item.newsys_tag + '45SR'
      if (sp_item.item_detail === 'Stub End Flange') sp_item.newsys_tag = sp_item.newsys_tag + 'SEF'
      if (sp_item.item_detail === 'Reducing Coupling') sp_item.newsys_tag = sp_item.newsys_tag + 'CPL'
      if (sp_item.item_detail === '45 Degree Miter') sp_item.newsys_tag = sp_item.newsys_tag + '45MIT'
      if (sp_item.item_detail === '90 Degree Miter') sp_item.newsys_tag = sp_item.newsys_tag + '90MIT'
      if (sp_item.item_detail === 'Cross') sp_item.newsys_tag = sp_item.newsys_tag + 'CROS'
      if (sp_item.item_detail === 'Strainer') sp_item.newsys_tag = sp_item.newsys_tag + 'STR'
      if (sp_item.item_detail === 'Eccentric Swage Nipple') sp_item.newsys_tag = sp_item.newsys_tag + 'ESWGNIP'
      // Nipple/Coupling Length
      if (sp_item.long !== undefined) sp_item.newsys_tag = sp_item.newsys_tag + sp_item.long + 'L'
      else if (sp_item.item_detail === 'Nipple') sp_item.newsys_tag = sp_item.newsys_tag + '(NO LENGTH FOUND)'
      // End Type
      if (sp_item.end_type === 'Plain') sp_item.newsys_tag = sp_item.newsys_tag + 'P'
      if (sp_item.end_type === 'Threaded') sp_item.newsys_tag = sp_item.newsys_tag + 'T'
      if (sp_item.end_type === 'Beveled') sp_item.newsys_tag = sp_item.newsys_tag + 'B'
      if (sp_item.end_type === 'Plain x Threaded') sp_item.newsys_tag = sp_item.newsys_tag + 'PXT'
      if (sp_item.end_type === 'Beveled x Plain') sp_item.newsys_tag = sp_item.newsys_tag + 'BXP'
      if (sp_item.end_type === 'Beveled x Threaded') sp_item.newsys_tag = sp_item.newsys_tag + 'BXT'
      // Items with 3000, 6000, or 9000 class
      if (sp_item.class === '3000' || sp_item.class === '6000' || sp_item.class === '9000')
        sp_item.newsys_tag = sp_item.newsys_tag + '_' + sp_item.class + '~' + sp_item.origsize
      // Special cases where both schedule and class is used
      else if (sp_item.item_detail === 'Socketweld Flange' || sp_item.item_detail === 'Weldneck Flange')
        if (sp_item.schedule === undefined)
          // If no schedule is found
          sp_item.newsys_tag =
            sp_item.newsys_tag + '_:' + sp_item.class + '~' + sp_item.origsize + ' (NO SCHEDULE FOUND)'
        // If no class is found
        else if (sp_item.class === undefined)
          sp_item.newsys_tag =
            sp_item.newsys_tag + '_' + sp_item.schedule + ':~' + sp_item.origsize + ' (NO CLASS FOUND)'
        // Class and schedule is found
        else
          sp_item.newsys_tag =
            sp_item.newsys_tag + '_' + sp_item.schedule + ':' + sp_item.class + '~' + sp_item.origsize
      // Special cases where class should only be used
      else if (
        sp_item.item_detail === 'Blind Flange' ||
        sp_item.item_detail === 'Slip On Flange' ||
        sp_item.item_detail === 'Plate Flange' ||
        sp_item.item_detail === 'Lap Joint Flange'
      )
        if (sp_item.class === undefined)
          sp_item.newsys_tag = sp_item.newsys_tag + '~' + sp_item.origsize + ' (NO CLASS FOUND)'
        else sp_item.newsys_tag = sp_item.newsys_tag + '_' + sp_item.class + '~' + sp_item.origsize
      // All other items where only schedule is to be used
      else if (sp_item.schedule === undefined)
        sp_item.newsys_tag = sp_item.newsys_tag + '_~' + sp_item.origsize + ' (NO SCHEDULE FOUND)'
      else sp_item.newsys_tag = sp_item.newsys_tag + '_' + sp_item.schedule + '~' + sp_item.origsize
    }
    return sp_item
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
      let itemdetmatch = false
      let sizematch = false
      let materialmatch = false
      let schedclassmatch = false
      let seammatch = false
      let endtypematch = false
      let facematch = false
      let schedmatch = false
      let classmatch = false
      // Check item details match
      if (po_item.item_detail === sp_item.item_detail) itemdetmatch = true
      // Check size match
      if (po_item.size.includes('-') && po_item.size.includes('X')) {
        // Check if size falls within a size range
        if (
          parseFloat(sp_item.size.split('X')[0]) <= parseFloat(po_item.size.split('X')[0].split('-')[0]) &&
          parseFloat(sp_item.size.split('X')[0]) >= parseFloat(po_item.size.split('X')[0].split('-')[1]) &&
          parseFloat(sp_item.size.split('X')[1]) === parseFloat(po_item.size.split('X')[1])
        ) {
          sizematch = true
        }
        // Check if sizes with X match
      } else if (po_item.size.includes('X')) {
        if (
          parseFloat(sp_item.size.split('X')[0]) === parseFloat(po_item.size.split('X')[0]) &&
          parseFloat(sp_item.size.split('X')[1]) === parseFloat(po_item.size.split('X')[1])
        )
          sizematch = true
      }
      // If no range or X, just check size straight up
      else if (sp_item.size === po_item.size) sizematch = true
      // Check if materials match
      if (po_item.material === sp_item.material) materialmatch = true
      // Check if schedules/class match
      // Check schdules
      if (
        (po_item.schedule === sp_item.schedule ||
          (po_item.schedule === '40S' && sp_item.schedule === 'STD') ||
          (po_item.schedule === 'STD' && sp_item.schedule === '40S')) &&
        sp_item.schedule !== undefined
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
      else if (po_item.item !== 'FLANGES' && schedmatch && classmatch) schedclassmatch = true
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
      if (itemdetmatch && sizematch && materialmatch && schedclassmatch && seammatch && endtypematch && facematch) {
        sp_item.matched = true
        if (po_item.breakpoints.includes('Match') === false) po_item.breakpoints.push('Match')
        if (po_item.matches.includes(sp_item['NEW TAG']) === false) po_item.matches.push(sp_item['NEW TAG'])
        // Breaks at face
      } else if (
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
      } else if (itemdetmatch && sizematch && materialmatch && schedclassmatch && seammatch && !endtypematch) {
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
      } else if (itemdetmatch && sizematch && materialmatch && schedclassmatch && !seammatch) {
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
      else if (itemdetmatch && sizematch && materialmatch && !schedclassmatch) {
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
      else if (itemdetmatch && sizematch && !materialmatch) {
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
      else if (itemdetmatch && !sizematch) {
        // If first break this late in checking, clear suggestion and add to breakpoints
        if (po_item.breakpoints.includes('Size') === false) po_item.breakpoints.push('Size')
        // Breaks at item detail
      } else if (!itemdetmatch) {
        // If first break this late in checking, clear suggestion and add to breakpoints
        if (po_item.breakpoints.includes('Item Detail') === false) po_item.breakpoints.push('Item Detail')
      }
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

  // Send to the Redux Store
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
      ws_row['newsys_tag'] = undefined
      headersarray.push('NEW TAG')
      headersarray.push('newsys_tag')
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
