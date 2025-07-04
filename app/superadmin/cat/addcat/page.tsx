'use client';
//app\superadmin\cat\addcat\page.tsx
import { useRouter } from 'next/navigation';
//import { useAuth } from '@/lib/AuthContext';
import { useEffect, useState } from 'react';
//import { auth } from '@/lib/auth';
import api from '@/lib/axios';
//import type { User } from '@/lib/auth';
import { useSuperActions } from '@/app/hooks/superadmin/useSuperActions';
import Link from 'next/link';


type FormErrors = {
  name?: string;
};

type UserFormData = {
  name: string;
};


export default function SuperAdminAddCatPage() {

  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { user, isInitialLoad} = useSuperActions();
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);

  const [formData, setFormData] = useState<UserFormData>({
        name: '',
  });

  const [formLoading, setFormLoading] = useState(false);
  const [catCheckMessage, setCatCheckMessage] = useState('');
  const [catExists, setCatExists] = useState<boolean | null>(null);
  const [catChecking, setCatChecking] = useState(false);

  const checkCatAvailability = async (name: string) => {
      setCatChecking(true);
      setCatCheckMessage('');
      try {
          const res = await api.post('/api/superadmin/cats/check-cat', { name });
          if (res.data.valid) {
              setCatCheckMessage('✅ Name is available.');
              setCatExists(false);
              setFormErrors(prev => ({ ...prev, name: undefined })); // Clear errors
          } else {
              setCatCheckMessage('');
              setCatExists(true);
              setFormErrors(prev => ({ ...prev, name: res.data.message || 'Name is taken' }));
          }
      } catch (err) {
          setCatCheckMessage('⚠️ Unable to check name availability.');
          setCatExists(true);
          setFormErrors(prev => ({ ...prev, name: 'Unavailable title' }));
      } finally {
          setCatChecking(false);
      }
  }; 



  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (!value.trim()) {
        setFormErrors(prev => ({ ...prev, name: 'Name cannot be empty' }));
        return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
    setFormErrors(prev => ({ ...prev, name: undefined }));
    checkCatAvailability(value);
  };

  const validateBeforeSubmit = () => {
      const errors: FormErrors = {};

      // Check if name is empty
      if (!formData.name.trim()) {
          errors.name = 'Name is required';
      }

      // Check if name is already taken
      if (catExists) {
          errors.name = 'Name is already in use';
      }

      return errors;
  };


  useEffect(() => {
        const hasErrors = Object.values(formErrors).some(Boolean);
        setIsSubmitDisabled(hasErrors || catChecking); // optionally disable while checking email
  }, [formErrors, catChecking]);


const handleFormSubmit = async (e) => {
        e.preventDefault();
        
        //setFormErrors({});

        const errors = validateBeforeSubmit();
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        setFormLoading(true);
        const payload = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
            payload.append(key, value);
        }
        });


        try {
            //await api.get('/sanctum/csrf-cookie');
            const res = await api.post('/api/superadmin/cat/addcat', payload, {
               
            });

            router.push('/superadmin/cat/viewcats?message=Record+created+successfully');
           
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
                        <Link href = '/superadmin/cat/viewcats' className='mt-2 mb-4'> &rsaquo; 
                        View Catgories </Link>
                    </div>
                    <h3 className="text-xl font-semibold mb-4">➕ Add New Category</h3>

                    <form onSubmit={handleFormSubmit} encType="multipart/form-data" className="space-y-4">
                        <input name="name" type="text" value={formData.name} onChange={handleInputChange} 
                        placeholder="Name" className="w-full p-2 border rounded" />
                        {formErrors.name && <p className="text-red-600 text-sm">{formErrors.name}</p>}



                        {catChecking && <p className="text-blue-600 text-sm">Checking...</p>}
                        {catCheckMessage && <p className="text-sm">{catCheckMessage}</p>}
                     

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
                        {formLoading ? 'Submitting...' : 'Add'}
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








