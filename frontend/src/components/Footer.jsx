import React from 'react'
import { Link } from 'react-router-dom'
import { assets } from '../assets/assets'

const Footer = () => {
  return (
    <div className='md:mx-10'>
      <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm'>
        {/* Left Side */}
        <div>
          <img className='mb-5 w-40' src={assets.logo} alt="" />
          <p className='w-full md:w-2/3 text-gray-600 leading-6'>DocPulse makes healthcare simple by helping you find and book appointments with trusted doctors anytime, anywhere.</p>
        </div>
        {/* Center Side */}
        <div>
          <p className='text-xl font-medium mb-5'>COMPANY</p>
          <ul className='flex flex-col gap-2 text-gray-600'>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
            <li><Link to="/privacy">Privacy policy</Link></li>
          </ul>
        </div>
        {/* Right Side */}
        <div>
          <p className='text-xl font-medium mb-5'>GET IN TOUCH</p>
          <ul className='flex flex-col gap-2 text-gray-600'>
            <li><Link to="tel:+911234567891">+91 1234567891</Link></li>
            <li><Link to="mailto:docpulse@gmail.com">docpulse@gmail.com</Link></li>
          </ul>
        </div>
      </div>
      {/* Copyright Text */}
      <div>
        <hr />
        <p className='py-5 text-sm text-center'>© Copyright 2025 DocPulse. All rights reserved.</p>
      </div>
    </div>
  )
}

export default Footer
