import axios from 'axios'

//      //////  //////
////    //        //
//////  //        //
////    //        //
//      //////  //////

export const compareItems = () => async (dispatch) => {
  // Grab input file data
  const res = await axios.get('/api/xlsx/input')
  let sp_data = res.data
  let sp_items = sp_data.rows
  let jobnum = sp_data.jobnum

  // Remove items that don't go into SP MAT
  // Items that don't have a sketch or size
  sp_items = sp_items.filter(
    (item) => item.sketch !== undefined && item.size !== undefined
  )
  if (jobnum === 7116 || jobnum == 7114) {
    sp_items = sp_items.filter(
      (item) =>
        item.item.includes('FITTING') ||
        item.item.includes('PIPE') ||
        item.item.includes('FLANGE')
    )
  }

  // Create new tags
  sp_items.map((sp_item) => {
    // Use only last part of BOM PATH for sketch name
    sp_item.sketch = sp_item.sketch.split('/')[
      sp_item.sketch.split('/').length - 1
    ]
    // Convert sizes to decimals
  })

  // Show
  console.log(sp_data.rows.length)
  console.log(sp_items.length)
}