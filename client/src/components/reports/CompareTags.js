import React, { Fragment, useEffect } from 'react'

const CompareTags = () => {
  useEffect(() => {
    CompareTags()
  }, [compareTags])
  return (
    <Fragment>
      <div className='table-label'>Compare Tags</div>
    </Fragment>
  )
}

export default CompareTags
