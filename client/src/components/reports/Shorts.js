import React, { Fragment, useState, useEffect } from 'react'
import { connect } from 'react-redux'

const Shorts = ({ header, shorts, job, pipeshorts }) => {
  // CALCULATIONS FOR PIPE
  const [pipe_p, setPipe_p] = useState(0)
  const [pipe_c, setPipe_c] = useState(0)
  const [pipe_o, setPipe_o] = useState(0)
  const [pipe_t, setPipe_t] = useState(0)

  useEffect(() => {
    let perf = 0
    let cli = 0
    let oth = 0
    let tot = 0
    pipeshorts.map((short) => {
      if (short.scope === 'Performance') {
        perf += parseFloat(short.quantity)
      }
      if (short.scope === 'Client') {
        cli += parseFloat(short.quantity)
      }
      if (short.scope === 'Other') {
        oth += parseFloat(short.quantity)
      }
      tot += parseFloat(short.quantity)
      return short
    })
    setPipe_p(perf.toFixed(1))
    setPipe_c(cli.toFixed(1))
    setPipe_o(oth.toFixed(1))
    setPipe_t(tot.toFixed(1))
  }, [pipeshorts])

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
            <div className='sh-col2'>
              {
                shorts.filter(
                  (short) =>
                    short.item === 'VALVES / IN-LINE ITEMS' &&
                    short.scope === 'Performance'
                ).length
              }
            </div>
            <div className='sh-col3'>
              {
                shorts.filter(
                  (short) =>
                    short.item === 'VALVES / IN-LINE ITEMS' &&
                    short.scope === 'Client'
                ).length
              }
            </div>
            <div className='sh-col4'>
              {
                shorts.filter(
                  (short) =>
                    short.item === 'VALVES / IN-LINE ITEMS' &&
                    short.scope === 'Other'
                ).length
              }
            </div>
            <div className='sh-col5 total-subheader'>
              {
                shorts.filter(
                  (short) => short.item === 'VALVES / IN-LINE ITEMS'
                ).length
              }
            </div>
          </div>
          <div className='table-row'>
            <div className='sh-col1 table-subheader'>Flanges</div>
            <div className='sh-col2'>
              {
                shorts.filter(
                  (short) =>
                    short.item === 'FLANGES' && short.scope === 'Performance'
                ).length
              }
            </div>
            <div className='sh-col3'>
              {
                shorts.filter(
                  (short) =>
                    short.item === 'FLANGES' && short.scope === 'Client'
                ).length
              }
            </div>
            <div className='sh-col4'>
              {
                shorts.filter(
                  (short) => short.item === 'FLANGES' && short.scope === 'Other'
                ).length
              }
            </div>
            <div className='sh-col5 total-subheader'>
              {shorts.filter((short) => short.item === 'FLANGES').length}
            </div>
          </div>
          <div className='table-row'>
            <div className='sh-col1 table-subheader'>Fittings</div>
            <div className='sh-col2'>
              {
                shorts.filter(
                  (short) =>
                    short.item === 'FITTINGS' && short.scope === 'Performance'
                ).length
              }
            </div>
            <div className='sh-col3'>
              {
                shorts.filter(
                  (short) =>
                    short.item === 'FITTINGS' && short.scope === 'Client'
                ).length
              }
            </div>
            <div className='sh-col4'>
              {
                shorts.filter(
                  (short) =>
                    short.item === 'FITTINGS' && short.scope === 'Other'
                ).length
              }
            </div>
            <div className='sh-col5 total-subheader'>
              {shorts.filter((short) => short.item === 'FITTINGS').length}
            </div>
          </div>
          <div className='table-row'>
            <div className='sh-col1 table-subheader'>Supports</div>
            <div className='sh-col2'>
              {
                shorts.filter(
                  (short) =>
                    short.item === 'SUPPORTS' && short.scope === 'Performance'
                ).length
              }
            </div>
            <div className='sh-col3'>
              {
                shorts.filter(
                  (short) =>
                    short.item === 'SUPPORTS' && short.scope === 'Client'
                ).length
              }
            </div>
            <div className='sh-col4'>
              {
                shorts.filter(
                  (short) =>
                    short.item === 'SUPPORTS' && short.scope === 'Other'
                ).length
              }
            </div>
            <div className='sh-col5 total-subheader'>
              {shorts.filter((short) => short.item === 'SUPPORTS').length}
            </div>
          </div>
          <div className='totals-row table-row'>
            <div className='sh-col1'>TOTAL</div>
            <div className='sh-col2'>
              {shorts.filter((short) => short.scope === 'Performance').length}
            </div>
            <div className='sh-col3'>
              {shorts.filter((short) => short.scope === 'Client').length}
            </div>
            <div className='sh-col4'>
              {shorts.filter((short) => short.scope === 'Other').length}
            </div>
            <div className='sh-col5'>{shorts.length}</div>
          </div>
          <div className='table-row pipe-row'>
            <div className='sh-col1 table-subheader'>Pipe</div>
            <div className='sh-col2'>{pipe_p}</div>
            <div className='sh-col3'>{pipe_c}</div>
            <div className='sh-col4'>{pipe_o}</div>
            <div className='sh-col5 total-subheader'>{pipe_t}</div>
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
