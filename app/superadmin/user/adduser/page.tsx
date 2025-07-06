'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { useSuperActions } from '@/app/hooks/superadmin/useSuperActions';
import Link from 'next/link';

type FormErrors = {
  name?: string;
  email?: string;
  password?: string;
  is_admin?: string;
  img?: string;
  filer?: string;
};

type UserFormData = {
  name: string;
  email: string;
  password: string;
  is_admin: string;
  img: File | null;
  filer: File | null;
};


export default function SuperAdminAddUserPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const { user, isInitialLoad} = useSuperActions();
    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
    const [emailExists, setEmailExists] = useState<boolean | null>(null);
    const [formData, setFormData] = useState<UserFormData>({
        name: '',
        email: '',
        password: '',
        is_admin: 'orduser',
        img: null,
        filer: null,
    });
    const [formLoading, setFormLoading] = useState(false);
    const [emailCheckMessage, setEmailCheckMessage] = useState('');
    const [emailChecking, setEmailChecking] = useState(false);


    const checkEmailAvailability = async (email: string) => {
        setEmailChecking(true);
        setEmailCheckMessage('');
        try {
            const cleanPath = 'api/superadmin/users/check-email';
            const finalUrl = api.defaults.baseURL + cleanPath;
            const res = await api.post(finalUrl, { email });

            if (res.data.valid) {
                setEmailCheckMessage('✅ Email is available.');
                setEmailExists(false);
                setFormErrors(prev => ({ ...prev, email: undefined }));
            } else {
                setEmailCheckMessage('❌ ' + res.data.message);
                setEmailExists(true);
                setFormErrors(prev => ({ ...prev, email: res.data.message || 'Email is taken' }));
            }
        } catch (err) {
            setEmailCheckMessage('⚠️ Invalid or unavailable email.');
            setEmailExists(true);
            setFormErrors(prev => ({ ...prev, email: 'Invalid or unavailable email' }));
        } finally {
            setEmailChecking(false);
        }
    };
    
    const MAX_IMAGE_SIZE_MB = 9;
    const MAX_FILE_SIZE_MB = 9;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;

    if (files && files[0]) {
        const file = files[0];

        if (name === 'img') {
            const allowedImgTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
            if (!allowedImgTypes.includes(file.type)) {
                setFormErrors(prev => ({ ...prev, img: 'Invalid image type' }));
                return;
            }
            if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
                setFormErrors(prev => ({ ...prev, img: `Image must be less than ${MAX_IMAGE_SIZE_MB}MB` }));
                return;
            }
        }

        if (name === 'filer') {
            const allowedFileTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'text/plain',
                'image/jpeg',
                'image/jpg',
                'image/png',
                'image/webp',
                'image/gif',
            ];
            if (!allowedFileTypes.includes(file.type)) {
                setFormErrors(prev => ({ ...prev, filer: 'Invalid file type' }));
                return;
            }
            if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
                setFormErrors(prev => ({ ...prev, filer: `File must be less than ${MAX_FILE_SIZE_MB}MB` }));
                return;
            }
        }
        setFormErrors(prev => ({ ...prev, [name]: undefined }));
        setFormData(prev => ({ ...prev, [name]: file }));
        return;
    }

        setFormData(prev => ({ ...prev, [name]: value }));
        setFormErrors(prev => ({ ...prev, [name]: undefined }));

        if (name === 'email') {
            checkEmailAvailability(value);
        }
    };


    const validateBeforeSubmit = () => {
        const errors: FormErrors = { ...formErrors }; // ✅ Include previously detected errors
        if (!formData.name.trim()) errors.name = 'Name is required';
        if (!formData.email.trim()) errors.email = 'Email is required';
        if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';
        if (emailExists)  errors.email = 'Email is already in use';
        if (!formData.password) errors.password = 'Password is required';
        if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
        return errors;
    };


    useEffect(() => {
        const hasErrors = Object.values(formErrors).some(Boolean);
        setIsSubmitDisabled(hasErrors || emailChecking || !!emailExists); // Convert emailExists to a boolean
    }, [formErrors, emailChecking, emailExists]);


    const handleFormSubmit = async (e) => {
        e.preventDefault();
        alert(`🧪 Form Data:
        Name: ${formData.name}
        Email: ${formData.email}
        Password: ${formData.password}
        Role: ${formData.is_admin}
        Img: ${formData.img ? formData.img.name : 'none'}
        Filer: ${formData.filer ? formData.filer.name : 'none'}
        `);

        setTimeout(() => {
            const errors = validateBeforeSubmit();
            const sanitizedErrors: FormErrors = {};
            Object.entries(errors).forEach(([key, value]) => {
            if (typeof value === 'string' && value.trim() !== '') {
                sanitizedErrors[key as keyof FormErrors] = value;
            }
            });

            const errorMessages = Object.entries(sanitizedErrors)
            .map(([field, message]) => `${field}: ${message}`)
            .join('\n');

            alert(`🛑 Validation Errors:\n\n${errorMessages || 'None — form should submit.'}`);
            setFormErrors(sanitizedErrors);
            if (Object.keys(sanitizedErrors).length > 0) return;

            // Continue with submission...
        }, 150); // 🕐 Adjust if needed




        setFormLoading(true);
        const payload = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
            payload.append(key, value);
        }
        });


        try {
            //await api.get('/sanctum/csrf-cookie');
            /*
            const res = await api.post('/api/superadmin/user/adduser', payload, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            */
            const cleanPath = 'api/superadmin/user/adduser';
            const finalUrl = api.defaults.baseURL + cleanPath;
            const res = await api.post(finalUrl, payload, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            });
            router.push('/superadmin/user/view?message=User+created+successfully');
        } 
        catch (err: any) {
            if (err.response?.data?.errors) {
                setFormErrors(err.response.data.errors);
            } else {
                setError('Unexpected error occurred. Check console for details.');
                console.error('Submission failed:', err);
            }
        }

        finally {
            setFormLoading(false);
        }
    };

    if (isInitialLoad) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (!user || user.is_admin !== 'superadmin') return null;

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-5xl mx-auto space-y-8">
                <div className="bg-white p-6 rounded shadow">
                    <div className='mt-2 mb-4'>
                        <Link href = '/superadmin/user/view' className='mt-2 mb-4'> &rsaquo; View Users </Link>
                    </div>
                    <h3 className="text-xl font-semibold mb-4">➕ Add New User</h3>

                    <form onSubmit={handleFormSubmit} encType="multipart/form-data" className="space-y-4">
                        <input name="name" type="text" value={formData.name} onChange={handleInputChange} 
                        placeholder="Name" className="w-full p-2 border rounded" />
                        {formErrors.name && <p className="text-red-600 text-sm">{formErrors.name}</p>}

                        <input name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="Email" className="w-full p-2 border rounded" />
                        {formErrors.email && <p className="text-red-600 text-sm">{formErrors.email}</p>}
                        {emailChecking && <p className="text-blue-600 text-sm">Checking email...</p>}
                        {emailCheckMessage && <p className="text-sm">{emailCheckMessage}</p>}

                        <input name="password" type="password" value={formData.password} onChange={handleInputChange} placeholder="Password" className="w-full p-2 border rounded" />
                        {formErrors.password && <p className="text-red-600 text-sm">{formErrors.password}</p>}

                        <select name="is_admin" value={formData.is_admin} onChange={handleInputChange} className="w-full p-2 border rounded">
                            <option value="orduser">Ordinay User</option>
                            <option value="admin">Admin</option>
                            <option value="superadmin">Superadmin</option>
                        </select>

                        <div className="space-y-4 w-[90%]">
                        {/* Image Upload */}
                        <div  className="w-[90%]">
                            <label className="block font-medium mb-1">Upload Image (jpg, png, webp, gif)</label>

                            {/* Hidden input + Styled Button */}
                            <div className="relative">
                            <input
                                type="file"
                                name="img"
                                accept="image/*"
                                onChange={handleInputChange}
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            />
                            <button
                                type="button"
                                className="w-[250px] border p-2 rounded bg-blue-500 text-white hover:bg-blue-600"
                            >
                                Select Image
                            </button>
                            </div>

                            {/* Image Preview */}
                            {formData.img && (
                            <div className="mt-2 ">
                                <img
                                src={URL.createObjectURL(formData.img)}
                                alt="Preview"
                                className="max-w-xs max-h-40 rounded border"
                                />
                            </div>
                            )}

                            {/* Error */}
                            {formErrors.img && <p className="text-red-600 text-sm mt-1">{formErrors.img}</p>}
                        </div>

                        {/* File Upload */}
                        <div className = "w-[90%]">
                            <label className="block font-medium mb-1">
                                Upload File (pdf, doc, docx, txt, images)</label>

                                <div className="relative">
                                    <input
                                        type="file"
                                        name="filer"
                                        accept=".pdf,.doc,.docx,.txt,image/*"
                                        onChange={handleInputChange}
                                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                    />
                                    <button
                                        type="button"
                                        className="w-[250px] border p-2 rounded bg-green-500 text-white hover:bg-green-600"
                                    >
                                        Select File
                                    </button>
                                </div>

                            {/* Error */}
                            {formData.filer && (
                            <p className="mt-2 text-sm text-gray-700">
                                Selected file: <span className="font-semibold">{formData.filer.name}</span>
                            </p>
                            )}

                            
                             {formErrors.filer && 
                             <p className="text-red-600 text-sm mt-1">{formErrors.filer}</p>}
                            </div>
                        </div>

                        {error && <p className="text-red-700 bg-red-100 p-2 rounded">{error}</p>}

                            <button
                            type="submit"
                            disabled={formLoading || isSubmitDisabled}
                            className={`px-4 py-2 rounded text-white transition-opacity duration-200 ${
                                formLoading || isSubmitDisabled
                                ? 'bg-blue-400 cursor-not-allowed opacity-60'
                                : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                            >
                        {formLoading ? 'Submitting...' : 'Add User'}
                        </button>
                           

                        {formLoading && (
                        <div className="flex items-center gap-2 w-full text-red">
               
                            <span>Submitting...</span>
                        </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}
