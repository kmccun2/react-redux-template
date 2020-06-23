import React, { Fragment } from 'react'
import { connect } from 'react-redux'
import { AiOutlineUser, AiOutlineFileAdd } from 'react-icons/ai'
import { BsStopwatch, BsBarChart } from 'react-icons/bs'
import { FiSearch } from 'react-icons/fi'
import { IoIosNotificationsOutline } from 'react-icons/io'
import { Link } from 'react-router-dom'
import { setActive } from '../../actions/misc'

const Navbar = ({ active, display }) => {
  return (
    <Fragment>
      <div className={display === 'large' ? 'navbar' : 'navbar2'}>
        <Link to='/'>
          <div
            className='navbar-item'
            style={
              active === '1'
                ? { borderBottom: '2px solid #38a0ff' }
                : { borderBottom: 'none' }
            }
          >
            <BsStopwatch color='#656565' size={22} />
          </div>
        </Link>

        <div
          className='navbar-item'
          style={
            active === '2'
              ? { borderBottom: '2px solid #38a0ff' }
              : { borderBottom: 'none' }
          }
        >
          <FiSearch color='#656565' size={22} />
        </div>
        <div
          className='navbar-item'
          style={
            active === '3'
              ? { borderBottom: '2px solid #38a0ff' }
              : { borderBottom: 'none' }
          }
        >
          <BsBarChart color='#656565' size={22} />
        </div>

        <div
          className='navbar-item'
          style={
            active === '4'
              ? { borderBottom: '2px solid #38a0ff' }
              : { borderBottom: 'none' }
          }
        >
          <AiOutlineFileAdd color='#656565' size={22} />
        </div>

        <div
          className='navbar-item'
          style={
            active === '5'
              ? { borderBottom: '2px solid #38a0ff' }
              : { borderBottom: 'none' }
          }
        >
          <IoIosNotificationsOutline color='#656565' size={24} />
        </div>

        <div
          className='navbar-item'
          style={
            active === '6'
              ? { borderBottom: '2px solid #38a0ff' }
              : { borderBottom: 'none' }
          }
        >
          <AiOutlineUser color='#656565' size={22} />
        </div>
      </div>
    </Fragment>
  )
}

const mapStateToProps = (state) => ({
  active: state.misc.active,
})

export default connect(mapStateToProps, {
  setActive,
})(Navbar)
