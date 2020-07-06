import React, { Fragment, useState } from 'react'

const SpoolShorts = ({
  job: {
    missingspools: { valves, fittings, flanges, pipe, supports },
    issued,
    workable_not_issued,
    total,
  },
}) => {
  const disc = useState(
    Math.abs(
      total -
        valves.p -
        valves.c -
        valves.o -
        fittings.p -
        fittings.c -
        fittings.o -
        flanges.p -
        flanges.c -
        flanges.o -
        pipe.p -
        pipe.c -
        pipe.o -
        supports.p -
        supports.c -
        supports.o -
        issued -
        workable_not_issued
    )
  )
  return (
    <Fragment>
      <div className='table-container'>
        <div className='table-row table-label'>
          Spools With Shorts (By Scope)
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
          <div className='sh-col2'>{valves.p}</div>
          <div className='sh-col3'>{valves.c}</div>
          <div className='sh-col4'>{valves.o}</div>
          <div className='sh-col5 total-subheader'>
            {valves.p + valves.c + valves.o}
          </div>
        </div>
        <div className='table-row'>
          <div className='sh-col1 table-subheader'>Flanges</div>
          <div className='sh-col2'>{flanges.p}</div>
          <div className='sh-col3'>{flanges.c}</div>
          <div className='sh-col4'>{flanges.o}</div>
          <div className='sh-col5 total-subheader'>
            {flanges.p + flanges.c + flanges.o}
          </div>
        </div>
        <div className='table-row'>
          <div className='sh-col1 table-subheader'>Fittings</div>
          <div className='sh-col2'>{fittings.p}</div>
          <div className='sh-col3'>{fittings.c}</div>
          <div className='sh-col4'>{fittings.o}</div>
          <div className='sh-col5 total-subheader'>
            {fittings.p + fittings.c + fittings.o}
          </div>
        </div>
        <div className='table-row'>
          <div className='sh-col1 table-subheader'>Supports</div>
          <div className='sh-col2'>{supports.p}</div>
          <div className='sh-col3'>{supports.c}</div>
          <div className='sh-col4'>{supports.o}</div>
          <div className='sh-col5 total-subheader'>
            {supports.p + supports.c + supports.o}
          </div>
        </div>
        <div className='table-row'>
          <div className='sh-col1 table-subheader'>Pipe</div>
          <div className='sh-col2'>{pipe.p}</div>
          <div className='sh-col3'>{pipe.c}</div>
          <div className='sh-col4'>{pipe.o}</div>
          <div className='sh-col5 total-subheader'>
            {pipe.p + pipe.c + pipe.o}
          </div>
        </div>
        <div className='table-row'>
          <div className='sh-col1 table-subheader'>Issued</div>
          <div className='sh-col2'></div>
          <div className='sh-col3'></div>
          <div className='sh-col4'></div>
          <div className='sh-col5 total-subheader'>{issued}</div>
        </div>
        <div className='table-row'>
          <div className='sh-col1 table-subheader'>Workable (Not Issued)</div>
          <div className='sh-col2'></div>
          <div className='sh-col3'></div>
          <div className='sh-col4'></div>
          <div className='sh-col5 total-subheader'>{workable_not_issued}</div>
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
            {disc}
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
