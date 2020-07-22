import React, { Fragment } from 'react'
import { connect } from 'react-redux'

const Shorts = ({
  header,
  job,
  shorts: { valves, pipe, flanges, fittings, supports },
}) => {
  return (
    <Fragment>
      {job && (
        <div className='table-container'>
          <div className='table-row table-label'>{header}</div>
          <div className='table-header table-row'>
            <div className='sh-col1' style={{ fontWeight: 'normal' }}>
              ITEMS
            </div>
            <div className='sh-col2'>Performance</div>
            <div className='sh-col3'>Client</div>
            <div className='sh-col4'>Other</div>
            <div className='sh-col5'>TOTAL</div>
          </div>
          <div className='table-row'>
            <div className='sh-col1 table-subheader'>Valves</div>
            <div className='sh-col2'>{valves.performance}</div>
            <div className='sh-col3'>{valves.client}</div>
            <div className='sh-col4'>{valves.other}</div>
            <div className='sh-col5 total-subheader'>{valves.total}</div>
          </div>
          <div className='table-row'>
            <div className='sh-col1 table-subheader'>Flanges</div>
            <div className='sh-col2'>{flanges.performance}</div>
            <div className='sh-col3'>{flanges.client}</div>
            <div className='sh-col4'>{flanges.other}</div>
            <div className='sh-col5 total-subheader'>{flanges.total}</div>
          </div>
          <div className='table-row'>
            <div className='sh-col1 table-subheader'>Fittings</div>
            <div className='sh-col2'>{fittings.performance}</div>
            <div className='sh-col3'>{fittings.client}</div>
            <div className='sh-col4'>{fittings.other}</div>
            <div className='sh-col5 total-subheader'>{fittings.total}</div>
          </div>
          <div className='table-row'>
            <div className='sh-col1 table-subheader'>Supports</div>
            <div className='sh-col2'>{supports.performance}</div>
            <div className='sh-col3'>{supports.client}</div>
            <div className='sh-col4'>{supports.other}</div>
            <div className='sh-col5 total-subheader'>{supports.total}</div>
          </div>
          <div className='totals-row table-row'>
            <div className='sh-col1'>TOTAL</div>
            <div className='sh-col2'>
              {valves.performance +
                flanges.performance +
                fittings.performance +
                supports.performance}
            </div>
            <div className='sh-col3'>
              {valves.client +
                flanges.client +
                fittings.client +
                supports.client}
            </div>
            <div className='sh-col4'>
              {valves.other + flanges.other + fittings.other + supports.other}
            </div>
            <div className='sh-col5'>
              {valves.total + flanges.total + fittings.total + supports.total}
            </div>
          </div>
          <div className='table-row pipe-row'>
            <div className='sh-col1 table-subheader'>Pipe</div>
            <div className='sh-col2'>{pipe.performance}</div>
            <div className='sh-col3'>{pipe.client}</div>
            <div className='sh-col4'>{pipe.other}</div>
            <div className='sh-col5 total-subheader'>{pipe.total}</div>
          </div>
        </div>
      )}
    </Fragment>
  )
}

const mapStateToProps = (state) => ({
  job: state.job.job,
})
export default connect(mapStateToProps)(Shorts)
