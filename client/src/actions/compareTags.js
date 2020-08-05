import axios from 'axios'

//      ////// //////
////    //       //
//////  //       //
////    //       //
//      //////   //

// GRAB STATUS REPORTCLIENT TAGS CSV
const res_ct = await axios.get('/api/csvs/client_tags/' + jobnum)
let client_tags_csv = res_ct.data

// FIND HEADERS FROM CLIENT TAGS CSV
lines = client_tags_csv.split('\n')
header = lines[0]
headers = header.split(',')

// ASSIGN COLUMN NUMBER TO EACH HEADER
let client_tag = undefined
let shipped = undefined
let order_date = undefined
let delivery_date = undefined

count = 0
headers.map((header) => {
  if (header.toUpperCase() === 'CLIENT TAG') {
    client_tag = count
  } else if (header.toUpperCase() === 'SHIPPED') {
    shipped = count
  } else if (header.toUpperCase() === 'ORDER DATE') {
    order_date = count
  } else if (header.toUpperCase() === 'DELIVERY DATE') {
    delivery_date = count
  }
  count += 1
  return header
})
// CHECK FOR ERRORS ON COLUMN HEADERS
if (client_tag === undefined)
  alert(
    'Error on ' +
      jobnum +
      ' client tags! Client tag header should be titled "CLIENT TAG".'
  )
if (shipped === undefined)
  alert(
    'Error on ' +
      jobnum +
      ' client tags! Shipped header should be titled "SHIPPED".'
  )
if (order_date === undefined)
  alert(
    'Error on ' +
      jobnum +
      ' client tags! Order date header should be titled "ORDER DATE".'
  )
if (delivery_date === undefined)
  alert(
    'Error on ' +
      jobnum +
      ' client tags! Delivery date header should be titled "DELIVERY DATE".'
  )

// CREATE CLIENT TAGS OBJECT
count = 0
let client_tags = []

lines.map((line) => {
  count += 1
  if (
    line.split(',')[sr_piecemark_col] !== '' &&
    line.split(',')[sr_piecemark_col] !== undefined &&
    count >= first_row
  ) {
    client_tags.push({
      tag: line.split(',')[client_tag],
      shipped: line.split(',')[shipped],
      order_date: line.split(',')[order_date],
      delivery_date: line.split(',')[delivery_date],
    })
  }
  return line
})
