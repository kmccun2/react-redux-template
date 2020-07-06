import React from 'react'
// import Loader from 'react-loader-spinner'

const Loading = ({ message }) => {
  return (
    <div className='loading-container'>
      <div className='loading-msg'>{message}</div>
      {/* <Loader type='Grid' color='#a680dd' height={80} width={80} /> */}
    </div>
  )
}

export default Loading
