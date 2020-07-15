import React, { useEffect, Fragment } from 'react'
import { connect } from 'react-redux'
import Loading from '../misc/Loading'
import Timeline from './Timeline'

const SpoolProf = ({
  match,
  all_spools,
  dormant,
  jobnums,
  updateDormant,
  getItems,
  spool,
}) => {
  // LOAD JOBS IF NOT LOADED
  useEffect(() => {
    if (dormant === undefined) {
      updateDormant(jobnums)
    }
    // eslint-disable-next-line
  }, [])

  // useEffect(() => {
  //   getItems(all_spools.filter((each) => each.piecemark === match.params.id)[0])
  // }, [match.params.id, all_spools, getItems])

  return (
    <Fragment>
      {dormant !== undefined && spool !== undefined ? (
        <Fragment>
          <div className='js-heading'>Spool {spool.spool}</div>
          <div className='sub-heading'>
            {spool.client}: {spool.jobnum}
          </div>
          <Timeline spool={spool} />

          {/* DATES */}
          <div className='prof-info-cont'>
            <div className='prof-info'>
              <div className='prof-heading'>Timeline Dates</div>
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
                  <div className='sd-col2'>
                    {spool.weldout && spool.weldout}
                  </div>
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
            </div>
            {/* DATES */}
            <div className='prof-info'>
              <div className='prof-info'>
                <div className='prof-heading'>More Information</div>
                <div className='spool-dates'>
                  <div className='sd-row'>
                    <div className='sd-col1'>Lifespan</div>
                    <div className='sd-col2'>
                      {spool.lifespan && spool.lifespan}
                    </div>
                  </div>
                  <div className='sd-row'>
                    <div className='sd-col1'>Material</div>
                    <div className='sd-col2'>
                      {spool.material && spool.material}
                    </div>
                  </div>
                  <div className='sd-row'>
                    <div className='sd-col1'>Priority</div>
                    <div className='sd-col2'>
                      {spool.priority && spool.priority}
                    </div>
                  </div>
                  <div className='sd-row'>
                    <div className='sd-col1'>Area</div>
                    <div className='sd-col2'>{spool.area && spool.area}</div>
                  </div>
                  <div className='sd-row'>
                    <div className='sd-col1'>Shop</div>
                    <div className='sd-col2'>
                      {spool.shop.toUpperCase() === 'M' && 'Mobile'}
                      {spool.shop.toUpperCase() === 'PA' && 'Port Allen'}
                      {spool.shop.toUpperCase() === 'BR' && 'Baton Rouge'}
                      {spool.shop.toUpperCase() === 'TX' && 'TEXAS'}
                    </div>
                  </div>
                  <div className='sd-row'>
                    <div className='sd-col1'>On Hold</div>
                    <div className='sd-col2'>
                      {spool.on_hold === '' || spool.on_hold === undefined
                        ? '-'
                        : spool.on_hold}
                    </div>
                  </div>
                  <div className='sd-row'>
                    <div className='sd-col1'>Total Items</div>
                    <div className='sd-col2'>
                      {spool.totalitems && spool.totalitems}
                    </div>
                  </div>
                  <div className='sd-row'>
                    <div className='sd-col1'>Total Pipe</div>
                    <div className='sd-col2'>
                      {spool.totalpipe && spool.totalpipe}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* ITEMS */}
          <div className='prof-heading'>Components</div>
          <div className='spool-items'>
            {spool.items.map((item) => {
              if (item.item.includes('PIPE')) {
                return (
                  <div
                    className={
                      item.status === 'Complete'
                        ? 'spool-item pipe'
                        : 'spool-item pipe missing'
                    }
                  ></div>
                )
              } else if (item.item.includes('SUPPORT')) {
                return (
                  <div
                    className={
                      item.status === 'Complete'
                        ? 'spool-item support'
                        : 'spool-item support missing'
                    }
                  ></div>
                )
              } else if (item.item.includes('VALVE')) {
                return (
                  <div
                    className={
                      item.status === 'Complete'
                        ? 'spool-item valve'
                        : 'spool-item valve missing'
                    }
                  ></div>
                )
              } else if (item.item.includes('FITTING')) {
                return (
                  <div
                    className={
                      item.status === 'Complete'
                        ? 'spool-item fitting'
                        : 'spool-item fitting missing'
                    }
                  ></div>
                )
              } else if (item.item.includes('FLANGE')) {
                return (
                  <div
                    className={
                      item.status === 'Complete'
                        ? 'spool-item flange'
                        : 'spool-item flange missing'
                    }
                  ></div>
                )
              }
              return item
            })}
          </div>
        </Fragment>
      ) : (
        <Loading message='Loading spool information...' />
      )}
    </Fragment>
  )
}

const mapStateToProps = (state) => ({
  all_spools: state.jobs.all_spools,
  dormant: state.jobs.dormant,
  jobnums: state.jobs.jobnums,
  spool: state.jobs.profspool,
})

export default connect(mapStateToProps)(SpoolProf)
