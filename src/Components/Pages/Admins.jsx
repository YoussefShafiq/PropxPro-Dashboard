import { useQuery } from '@tanstack/react-query'
import axios from 'axios';
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import IntegrationsDataTable from '../DataTables/IntegrationsDataTable';
import AdminsDataTable from '../DataTables/AdminsDataTable';

export default function Admins() {
    const navigate = useNavigate();

    function getAdminsData() {
        return axios.get(
            `https://propxpro.run.place/api/admins`,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('userToken')}`
                }
            }
        );
    }

    const { data: admins, isLoading, refetch } = useQuery({
        queryKey: ['admins'],
        queryFn: getAdminsData,
        onError: (error) => {
            if (error.response?.status === 401) {
                localStorage.removeItem('userToken')
                navigate('/login')
            }
        }
    })

    function getpermissionsData() {
        return axios.get(
            `https://propxpro.run.place/api/admins/permissions`,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('userToken')}`
                }
            }
        );
    }

    const { data: permissions } = useQuery({
        queryKey: ['permissions'],
        queryFn: getpermissionsData,
        onError: (error) => {
            if (error.response?.status === 401) {
                localStorage.removeItem('userToken')
                navigate('/login')
            }
        }
    })

    useEffect(() => {
        console.log('permissions', permissions?.data?.data);

    }, [permissions])


    return (
        <div className="p-4">
            <AdminsDataTable
                admins={admins?.data?.data || []}
                allPermissions={permissions?.data?.data || []}
                loading={isLoading}
                refetch={refetch}
            />
        </div>
    )
}