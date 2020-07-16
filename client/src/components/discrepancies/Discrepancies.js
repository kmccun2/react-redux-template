import React, { Fragment } from 'react'
import { connect } from 'react-redux'

const Discrepancies = ({ discrepancies }) => {
  return (
    <Fragment>
      <div style={{ marginTop: 60 }} className='js-heading'>
        Discrepancies
      </div>
      <div className='disc-container'>
        {/* STATUS REPORT (NOT LINELIST) */}
        <div className='table-container disc-table'>
          <div className='table-row disc-table-label'>
            In Status Report (Not in Linelist)
          </div>
          <div className='table-header table-row'>
            <div className='disc-col'>Spools</div>
            <div className='disc-col'>Job</div>
          </div>
          <Fragment>
            {/* {discrepancies.status_not_ll} */}
            <div className='table-row'>
              <div className='disc-col'></div>
              <div className='disc-col'></div>
            </div>
          </Fragment>
        </div>
        {/* FORECAST (ISSUED) */}
        <div className='table-container disc-table'>
          <div className='table-row disc-table-label'>In Forecast (Issued)</div>
          <div className='table-header table-row'>
            <div className='disc-col'>Spools</div>
            <div className='disc-col'>Job</div>
          </div>
          <div className='table-row'>
            <div className='disc-col'></div>
            <div className='disc-col'></div>
          </div>
        </div>

        {/* NOT FORECAST (NOT ISSUED) */}
        <div className='table-container disc-table'>
          <div className='table-row disc-table-label'>
            Not in Forecast (Not Issued)
          </div>
          <div className='table-header table-row'>
            <div className='disc-col'>Spools</div>
            <div className='disc-col'>Job</div>
          </div>
          <div className='table-row'>
            <div className='disc-col'></div>
            <div className='disc-col'></div>
          </div>
        </div>

        {/* FORECAST (NOT LINELIST) */}
        <div className='table-container disc-table'>
          <div className='table-row disc-table-label'>
            In Forecast (Not in Linelist)
          </div>
          <div className='table-header table-row'>
            <div className='disc-col'>Spools</div>
            <div className='disc-col'>Job</div>
          </div>
          <div className='table-row'>
            <div className='disc-col'></div>
            <div className='disc-col'></div>
          </div>
        </div>
      </div>
    </Fragment>
  )
}

const mapStateToProps = (state) => ({
  discrepancies: state.jobs.discrepancies,
})
export default connect(mapStateToProps)(Discrepancies)
