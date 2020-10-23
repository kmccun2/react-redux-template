import React, { useEffect } from 'react'
import { compareItems, downloadSP } from '../../../actions/compareItems'
import { connect } from 'react-redux'
import { CSVLink } from 'react-csv'

const NewCodes = ({ compareItems, downloadSP, sp_items, headers }) => {
  useEffect(() => {
    compareItems()
  }, [])
  return (
    <div style={{ marginTop: 40 }}>
      {sp_items.length > 0 && (
        <div className='download-btn' onClick={() => downloadSP(sp_items, headers)}>
          SP Items
        </div>
      )}
    </div>
  )
}

const mapStateToProps = (state) => ({
  sp_items: state.compareItems.sp_items,
  headers: state.compareItems.headers,
})

export default connect(mapStateToProps, { compareItems, downloadSP })(NewCodes)
