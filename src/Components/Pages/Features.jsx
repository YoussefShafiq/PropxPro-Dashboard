import { useQuery } from '@tanstack/react-query'
import axios from 'axios';
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import FeaturesDataTable from '../DataTables/FeaturesDataTable';
import { RiArrowGoBackFill } from 'react-icons/ri';

export default function Features() {
    const navigate = useNavigate();

    function getAllFeatures() {
        return axios.get(
            `https://propxpro.run.place/api/admin/features`,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('userToken')}`
                }
            }
        );
    }

    const { data: features, isLoading, refetch } = useQuery({
        queryKey: ['features'],
        queryFn: getAllFeatures,
        onError: (error) => {
            if (error.response?.status == 401) {
                localStorage.removeItem('userToken')
                navigate('/login')
            }
        }
    })

    useEffect(() => {
        console.log('features', features?.data?.data);
    }, [features])

    return (
        <div className="p-4">
            <button className='bg-gray-200 text-primary p-3 rounded-full aspect-square mb-2' onClick={() => navigate(`/plans`)}><RiArrowGoBackFill /></button>
            <h1 className="text-3xl font-bold text-gray-800 mb-8 mt-3">Plans features</h1>
            <FeaturesDataTable
                features={features?.data?.data || []}
                loading={isLoading}
                refetch={refetch}
            />
        </div>
    )
}