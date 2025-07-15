import React, { useState } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    FaSpinner,
    FaPlus,
    FaTrashAlt,
    FaEdit,
    FaChevronRight,
    FaChevronLeft,
    FaCheck,
    FaTimes,
    FaEye,
    FaImage
} from 'react-icons/fa';
import Tiptap from '../TextEditor/Tiptap';

export default function BlogsDataTable({ blogs, loading, refetch }) {
    const navigate = useNavigate();
    const [filters, setFilters] = useState({
        global: '',
        title: '',
        category: '',
        status: ''
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage] = useState(10);
    const [deletingBlogId, setDeletingBlogId] = useState(null);
    const [togglingBlogId, setTogglingBlogId] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [blogToDelete, setBlogToDelete] = useState(null);
    const [updatingBlog, setUpdatingBlog] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        title: '',
        category: 'guides',
        is_active: true,
        mark_as_hero: true,
        content: '',
        cover_photo: null
    });

    const [editFormData, setEditFormData] = useState({
        id: null,
        title: '',
        category: 'guides',
        is_active: true,
        mark_as_hero: true,
        content: '',
        cover_photo: null,
        existing_cover_photo: null
    });

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
        setCurrentPage(1);
    };

    const handleToggleStatus = async (blogId, currentStatus) => {
        setTogglingBlogId(blogId);
        try {
            await axios.patch(
                `https://propxpro.run.place/api/admin/blogs/${blogId}/toggle-active`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('userToken')}`
                    }
                }
            );
            toast.success(`Blog ${currentStatus ? 'deactivated' : 'activated'} successfully`, { duration: 2000 });
            refetch();
        } catch (error) {
            toast.error(error.response?.data?.message || 'An unexpected error occurred', { duration: 3000 });
            if (error.response?.status == 401) {
                localStorage.removeItem('userToken')
                navigate('/login')
            }
        } finally {
            setTogglingBlogId(null);
        }
    };

    const handleDeleteClick = (blogId) => {
        setBlogToDelete(blogId);
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
        if (!blogToDelete) return;

        setDeletingBlogId(blogToDelete);
        setShowDeleteConfirm(false);

        try {
            await axios.delete(
                `https://propxpro.run.place/api/admin/blogs/${blogToDelete}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('userToken')}`
                    }
                }
            );
            toast.success('Blog deleted successfully', { duration: 2000 });
            refetch();
        } catch (error) {
            toast.error(error.response?.data?.message || 'An unexpected error occurred', { duration: 3000 });
            if (error.response?.status == 401) {
                localStorage.removeItem('userToken')
                navigate('/login')
            }
        } finally {
            setDeletingBlogId(null);
            setBlogToDelete(null);
        }
    };

    const handleFormChange = (e) => {
        const { name, value, type, checked, files } = e.target;

        if (type === 'file') {
            setFormData(prev => ({
                ...prev,
                [name]: files[0]
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleEditFormChange = (e) => {
        const { name, value, type, checked, files } = e.target;

        if (type === 'file') {
            setEditFormData(prev => ({
                ...prev,
                [name]: files[0]
            }));
        } else {
            setEditFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            category: 'guides',
            is_active: true,
            mark_as_hero: true,
            content: '',
            cover_photo: null
        });
    };

    const prepareEditForm = (blog) => {
        setEditFormData({
            id: blog.id,
            title: blog.title,
            category: blog.category,
            is_active: blog.is_active,
            mark_as_hero: blog.mark_as_hero,
            content: blog.content,
            cover_photo: null,
            existing_cover_photo: blog.cover_photo_url
        });
        setShowEditModal(true);
    };

    const handleAddBlog = async (e) => {
        e.preventDefault();

        setUpdatingBlog(true);
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('title', formData.title);
            formDataToSend.append('category', formData.category);
            formDataToSend.append('is_active', formData.is_active ? 1 : 0);
            formDataToSend.append('mark_as_hero', formData.mark_as_hero ? 1 : 0);
            formDataToSend.append('content', formData.content);
            if (formData.cover_photo) {
                formDataToSend.append('cover_photo', formData.cover_photo);
            }

            await axios.post(
                'https://propxpro.run.place/api/admin/blogs',
                formDataToSend,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('userToken')}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            setUpdatingBlog(false);
            toast.success('Blog added successfully', { duration: 2000 });
            setShowAddModal(false);
            resetForm();
            refetch();
        } catch (error) {
            setUpdatingBlog(false);
            toast.error(error.response?.data?.message || 'An unexpected error occurred', { duration: 3000 });
            if (error.response?.status == 401) {
                localStorage.removeItem('userToken')
                navigate('/login')
            }
        }
    };

    const handleUpdateBlog = async (e) => {
        e.preventDefault();

        setUpdatingBlog(true);
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('title', editFormData.title);
            formDataToSend.append('category', editFormData.category);
            formDataToSend.append('is_active', editFormData.is_active ? 1 : 0);
            formDataToSend.append('mark_as_hero', editFormData.mark_as_hero ? 1 : 0);
            formDataToSend.append('content', editFormData.content);
            formDataToSend.append('_method', 'POST');
            if (editFormData.cover_photo) {
                formDataToSend.append('cover_photo', editFormData.cover_photo);
            }

            await axios.post(
                `https://propxpro.run.place/api/admin/blogs/${editFormData.id}`,
                formDataToSend,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('userToken')}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            setUpdatingBlog(false);
            toast.success('Blog updated successfully', { duration: 2000 });
            setShowEditModal(false);
            refetch();
        } catch (error) {
            setUpdatingBlog(false);
            toast.error(error.response?.data?.message || 'An unexpected error occurred', { duration: 3000 });
            if (error.response?.status == 401) {
                localStorage.removeItem('userToken')
                navigate('/login')
            }
        }
    };

    // Filter blogs based on all filter criteria
    const filteredBlogs = blogs?.filter(blog => {
        return (
            (filters.global === '' ||
                blog.title.toLowerCase().includes(filters.global.toLowerCase()) ||
                blog.category.toLowerCase().includes(filters.global.toLowerCase())) &&
            (filters.title === '' ||
                blog.title.toLowerCase().includes(filters.title.toLowerCase())) &&
            (filters.category === '' || blog.category.includes(filters.category.toLowerCase())) &&
            (filters.status === '' ||
                (filters.status === 'active' ? blog.is_active : !blog.is_active))
        );
    }) || [];

    // Pagination logic
    const totalPages = Math.ceil(filteredBlogs.length / rowsPerPage);
    const paginatedBlogs = filteredBlogs.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    const categoryBadge = (category) => {
        const categories = {
            'guides': 'bg-blue-100 text-blue-800',
            'insights': 'bg-purple-100 text-purple-800',
            'trending': 'bg-pink-100 text-pink-800'
        };
        return (
            <span className={`${categories[category] || 'bg-gray-100 text-gray-800'} text-xs font-medium px-2.5 py-1 rounded capitalize`}>
                {category}
            </span>
        );
    };

    const heroBadge = (isHero) => {
        return (
            <span className={`${isHero ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'} text-xs font-medium px-2.5 py-1 rounded`}>
                {isHero ? 'Hero' : 'Normal'}
            </span>
        );
    };

    const statusBadge = (is_active) => {
        const statusClass = is_active
            ? 'bg-[#009379] text-white'
            : 'bg-[#930002] text-white';
        return (
            <span className={`flex justify-center w-fit items-center px-2.5 py-1 rounded-md text-xs font-medium ${statusClass} min-w-16 text-center`}>
                {is_active ? 'Active' : 'Inactive'}
            </span>
        );
    };

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        return (
            <div className="flex justify-between items-center mt-4 px-4 pb-1">
                <div className='text-xs'>
                    Showing {((currentPage - 1) * rowsPerPage + 1)}-{Math.min(currentPage * rowsPerPage, filteredBlogs.length)} of {filteredBlogs.length} entries
                </div>
                <div className="flex gap-1">
                    <button
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="p-1 disabled:opacity-50"
                    >
                        <FaChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="px-3 py-1">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-1 disabled:opacity-50"
                    >
                        <FaChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="shadow-2xl rounded-2xl overflow-hidden bg-white">
            {/* Global Search and Add Button */}
            <div className="p-4 border-b flex justify-between items-center gap-4">
                <input
                    type="text"
                    value={filters.global}
                    onChange={(e) => handleFilterChange('global', e.target.value)}
                    placeholder="Search blogs..."
                    className="px-3 py-2 rounded-xl shadow-sm focus:outline-2 focus:outline-primary w-full border border-primary transition-all"
                />
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-primary hover:bg-darkBlue transition-all text-white px-3 py-2 rounded-xl shadow-sm min-w-max flex items-center gap-2"
                >
                    <FaPlus size={18} />
                    <span>Add Blog</span>
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <input
                                    type="text"
                                    placeholder="Title"
                                    value={filters.title}
                                    onChange={(e) => handleFilterChange('title', e.target.value)}
                                    className="text-xs p-1 border rounded w-full"
                                />
                            </th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Cover Photo
                            </th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <select
                                    value={filters.category}
                                    onChange={(e) => handleFilterChange('category', e.target.value)}
                                    className="text-xs p-1 border rounded w-full"
                                >
                                    <option value="">All Categories</option>
                                    <option value="guides">Guides</option>
                                    <option value="insights">Insights</option>
                                    <option value="trending">Trending</option>
                                </select>
                            </th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Hero
                            </th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <select
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    className="text-xs p-1 border rounded w-full"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 text-sm">
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="px-3 py-4 text-center">
                                    <div className="flex justify-center items-center gap-2">
                                        <FaSpinner className="animate-spin" size={18} />
                                        Loading blogs...
                                    </div>
                                </td>
                            </tr>
                        ) : paginatedBlogs.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-3 py-4 text-center">
                                    No blogs found
                                </td>
                            </tr>
                        ) : (
                            paginatedBlogs.map((blog) => (
                                <tr key={blog.id} className="hover:bg-gray-50">
                                    <td className="px-3 py-4 whitespace-nowrap">
                                        <div className="font-medium">{blog.title}</div>
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap">
                                        {blog.cover_photo_url && (
                                            <img
                                                src={blog.cover_photo_url}
                                                alt="Cover"
                                                className="h-10 w-10 object-cover rounded"
                                            />
                                        )}
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap">
                                        {categoryBadge(blog.category)}
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap">
                                        {heroBadge(blog.mark_as_hero)}
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap">
                                        {statusBadge(blog.is_active)}
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <button
                                                className="text-blue-500 hover:text-blue-700 p-1"
                                                onClick={() => prepareEditForm(blog)}
                                            >
                                                <FaEdit size={18} />
                                            </button>
                                            <button
                                                className={`${blog.is_active ? 'text-red-500 hover:text-red-700' : 'text-green-500 hover:text-green-700'} p-1`}
                                                onClick={() => handleToggleStatus(blog.id, blog.is_active)}
                                                disabled={togglingBlogId === blog.id}
                                            >
                                                {togglingBlogId === blog.id ? (
                                                    <FaSpinner className="animate-spin" size={18} />
                                                ) : (
                                                    blog.is_active ? <FaTimes /> : <FaCheck />
                                                )}
                                            </button>
                                            <button
                                                className="text-red-500 hover:text-red-700 p-1"
                                                onClick={() => handleDeleteClick(blog.id)}
                                                disabled={deletingBlogId === blog.id}
                                            >
                                                {deletingBlogId === blog.id ? (
                                                    <FaSpinner className="animate-spin" size={18} />
                                                ) : (
                                                    <FaTrashAlt size={18} />
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {!loading && renderPagination()}

            {/* Add Blog Modal */}
            {showAddModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    onClick={() => setShowAddModal(false)}
                >
                    <motion.div
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <h2 className="text-xl font-bold mb-4">Add New Blog</h2>
                            <form onSubmit={handleAddBlog}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleFormChange}
                                            className="w-full px-3 py-2 border rounded-md"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleFormChange}
                                            className="w-full px-3 py-2 border rounded-md"
                                            required
                                        >
                                            <option value="guides">Guides</option>
                                            <option value="insights">Insights</option>
                                            <option value="trending">Trending</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cover Photo</label>
                                    {formData.cover_photo ? (
                                        <div className="relative mb-4">
                                            <img
                                                src={URL.createObjectURL(formData.cover_photo)}
                                                alt="Preview"
                                                className="h-48 w-full object-cover rounded-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, cover_photo: null }))}
                                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2"
                                            >
                                                <FaTimes size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <FaImage className="w-8 h-8 mb-3 text-gray-400" />
                                                <p className="mb-2 text-sm text-gray-500">
                                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    PNG, JPG, JPEG (MAX. 5MB)
                                                </p>
                                            </div>
                                            <input
                                                id="cover_photo"
                                                name="cover_photo"
                                                type="file"
                                                className="hidden"
                                                onChange={handleFormChange}
                                                accept="image/*"
                                            />
                                        </label>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="is_active"
                                            name="is_active"
                                            checked={formData.is_active}
                                            onChange={handleFormChange}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                                            Active
                                        </label>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="mark_as_hero"
                                            name="mark_as_hero"
                                            checked={formData.mark_as_hero}
                                            onChange={handleFormChange}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="mark_as_hero" className="ml-2 text-sm text-gray-700">
                                            Mark as Hero
                                        </label>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                                    <Tiptap
                                        content={formData.content}
                                        onUpdate={(content) => setFormData(prev => ({ ...prev, content }))}
                                    />
                                </div>

                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowAddModal(false);
                                            resetForm();
                                        }}
                                        className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-darkBlue transition-all flex items-center justify-center gap-2"
                                        disabled={updatingBlog}
                                    >
                                        {updatingBlog ? (
                                            <>
                                                <FaSpinner className="animate-spin" size={18} />
                                                <span>Adding...</span>
                                            </>
                                        ) : (
                                            <>
                                                <FaPlus size={18} />
                                                <span>Add Blog</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {/* Edit Blog Modal */}
            {showEditModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    onClick={() => setShowEditModal(false)}
                >
                    <motion.div
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <h2 className="text-xl font-bold mb-4">Edit Blog</h2>
                            <form onSubmit={handleUpdateBlog}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={editFormData.title}
                                            onChange={handleEditFormChange}
                                            className="w-full px-3 py-2 border rounded-md"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                        <select
                                            name="category"
                                            value={editFormData.category}
                                            onChange={handleEditFormChange}
                                            className="w-full px-3 py-2 border rounded-md"
                                            required
                                        >
                                            <option value="guides">Guides</option>
                                            <option value="insights">Insights</option>
                                            <option value="trending">Trending</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cover Photo</label>
                                    {editFormData.cover_photo ? (
                                        <div className="relative mb-4">
                                            <img
                                                src={URL.createObjectURL(editFormData.cover_photo)}
                                                alt="Preview"
                                                className="h-48 w-full object-cover rounded-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setEditFormData(prev => ({ ...prev, cover_photo: null }))}
                                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2"
                                            >
                                                <FaTimes size={16} />
                                            </button>
                                        </div>
                                    ) : editFormData.existing_cover_photo ? (
                                        <div className="relative mb-4">
                                            <img
                                                src={editFormData.existing_cover_photo}
                                                alt="Current Cover"
                                                className="h-48 w-full object-cover rounded-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setEditFormData(prev => ({ ...prev, existing_cover_photo: null }))}
                                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2"
                                            >
                                                <FaTimes size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <FaImage className="w-8 h-8 mb-3 text-gray-400" />
                                                <p className="mb-2 text-sm text-gray-500">
                                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    PNG, JPG, JPEG (MAX. 5MB)
                                                </p>
                                            </div>
                                            <input
                                                id="edit_cover_photo"
                                                name="cover_photo"
                                                type="file"
                                                className="hidden"
                                                onChange={handleEditFormChange}
                                                accept="image/*"
                                            />
                                        </label>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="edit_is_active"
                                            name="is_active"
                                            checked={editFormData.is_active}
                                            onChange={handleEditFormChange}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="edit_is_active" className="ml-2 text-sm text-gray-700">
                                            Active
                                        </label>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="edit_mark_as_hero"
                                            name="mark_as_hero"
                                            checked={editFormData.mark_as_hero}
                                            onChange={handleEditFormChange}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="edit_mark_as_hero" className="ml-2 text-sm text-gray-700">
                                            Mark as Hero
                                        </label>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                                    <Tiptap
                                        content={editFormData.content}
                                        onUpdate={(content) => setEditFormData(prev => ({ ...prev, content }))}
                                    />
                                </div>

                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowEditModal(false)}
                                        className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-darkBlue transition-all flex items-center justify-center gap-2"
                                        disabled={updatingBlog}
                                    >
                                        {updatingBlog ? (
                                            <>
                                                <FaSpinner className="animate-spin" size={18} />
                                                <span>Updating...</span>
                                            </>
                                        ) : (
                                            <>
                                                <FaCheck size={18} />
                                                <span>Update Blog</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    onClick={() => setShowDeleteConfirm(false)}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-white rounded-lg shadow-xl w-full max-w-md"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <div className="flex items-start">
                                <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                                    <FaTrashAlt className="h-5 w-5 text-red-600" />
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-medium text-gray-900">Delete Blog</h3>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500">
                                            Are you sure you want to delete this blog? This action cannot be undone.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-5 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmDelete}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
}