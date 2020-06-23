import React from 'react'
import Navbar from './Navbar'
import { AiOutlineMenu } from 'react-icons/ai'
import { Link } from 'react-router-dom'

const Header = () => {
  return (
    <div className='header'>
      <div className='header-logo'>
        <Link to='/dashboard/feed'>
          MyMetrix<span className='header-sublogo'>Db</span>
        </Link>
      </div>

      <Navbar display='large' />
      <div className='greeting-container'>
        <div className='greeting'>'Welcome!</div>
        <AiOutlineMenu
          color='#3a3a3a'
          size={22}
          style={{ margin: '2px 12px 0 8px' }}
        />
      </div>
    </div>
  )
}

export default Header
