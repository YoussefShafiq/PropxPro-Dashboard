import { useQuery } from '@tanstack/react-query'
import axios from 'axios';
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import DemoRequestsDataTable from '../DataTables/DemoRequestsDataTable';

export default function DemoRequests() {
    const navigate = useNavigate();

    function getAllDemoRequests() {
        return axios.get(
            `https://propxpro.run.place/api/admin/request-demos`,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('userToken')}`
                }
            }
        );
    }

    const { data: demoRequests, isLoading, refetch } = useQuery({
        queryKey: ['demoRequests'],
        queryFn: getAllDemoRequests,
        onError: (error) => {
            if (error.response?.status == 401) {
                localStorage.removeItem('userToken')
                navigate('/login')
            }
        }
    })

    useEffect(() => {
        console.log('demoRequests', demoRequests?.data?.data);
    }, [demoRequests])

    return (
        <div className="p-4">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">News Letter</h1>
            <DemoRequestsDataTable
                demoRequests={demoRequests?.data?.data || []}
                loading={isLoading}
                refetch={refetch}
            />
        </div>
    )
}