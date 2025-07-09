import { useQuery } from '@tanstack/react-query'
import axios from 'axios';
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import IntegrationsDataTable from '../DataTables/IntegrationsDataTable';

export default function Integrations() {
    const navigate = useNavigate();

    function getIntegrationsData() {
        return axios.get(
            `https://propxpro.run.place/api/admin/integrations`,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('userToken')}`
                }
            }
        );
    }

    const { data: integrations, isLoading, refetch, isError, error } = useQuery({
        queryKey: ['integrations'],
        queryFn: getIntegrationsData,
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
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Integrations</h1>
            <IntegrationsDataTable
                integrations={integrations?.data?.data || []}
                loading={isLoading}
                refetch={refetch}
            />
        </div>
    )
}