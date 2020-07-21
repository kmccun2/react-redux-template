import React, { Fragment, useState, useEffect } from 'react'

const SpoolShorts = ({ job: { shorts, spools, issued, total } }) => {
  const [workableNotIss, setWorkableNotIss] = useState(0)
  const [issuedMI, setIssuedMI] = useState(0)
  const [spoolsV, setSpoolsV] = useState([])
  const [spoolsP, setSpoolsP] = useState([])
  const [spoolsFl, setSpoolsFl] = useState([])
  const [spoolsFi, setSpoolsFi] = useState([])
  const [spoolsS, setSpoolsS] = useState([])
  const [onHold, setOnHold] = useState([])

  useEffect(() => {
    let worknotiss = 0
    let issMI = 0

    spools.map((spool) => {
      if (spool.workable === true && spool.issued.includes('/') === false) {
        worknotiss += spool.multiplier
      }
      if (spool.issued.includes('/') && spool.shorts.length > 0) {
        issMI += spool.multiplier
      }
      return spool
    })
    setWorkableNotIss(worknotiss)
    setIssuedMI(issMI)

    // ON HOLD
    let on_hold = 0
    spools.filter((spool) => {
      if (spool.status === 'On Hold' && spool.shorts.length === 0) {
        on_hold += spool.multiplier
      }
      return spool
    })
    setOnHold(on_hold)
  }, [spools])

  // FIND NUMBER OF SPOOLS MISSING ITEMS
  useEffect(() => {
    let spoollist = []
    let spools_valves = []
    let spools_pipe = []
    let spools_flanges = []
    let spools_fittings = []
    let spools_supports = []
    shorts.map((each) => {
      if (
        spoollist.includes(each.spool) === false &&
        each.item === 'VALVES / IN-LINE ITEMS'
      ) {
        spoollist.push(each.spool)
        spools_valves.push(each)
      }
      return each
    })
    shorts.map((each) => {
      if (spoollist.includes(each.spool) === false && each.item === 'PIPE') {
        spoollist.push(each.spool)
        spools_pipe.push(each)
      }
      return each
    })
    shorts.map((each) => {
      if (spoollist.includes(each.spool) === false && each.item === 'FLANGES') {
        spoollist.push(each.spool)
        spools_flanges.push(each)
      }
      return each
    })
    shorts.map((each) => {
      if (
        spoollist.includes(each.spool) === false &&
        each.item === 'FITTINGS'
      ) {
        spoollist.push(each.spool)
        spools_fittings.push(each)
      }
      return each
    })
    shorts.map((each) => {
      if (
        spoollist.includes(each.spool) === false &&
        each.item === 'SUPPORTS'
      ) {
        spoollist.push(each.spool)
        spools_supports.push(each)
      }
      return each
    })
    setSpoolsV(spools_valves)
    setSpoolsP(spools_pipe)
    setSpoolsFl(spools_flanges)
    setSpoolsFi(spools_fittings)
    setSpoolsS(spools_supports)
  }, [shorts])

  // COUNT SPOOLS USING MULITPLIER
  const countSpools = (spoolsarray) => {
    let countspools = 0
    spoolsarray.map((spool) => (countspools += spool.spoolmultiplier))
    return countspools
  }
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
          <div className='sh-col2'>
            {countSpools(
              spoolsV.filter((spool) => spool.scope === 'Performance')
            )}
          </div>
          <div className='sh-col3'>
            {' '}
            {countSpools(spoolsV.filter((spool) => spool.scope === 'Client'))}
          </div>
          <div className='sh-col4'>
            {' '}
            {countSpools(spoolsV.filter((spool) => spool.scope === 'Other'))}
          </div>
          <div className='sh-col5 total-subheader'>{countSpools(spoolsV)}</div>
        </div>
        <div className='table-row'>
          <div className='sh-col1 table-subheader'>Pipe</div>
          <div className='sh-col2'>
            {countSpools(
              spoolsP.filter((spool) => spool.scope === 'Performance')
            )}
          </div>
          <div className='sh-col3'>
            {' '}
            {countSpools(spoolsP.filter((spool) => spool.scope === 'Client'))}
          </div>
          <div className='sh-col4'>
            {' '}
            {countSpools(spoolsP.filter((spool) => spool.scope === 'Other'))}
          </div>
          <div className='sh-col5 total-subheader'>{countSpools(spoolsP)}</div>
        </div>
        <div className='table-row'>
          <div className='sh-col1 table-subheader'>Flanges</div>
          <div className='sh-col2'>
            {countSpools(
              spoolsFl.filter((spool) => spool.scope === 'Performance')
            )}
          </div>
          <div className='sh-col3'>
            {' '}
            {countSpools(spoolsFl.filter((spool) => spool.scope === 'Client'))}
          </div>
          <div className='sh-col4'>
            {' '}
            {countSpools(spoolsFl.filter((spool) => spool.scope === 'Other'))}
          </div>
          <div className='sh-col5 total-subheader'>{countSpools(spoolsFl)}</div>
        </div>
        <div className='table-row'>
          <div className='sh-col1 table-subheader'>Fittings</div>
          <div className='sh-col2'>
            {countSpools(
              spoolsFi.filter((spool) => spool.scope === 'Performance')
            )}
          </div>
          <div className='sh-col3'>
            {' '}
            {countSpools(spoolsFi.filter((spool) => spool.scope === 'Client'))}
          </div>
          <div className='sh-col4'>
            {' '}
            {countSpools(spoolsFi.filter((spool) => spool.scope === 'Other'))}
          </div>
          <div className='sh-col5 total-subheader'>{countSpools(spoolsFi)}</div>
        </div>
        <div className='table-row'>
          <div className='sh-col1 table-subheader'>Supports</div>
          <div className='sh-col2'>
            {countSpools(
              spoolsS.filter((spool) => spool.scope === 'Performance')
            )}
          </div>
          <div className='sh-col3'>
            {' '}
            {countSpools(spoolsS.filter((spool) => spool.scope === 'Client'))}
          </div>
          <div className='sh-col4'>
            {' '}
            {countSpools(spoolsS.filter((spool) => spool.scope === 'Other'))}
          </div>
          <div className='sh-col5 total-subheader'>{countSpools(spoolsS)}</div>
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
          <div className='sh-col5 total-subheader'>{issuedMI}</div>
        </div>
        <div className='table-row'>
          <div className='sh-col1 table-subheader'>Workable (Not Issued)</div>
          <div className='sh-col2'></div>
          <div className='sh-col3'></div>
          <div className='sh-col4'></div>
          <div className='sh-col5 total-subheader'>{workableNotIss}</div>
        </div>
        <div className='table-row'>
          <div className='sh-col1 table-subheader'>On Hold (No Shorts)</div>
          <div className='sh-col2'></div>
          <div className='sh-col3'></div>
          <div className='sh-col4'></div>
          <div className='sh-col5 total-subheader'>{onHold}</div>
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
            {Math.abs(
              total -
                (countSpools(spoolsV) +
                  countSpools(spoolsP) +
                  countSpools(spoolsFl) +
                  countSpools(spoolsFi) +
                  countSpools(spoolsS) +
                  issued +
                  onHold +
                  workableNotIss -
                  issuedMI)
            )}
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
