import React, { Fragment } from 'react'
import { connect } from 'react-redux'

const Dormant = ({ header, dormant }) => {
  return (
    <Fragment>
      <div className='table-row table-label'>{header}</div>
      <div className='table-header table-row'>
        <div className='d-col1'></div>
        <div className='d-col2'>Lifespan</div>
        <div className='d-col3'>Issue to Pull</div>
        <div className='d-col4'>Pull to Weld</div>
        <div className='d-col5'>Weld to Site</div>
        <div className='d-col6'>Weld to RTS Coating</div>
        <div className='d-col7'>RTS Coating to STC</div>
        <div className='d-col8'>Weld to STC</div>
        <div className='d-col9'>STC to RTS</div>
        <div className='d-col10'>RTS to Site</div>
        <div className='d-col11'>Weld to RTS</div>
        <div className='d-col12'>RTS to Site</div>
      </div>
      <div className='table-row'>
        <div className='d-col1 table-subheader'>AVERAGES</div>
        <div className='d-col2'>{dormant.lifespan}</div>
        <div className='d-col3'>{dormant.i_p}</div>
        <div className='d-col4'>{dormant.p_w}</div>
        <div className='d-col5'>{dormant.w_d}</div>
        <div className='d-col6'>{dormant.w_rtsc}</div>
        <div className='d-col7'>{dormant.rtsc_stc}</div>
        <div className='d-col8'>{dormant.w_stc}</div>
        <div className='d-col9'>{dormant.stc_rts}</div>
        <div className='d-col10'>{dormant.rts_d_p}</div>
        <div className='d-col11'>{dormant.w_rts}</div>
        <div className='d-col12'>{dormant.rts_d_np}</div>
      </div>
    </Fragment>
  )
}

const mapStateToProps = (state) => ({
  dormant: state.jobs.dormant,
})

export default connect(mapStateToProps)(Dormant)
