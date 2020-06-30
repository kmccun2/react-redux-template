import React, { Fragment } from 'react'

const Shorts = ({ header, job, filtered }) => {
  return (
    <Fragment>
      <div className='table-row table-label'>{header}</div>
      <div className='table-container'>
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
              job.shorts.filter(
                (short) =>
                  filtered.includes(short.status) &&
                  short.scope === 'Performance' &&
                  (short.item === 'VALVES' || short.item === 'INSTRUMENTS')
              ).length
            }
          </div>
          <div className='sh-col3'>
            {
              job.shorts.filter(
                (short) =>
                  filtered.includes(short.status) &&
                  short.scope === 'Client' &&
                  (short.item === 'VALVES' || short.item === 'INSTRUMENTS')
              ).length
            }
          </div>
          <div className='sh-col4'>
            {
              job.shorts.filter(
                (short) =>
                  filtered.includes(short.status) &&
                  short.scope === 'Other' &&
                  (short.item === 'VALVES' || short.item === 'INSTRUMENTS')
              ).length
            }
          </div>
          <div className='sh-col5 total-subheader'>
            {
              job.shorts.filter(
                (short) =>
                  (short.item === 'VALVES' ||
                    short.item === 'VALVE' ||
                    short.item === 'INSTRUMENTS') &&
                  filtered.includes(short.status)
              ).length
            }
          </div>
        </div>
        <div className='table-row'>
          <div className='sh-col1 table-subheader'>Flanges</div>
          <div className='sh-col2'>
            {
              job.shorts.filter(
                (short) =>
                  filtered.includes(short.status) &&
                  short.scope === 'Performance' &&
                  short.item === 'FLANGES'
              ).length
            }
          </div>
          <div className='sh-col3'>
            {
              job.shorts.filter(
                (short) =>
                  filtered.includes(short.status) &&
                  short.scope === 'Client' &&
                  short.item === 'FLANGES'
              ).length
            }
          </div>
          <div className='sh-col4'>
            {
              job.shorts.filter(
                (short) =>
                  filtered.includes(short.status) &&
                  short.scope === 'Other' &&
                  short.item === 'FLANGES'
              ).length
            }
          </div>
          <div className='sh-col5 total-subheader'>
            {
              job.shorts.filter(
                (short) =>
                  (short.item === 'FLANGES' || short.item === 'FLANGE') &&
                  filtered.includes(short.status)
              ).length
            }
          </div>
        </div>
        <div className='table-row'>
          <div className='sh-col1 table-subheader'>Fittings</div>
          <div className='sh-col2'>
            {
              job.shorts.filter(
                (short) =>
                  filtered.includes(short.status) &&
                  short.scope === 'Performance' &&
                  short.item === 'FITTINGS'
              ).length
            }
          </div>
          <div className='sh-col3'>
            {
              job.shorts.filter(
                (short) =>
                  filtered.includes(short.status) &&
                  short.scope === 'Client' &&
                  short.item === 'FITTINGS'
              ).length
            }
          </div>
          <div className='sh-col4'>
            {
              job.shorts.filter(
                (short) =>
                  filtered.includes(short.status) &&
                  short.scope === 'Other' &&
                  short.item === 'FITTINGS'
              ).length
            }
          </div>
          <div className='sh-col5 total-subheader'>
            {
              job.shorts.filter(
                (short) =>
                  (short.item === 'FITTINGS' || short.item === 'FITTING') &&
                  filtered.includes(short.status)
              ).length
            }
          </div>
        </div>
        <div className='table-row'>
          <div className='sh-col1 table-subheader'>Supports</div>
          <div className='sh-col2'>
            {
              job.shorts.filter(
                (short) =>
                  filtered.includes(short.status) &&
                  short.scope === 'Performance' &&
                  short.item === 'SUPPORTS'
              ).length
            }
          </div>
          <div className='sh-col3'>
            {
              job.shorts.filter(
                (short) =>
                  filtered.includes(short.status) &&
                  short.scope === 'Client' &&
                  short.item === 'SUPPORTS'
              ).length
            }
          </div>
          <div className='sh-col4'>
            {
              job.shorts.filter(
                (short) =>
                  filtered.includes(short.status) &&
                  short.scope === 'Other' &&
                  short.item === 'SUPPORTS'
              ).length
            }
          </div>
          <div className='sh-col5 total-subheader'>
            {
              job.shorts.filter(
                (short) =>
                  (short.item === 'SUPPORTS' || short.item === 'SUPPORT') &&
                  filtered.includes(short.status)
              ).length
            }
          </div>
        </div>
        <div className='totals-row table-row'>
          <div className='sh-col1'>TOTAL</div>
          <div className='sh-col2'>
            {
              job.shorts.filter(
                (short) =>
                  filtered.includes(short.status) &&
                  short.scope === 'Performance'
              ).length
            }
          </div>
          <div className='sh-col3'>
            {
              job.shorts.filter(
                (short) =>
                  filtered.includes(short.status) && short.scope === 'Client'
              ).length
            }
          </div>
          <div className='sh-col4'>
            {
              job.shorts.filter(
                (short) =>
                  filtered.includes(short.status) && short.scope === 'Other'
              ).length
            }
          </div>
          <div className='sh-col5'>
            {
              job.shorts.filter((short) => filtered.includes(short.status))
                .length
            }
          </div>
        </div>
        <div className='table-row pipe-row'>
          <div className='sh-col1 table-subheader'>Pipe</div>
          <div className='sh-col2'>
            {
              job.shorts.filter(
                (short) =>
                  filtered.includes(short.status) &&
                  short.scope === 'Performance' &&
                  short.item === 'PIPE'
              ).length
            }
          </div>
          <div className='sh-col3'>
            {
              job.shorts.filter(
                (short) =>
                  filtered.includes(short.status) &&
                  short.scope === 'Client' &&
                  short.item === 'PIPE'
              ).length
            }
          </div>
          <div className='sh-col4'>
            {
              job.shorts.filter(
                (short) =>
                  filtered.includes(short.status) &&
                  short.scope === 'Other' &&
                  short.item === 'PIPE'
              ).length
            }
          </div>
          <div className='sh-col5 total-subheader'>
            {
              job.shorts.filter(
                (short) =>
                  short.item === 'PIPE' && filtered.includes(short.status)
              ).length
            }
          </div>
        </div>
      </div>
    </Fragment>
  )
}

export default Shorts
