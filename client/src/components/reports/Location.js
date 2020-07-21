import React, { Fragment, useState } from 'react'
import { Typography, Slider } from '@material-ui/core'

const Location = () => {
  const [value, setValue] = useState()

  const handleChange = (e) => {
    setValue(e.target.value)
  }
  return (
    <Fragment>
      <div className='slider-container'>
        <Typography id='non-linear-slider' gutterBottom>
          Temperature range
        </Typography>
        <Slider
          value={value}
          min={1}
          step={0.01}
          max={12}
          scale={(x) => x}
          // getAriaValueText={valueLabelFormat}
          // valueLabelFormat={valueLabelFormat}
          onChange={(e) => handleChange(e)}
          valueLabelDisplay='auto'
          aria-labelledby='non-linear-slider'
        />
      </div>
    </Fragment>
  )
}

export default Location
