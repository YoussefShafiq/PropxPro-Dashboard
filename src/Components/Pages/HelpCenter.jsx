import React from 'react'
import { Link } from 'react-router-dom'

export default function HelpCenter() {
    return <>
        <h1 className="text-3xl font-bold text-gray-800 mb-8 ">Help center</h1>
        <Link to={'categories'} className='bg-primary text-white py-2 px-3 rounded-xl' >Categories</Link>
        <hr className='my-5' />
        <Link to={'subcategories'} className='bg-primary text-white py-2 px-3 rounded-xl' >Subcategories</Link>
        <hr className='my-5' />
        <Link to={'articles'} className='bg-primary text-white py-2 px-3 rounded-xl' >Articles</Link>
        <hr className='my-5' />
    </>
}
