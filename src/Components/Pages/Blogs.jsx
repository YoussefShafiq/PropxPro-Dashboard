import { useQuery } from '@tanstack/react-query'
import axios from 'axios';
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import BlogsDataTable from '../DataTables/BlogsDataTable';

export default function Blogs() {
    const navigate = useNavigate();

    function getAllBlogs() {
        return axios.get(
            `https://propxpro.run.place/api/admin/blogs`,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('userToken')}`
                }
            }
        );
    }

    const { data: blogs, isLoading, refetch } = useQuery({
        queryKey: ['blogs'],
        queryFn: getAllBlogs,
        onError: (error) => {
            if (error.response?.status == 401) {
                localStorage.removeItem('userToken')
                navigate('/login')
            }
        }
    })

    useEffect(() => {
        console.log('blogs', blogs?.data?.data);
    }, [blogs])

    return (
        <div className="p-4">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Blogs</h1>
            <BlogsDataTable
                blogs={blogs?.data?.data || []}
                loading={isLoading}
                refetch={refetch}
            />
        </div>
    )
}