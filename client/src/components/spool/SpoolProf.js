import React, { useState, useEffect, Fragment } from 'react'
import { updateDormant } from '../../actions/dormant'
import { connect } from 'react-redux'
import Loading from '../misc/Loading'
import Timeline from './Timeline'

const SpoolProf = ({ match, all_spools, dormant, jobnums, updateDormant }) => {
  const [spool, setSpool] = useState()

  // LOAD JOBS IF NOT LOADED
  useEffect(() => {
    if (dormant === undefined) {
      updateDormant(jobnums)
    }
    // eslint-disable-next-line
  }, [])

  useEffect(() => {
    setSpool(all_spools.filter((each) => each.piecemark === match.params.id)[0])
  }, [match.params.id, all_spools])

  return (
    <Fragment>
      {dormant !== undefined ? (
        <Fragment>
          <div className='js-heading'>Spool {spool.spool}</div>
          <div className='sub-heading'>
            {spool.client}: {spool.jobnum}
          </div>
          <Timeline spool={spool} />
          {/* ADDITIONAL INFO */}
          <div className='more-spool-info'>
            <div className='sub-heading'>Priority: {spool.priority}</div>
            <div className='sub-heading'>Area: {spool.area}</div>
            <div className='sub-heading'>Shop: {spool.shop}</div>
          </div>
          {/* DATES */}
          <div className='js-heading'>Timeline Dates</div>
          <div className='spool-dates'>
            <div className='sd-row'>
              <div className='sd-col1'>Issued</div>
              <div className='sd-col2'>{spool.issued && spool.issued}</div>
            </div>
            <div className='sd-row'>
              <div className='sd-col1'>Pulled</div>
              <div className='sd-col2'>{spool.pulled && spool.pulled}</div>
            </div>
            <div className='sd-row'>
              <div className='sd-col1'>Welded Out</div>
              <div className='sd-col2'>{spool.weldout && spool.weldout}</div>
            </div>
            <div className='sd-row'>
              <div className='sd-col1'>Ready to Ship to Coating</div>
              <div className='sd-col2'>{spool.rtsc && spool.rtsc}</div>
            </div>
            <div className='sd-row'>
              <div className='sd-col1'>Shipped to Coating</div>
              <div className='sd-col2'>{spool.stc && spool.stc}</div>
            </div>
            <div className='sd-row'>
              <div className='sd-col1'>Ready to Deliver</div>
              <div className='sd-col2'>{spool.rts && spool.rts}</div>
            </div>
            <div className='sd-row'>
              <div className='sd-col1'>Delivered</div>
              <div className='sd-col2'>
                {spool.delivered && spool.delivered}
              </div>
            </div>
          </div>
          {/* ITEMS */}
          <div className='js-heading'>Items</div>
          <div className='spool-items'></div>
        </Fragment>
      ) : (
        <Loading message='Loading spool information..' />
      )}
    </Fragment>
  )
}

const mapStateToProps = (state) => ({
  all_spools: state.dormant.all_spools,
  dormant: state.dormant.dormant,
  jobnums: state.dormant.jobnums,
})

export default connect(mapStateToProps, { updateDormant })(SpoolProf)
