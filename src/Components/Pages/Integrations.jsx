import { useQuery } from '@tanstack/react-query'
import axios from 'axios';
import React from 'react'
import { useNavigate } from 'react-router-dom';
import IntegrationsDataTable from '../DataTables/IntegrationsDataTable';

export default function Integrations() {
    const navigate = useNavigate();

    function getIntegrationsData() {
        return axios.get(
            `http://3.19.62.232/api/integrations`,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('userToken')}`
                }
            }
        );
    }

    const { data: integrations, isLoading, refetch } = useQuery({
        queryKey: ['integrations'],
        queryFn: getIntegrationsData,
        onError: (error) => {
            if (error.response?.status === 401) {
                localStorage.removeItem('userToken')
                navigate('/login')
            }
        }
    })

    return (
        <div className="p-4">
            <IntegrationsDataTable
                integrations={integrations?.data?.data || []}
                loading={isLoading}
                refetch={refetch}
            />
        </div>
    )
}