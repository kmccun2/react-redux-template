import React, { Fragment } from 'react'

const SpoolShorts = ({
  job: {
    issued,
    total,
    on_hold_no_shorts,
    issued_missing_item,
    workable_not_issued,
    spools_by_scope: {
      valves,
      pipe,
      flanges,
      fittings,
      supports,
      discrepancies,
    },
  },
}) => {
  return (
    <Fragment>
      <div className='table-container'>
        <div className='table-row table-label'>
          Spools With Shorts (Held up By)
        </div>
        <div className='table-header table-row'>
          <div className='sh-col1' style={{ fontWeight: 'normal' }}>
            SPOOLS
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
          <div className='sh-col5 total-subheader'>{valves.performance}</div>
        </div>
        <div className='table-row'>
          <div className='sh-col1 table-subheader'>Pipe</div>
          <div className='sh-col2'>{pipe.performance}</div>
          <div className='sh-col3'>{pipe.client}</div>
          <div className='sh-col4'>{pipe.other}</div>
          <div className='sh-col5 total-subheader'>{pipe.performance}</div>
        </div>
        <div className='table-row'>
          <div className='sh-col1 table-subheader'>Flanges</div>
          <div className='sh-col2'>{flanges.performance}</div>
          <div className='sh-col3'>{flanges.client}</div>
          <div className='sh-col4'>{flanges.other}</div>
          <div className='sh-col5 total-subheader'>{flanges.performance}</div>
        </div>
        <div className='table-row'>
          <div className='sh-col1 table-subheader'>Fittings</div>
          <div className='sh-col2'>{fittings.performance}</div>
          <div className='sh-col3'>{fittings.client}</div>
          <div className='sh-col4'>{fittings.other}</div>
          <div className='sh-col5 total-subheader'>{fittings.performance}</div>
        </div>
        <div className='table-row'>
          <div className='sh-col1 table-subheader'>Supports</div>
          <div className='sh-col2'>{supports.performance}</div>
          <div className='sh-col3'>{supports.client}</div>
          <div className='sh-col4'>{supports.other}</div>
          <div className='sh-col5 total-subheader'>{supports.performance}</div>
        </div>
        <div className='table-row'>
          <div className='sh-col1 table-subheader'>Issued</div>
          <div className='sh-col2'></div>
          <div className='sh-col3'></div>
          <div className='sh-col4'></div>
          <div className='sh-col5 total-subheader'>{issued}</div>
        </div>
        <div className='table-row'>
          <div className='sh-col1 table-subheader'>Issued (Missing Items)</div>
          <div className='sh-col2'></div>
          <div className='sh-col3'></div>
          <div className='sh-col4'></div>
          <div className='sh-col5 total-subheader'>{issued_missing_item}</div>
        </div>
        <div className='table-row'>
          <div className='sh-col1 table-subheader'>Workable (Not Issued)</div>
          <div className='sh-col2'></div>
          <div className='sh-col3'></div>
          <div className='sh-col4'></div>
          <div className='sh-col5 total-subheader'>{workable_not_issued}</div>
        </div>
        <div className='table-row'>
          <div className='sh-col1 table-subheader'>On Hold (No Shorts)</div>
          <div className='sh-col2'></div>
          <div className='sh-col3'></div>
          <div className='sh-col4'></div>
          <div className='sh-col5 total-subheader'>{on_hold_no_shorts}</div>
        </div>
        <div className='table-row'>
          <div className='sh-col1 table-subheader discrepancies'>
            Discrepancies
          </div>
          <div className='sh-col2 discrepancies'></div>
          <div className='sh-col3 discrepancies'></div>
          <div className='sh-col4 discrepancies'></div>
          <div
            className='sh-col5 total-subheader discrepancies'
            style={{ fontWeight: 'bold' }}
          >
            {discrepancies}
          </div>
        </div>
        <div className='totals-row table-row'>
          <div className='sh-col1'>TOTAL</div>
          <div className='sh-col2'></div>
          <div className='sh-col3'></div>
          <div className='sh-col4'></div>
          <div className='sh-col5'>{total}</div>
        </div>
      </div>
    </Fragment>
  )
}

export default SpoolShorts
