import { useQuery } from '@tanstack/react-query'
import axios from 'axios';
import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import FeaturesDataTable from '../DataTables/FeaturesDataTable';
import PlansDataTable from '../DataTables/PlansDataTable';

export default function Plans() {
    const navigate = useNavigate();

    function getAllPlans() {
        return axios.get(
            `https://propxpro.run.place/api/admin/plans`,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('userToken')}`
                }
            }
        );
    }

    const { data: plans, isLoading, refetch, error, isError } = useQuery({
        queryKey: ['plans'],
        queryFn: getAllPlans,
        onError: (error) => {
            if (error.response?.status == 401) {
                localStorage.removeItem('userToken')
                navigate('/login')
            }
        }
    })


    useEffect(() => {
        if (isError) {
            if (error.response?.status == 401) {
                localStorage.removeItem('userToken')
                navigate('/login')
            }
        }
    }, [isError])

    return (
        <div className="p-4">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Plans Features</h1>
            <Link to={'/plans/features'} className='bg-primary text-white py-2 px-3 rounded-xl' >Open plans features</Link>
            <hr className='my-5' />
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Plans</h1>
            <PlansDataTable
                plans={plans?.data?.data || []}
                loading={isLoading}
                refetch={refetch}
            />
        </div>
    )
}