import { useQuery } from '@tanstack/react-query'
import axios from 'axios';
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import DemoRequestsDataTable from '../DataTables/DemoRequestsDataTable';
import toast from 'react-hot-toast';

export default function DemoRequests() {
    const navigate = useNavigate();

    function getAllDemoRequests() {
        return axios.get(
            `https://api.propxpro.com/api/admin/request-demos`,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('userToken')}`
                }
            }
        );
    }

    const { data: demoRequests, isLoading, refetch, isError, error } = useQuery({
        queryKey: ['demoRequests'],
        queryFn: getAllDemoRequests,
    })

    useEffect(() => {
        if (isError) {
            if (error.response?.status == 401) {
                localStorage.removeItem('userToken')
                navigate('/login')
            }
            if (error.response?.status == 403) {
                toast.error('You are not authorized to view this page')
                navigate('/home')
            }
        }
    }, [isError])

    return (
        <div className="p-4">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Requested demos</h1>
            <DemoRequestsDataTable
                demoRequests={demoRequests?.data?.data || []}
                loading={isLoading}
                refetch={refetch}
            />
        </div>
    )
}