//app\superadmin\user\edit\[id]\page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import Link from 'next/link';
import { APP_APi_URL } from '@/lib/config';

type UserrData = {
  id: number; // ✅ Add the ID field
  name: string;
  email: string;
  password: string;
  is_admin: string;
  img: File | null;
  filer: File | null;
};


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

export default function EditUserPage() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  //const [emailCheckMessage, setEmailCheckMessage] = useState('');
  
  const [emailChecking, setEmailChecking] = useState(false);


  // userr = the user being edited (not the logged-in user)
  const [userr, setUserr] = useState<UserrData | null>(null);


  useEffect(() => {
    const fetchUserr = async () => {
      try {
        const res = await api.get(`/api/superadmin/user/edit/${id}`);
        setUserr(res.data.userr);
      } catch (err) {
        console.error('Failed to load user:', err);
        setError('Failed to load user');
      } finally {
        setLoading(false);
      }
    };

    fetchUserr();
  }, [id]);

    const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    is_admin: 'orduser',
    img: null,
    filer: null,
    });

    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
    const [emailExists, setEmailExists] = useState<boolean | null>(null);
    const [formLoading, setFormLoading] = useState(false);
    useEffect(() => {
    if (userr) {
        setFormData({
        name: userr.name || '',
        email: userr.email || '',
        password: '',
        is_admin: userr.is_admin || 'orduser',
        img: null,
        filer: null,
        });
    }
    }, [userr]);

    const checkEmailEditAvailability = async (email: string) => {
        setEmailChecking(true);
        //setEmailCheckMessage('');

        try {
            const res = await api.post('/api/superadmin/users/check-email-edit', {
            email,
            user_id: id,
            });

            if (res.data.valid) {
            setFormErrors(prev => ({ ...prev, email: undefined }));
            setEmailExists(false);

            } else {
            setFormErrors(prev => ({ ...prev, email: res.data.message || 'Email is taken' }));
            setEmailExists(true);

            }
        } catch (err) {
            setFormErrors(prev => ({ ...prev, email: 'Email check failed' }));
            setEmailExists(true);       
        } 
        finally {
            setEmailChecking(false);
        }
    };


   const validateBeforeSubmit = async (): Promise<FormErrors> => {
      const errors: FormErrors = {};

      const allowedImgTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
          const allowedFileTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
            ...allowedImgTypes,
          ];
          const MAX_IMAGE_SIZE_MB = 9;
          const MAX_FILE_SIZE_MB = 9;

          if (!formData.name.trim()) {
            errors.name = 'Name is required';
          }

          if (!formData.email.trim()) {
            errors.email = 'Email is required';
          } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'Email is invalid';
          } 
          else if (emailExists) {
            errors.email = 'Email is already in use or has not been validated';
          }

          

          if (formData.password && formData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
          }

          if (formData.img) {
            if (!allowedImgTypes.includes(formData.img.type)) {
              errors.img = 'Invalid image type';
            } else if (formData.img.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
              errors.img = `Image must be less than ${MAX_IMAGE_SIZE_MB}MB`;
            }
          }

          if (formData.filer) {
            if (!allowedFileTypes.includes(formData.filer.type)) {
              errors.filer = 'Invalid file type';
            } else if (formData.filer.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
              errors.filer = `File must be less than ${MAX_FILE_SIZE_MB}MB`;
            }
          }

          return errors;
      };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, files } = e.target as HTMLInputElement;

        const MAX_IMAGE_SIZE_MB = 9;
        const MAX_FILE_SIZE_MB = 9;
        const allowedImgTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
        const allowedFileTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
            ...allowedImgTypes, // because `filer` can also be images
        ];

        if (files && files[0]) {
            const file = files[0];

            if (name === 'img') {
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

        // Text/select input updates
        setFormData(prev => ({ ...prev, [name]: value }));
        setFormErrors(prev => ({ ...prev, [name]: undefined }));

        if (name === 'name') {
          if (!value.trim()) {
            setFormErrors(prev => ({ ...prev, name: 'Name is required' }));
          } else {
            setFormErrors(prev => ({ ...prev, name: undefined }));
          }
        }

        if (name === 'password') {
          if (value && value.length < 6) {
            setFormErrors(prev => ({ ...prev, password: 'Password must be at least 6 characters' }));
          } else {
            setFormErrors(prev => ({ ...prev, password: undefined }));
          }
        }


        if (name === 'email') {
          setEmailExists(null); // reset previous state
          checkEmailEditAvailability(value); // async email check
        }

        if (name !== 'name' && name !== 'password' && name !== 'email') {
          setFormErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitDisabled(true);
    setFormLoading(true);
    setFormErrors({});

    const errors = await validateBeforeSubmit(); // important: await here
    if (Object.keys(errors).length > 0) 
    {
        setFormErrors(errors);
        setFormLoading(false);
        console.log('errors line 256 ' , errors)
        //setIsSubmitDisabled(true);
        return;
    }

    try {
      const formPayload = new FormData();
      formPayload.append('name', formData.name);
      formPayload.append('email', formData.email);
      formPayload.append('password', formData.password);
      formPayload.append('is_admin', formData.is_admin);
      if (formData.img) formPayload.append('img', formData.img);
      if (formData.filer) formPayload.append('filer', formData.filer);

      formPayload.append('_method', 'PUT'); 
      await api.post(`/api/superadmin/user/update/${id}`, formPayload, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
      });

      router.push('/superadmin/user/view');
    } catch (err: any) {
      console.error('Update failed:', err);
      setError('Failed to update user. Please try again.');
      setIsSubmitDisabled(false);
    } finally {
      setFormLoading(false);
    }
  };

  useEffect(() => {
    const hasErrors = Object.values(formErrors).some(Boolean);
    setIsSubmitDisabled(hasErrors || emailChecking);
  }, [formErrors, emailChecking]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-700">
        Loading user info...
      </div>
    );
  }

  if (error || !userr) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error || 'User not found'}
      </div>
    );
  }

  return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-5xl mx-auto space-y-8">
            <div className="bg-white p-6 rounded shadow">
              <h1 className="text-2xl font-bold mb-4">Edit User: {userr.name}</h1>

              <Link href="/superadmin/user/view" className="text-blue-500 underline">
                ← Back to User List
              </Link>

            <form className="mt-4 space-y-4" onSubmit={handleSubmit} encType="multipart/form-data">
                {/* Name */}
                <div>
                  <label className="block font-medium">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full border rounded p-2 mt-1"
                  />
                  {formErrors.name && <p className="text-red-500 text-sm">{formErrors.name}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block font-medium">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full border rounded p-2 mt-1"
                  />
                  {emailChecking && <p className="text-gray-500 text-sm">Checking email…</p>}
                
                  {formErrors.email && <p className="text-red-500 text-sm">{formErrors.email}</p>}
                </div>

                {/* Password */}
                <div>
                  <label className="block font-medium">Password (leave blank to keep unchanged)</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full border rounded p-2 mt-1"
                  />
                  {formErrors.password && <p className="text-red-500 text-sm">{formErrors.password}</p>}
                </div>

                {/* Role */}
                <div>
                  <label className="block font-medium">User Role</label>
                  <select
                    name="is_admin"
                    value={formData.is_admin}
                    onChange={handleInputChange}
                    className="w-full border rounded p-2 mt-1"
                  >
                    <option value="superadmin">Super Admin</option>
                    <option value="admin">Admin</option>
                    <option value="orduser">Ordinary User</option>
                    
                  </select>
                </div>

                {/* Profile Image */}
                <div>
                  <label className="block font-medium">Profile Image (optional)</label>
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


                
                    {!formData.img && userr?.img && (
                      <div className="mt-2">
                        <img
                          src={`${APP_APi_URL}/${userr.img}`}
                          alt="Existing Profile"
                          className="max-w-xs max-h-40 rounded border"
                        />
                        <p className="text-sm text-gray-500 mt-1">Existing image shown above</p>
                      </div>
                    )}

                  {formData.img && (
                  <div className="mt-2 ">
                      <img
                      src={URL.createObjectURL(formData.img)}
                      alt="Preview"
                      className="max-w-xs max-h-40 rounded border"
                      />
                  </div>
                  )}

                  {formErrors.img && <p className="text-red-500 text-sm">{formErrors.img}</p>}
                </div>

                {/* File Upload */}
                <div>
                  <label className="block font-medium">Optional File Upload
                    (pdf, doc, docx, txt, images)
                  </label>
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

                  {formData.filer && (
                    <p className="mt-2 text-sm text-gray-700">
                      Selected file: <span className="font-semibold">{formData.filer.name}</span>
                    </p>
                  )}

                {!formData.filer && userr?.filer && (
                  <p className="mt-2 text-sm text-gray-500">
                    Existing file:{" "}
                    <a
                      href={`${APP_APi_URL}/${userr.filer}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-blue-600 hover:underline"
                    >
                      {userr.filer.split('/').pop()}
                    </a>
                  </p>
                )}

                  {formErrors.filer && <p className="text-red-500 text-sm">{formErrors.filer}</p>}
                </div>

                {/* Submit */}
                <button
                type="submit"
                disabled={formLoading || isSubmitDisabled}
                className={`px-4 py-2 rounded text-white transition-opacity duration-200 ${
                    formLoading || isSubmitDisabled
                    ? 'bg-blue-400 cursor-not-allowed opacity-60'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
                >
                {formLoading ? 'Submitting...' : 'Update'}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
}




