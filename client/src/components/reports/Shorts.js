import React, { Fragment } from 'react'

const Shorts = ({ header, missing }) => {
  return (
    <Fragment>
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
          <div className='sh-col2'>
            {
              missing.filter((each) => each.includes('Performance-VALVE'))
                .length
            }
          </div>
          <div className='sh-col3'>
            {missing.filter((each) => each.includes('Client-VALVE')).length}
          </div>
          <div className='sh-col4'>
            {missing.filter((each) => each.includes('Other-VALVE')).length}
          </div>
          <div className='sh-col5 total-subheader'>
            {missing.filter((each) => each.includes('VALVE')).length}
          </div>
        </div>
        <div className='table-row'>
          <div className='sh-col1 table-subheader'>Flanges</div>
          <div className='sh-col2'>
            {
              missing.filter((each) => each.includes('Performance-FLANGE'))
                .length
            }
          </div>
          <div className='sh-col3'>
            {missing.filter((each) => each.includes('Client-FLANGE')).length}
          </div>
          <div className='sh-col4'>
            {missing.filter((each) => each.includes('Other-FLANGE')).length}
          </div>
          <div className='sh-col5 total-subheader'>
            {missing.filter((each) => each.includes('FLANGE')).length}
          </div>
        </div>
        <div className='table-row'>
          <div className='sh-col1 table-subheader'>Fittings</div>
          <div className='sh-col2'>
            {
              missing.filter((each) => each.includes('Performance-FITTING'))
                .length
            }
          </div>
          <div className='sh-col3'>
            {missing.filter((each) => each.includes('Client-FITTING')).length}
          </div>
          <div className='sh-col4'>
            {missing.filter((each) => each.includes('Other-FITTING')).length}
          </div>
          <div className='sh-col5 total-subheader'>
            {missing.filter((each) => each.includes('FITTING')).length}
          </div>
        </div>
        <div className='table-row'>
          <div className='sh-col1 table-subheader'>Supports</div>
          <div className='sh-col2'>
            {
              missing.filter((each) => each.includes('Performance-SUPPORT'))
                .length
            }
          </div>
          <div className='sh-col3'>
            {missing.filter((each) => each.includes('Client-SUPPORT')).length}
          </div>
          <div className='sh-col4'>
            {missing.filter((each) => each.includes('Other-SUPPORT')).length}
          </div>
          <div className='sh-col5 total-subheader'>
            {missing.filter((each) => each.includes('SUPPORT')).length}
          </div>
        </div>
        <div className='totals-row table-row'>
          <div className='sh-col1'>TOTAL</div>
          <div className='sh-col2'>
            {missing.filter((each) => each.includes('Performance')).length}
          </div>
          <div className='sh-col3'>
            {missing.filter((each) => each.includes('Client')).length}
          </div>
          <div className='sh-col4'>
            {missing.filter((each) => each.includes('Other')).length}
          </div>
          <div className='sh-col5'>{missing.length}</div>
        </div>
        <div className='table-row pipe-row'>
          <div className='sh-col1 table-subheader'>Pipe</div>
          <div className='sh-col2'>
            {missing.filter((each) => each.includes('Performance-PIPE')).length}
          </div>
          <div className='sh-col3'>
            {missing.filter((each) => each.includes('Client-PIPE')).length}
          </div>
          <div className='sh-col4'>
            {missing.filter((each) => each.includes('Other-PIPE')).length}
          </div>
          <div className='sh-col5 total-subheader'>
            {missing.filter((each) => each.includes('PIPE')).length}
          </div>
        </div>
      </div>
    </Fragment>
  )
}

export default Shorts
