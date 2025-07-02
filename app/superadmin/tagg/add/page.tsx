'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { useSuperActions } from '@/app/hooks/superadmin/useSuperActions';
import Link from 'next/link';


type FormErrors = {
  name?: string;
};

type TaggFormData = {
  name: string;
};


export default function SuperAdminAddTagPage() {

  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { user, isInitialLoad} = useSuperActions();
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);

  const [formData, setFormData] = useState<UserFormData>({
        name: '',
  });

  const [formLoading, setFormLoading] = useState(false);
  const [checkMessage, setCheckMessage] = useState('');
  const [taggExists, setTaggExists] = useState<boolean | null>(null);
  const [taggChecking, setTaggChecking] = useState(false);

  const checkTaggAvailability = async (name: string) => {
      setTaggChecking(true);
      setCheckMessage('');
      try {
          const res = await api.post('/api/superadmin/taggs/check', { name });
          if (res.data.valid) {
              setCheckMessage('✅ Name is available.');
              setTaggExists(false);
              setFormErrors(prev => ({ ...prev, name: undefined })); // Clear errors
          } else {
              setCheckMessage('');
              setTaggExists(true);
              setFormErrors(prev => ({ ...prev, name: res.data.message || 'Name is taken' }));
          }
      } catch (err) {
          setCheckMessage('⚠️ Unable to check name availability.');
          setTaggExists(true);
          setFormErrors(prev => ({ ...prev, name: 'Unavailable title' }));
      } finally {
          setTaggChecking(false);
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
    checkTaggAvailability(value);
  };

  const validateBeforeSubmit = () => {
      const errors: FormErrors = {};

      // Check if name is empty
      if (!formData.name.trim()) {
          errors.name = 'Name is required';
      }

      // Check if name is already taken
      if (taggExists) {
          errors.name = 'Name is already in use';
      }

      return errors;
  };


    useEffect(() => {
            const hasErrors = Object.values(formErrors).some(Boolean);
            setIsSubmitDisabled(hasErrors || taggChecking); // optionally disable while checking email
    }, [formErrors, taggChecking]);


    const handleFormSubmit = async (e) => {
        e.preventDefault();
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
            await api.get('/sanctum/csrf-cookie');
            const res = await api.post('/api/superadmin/tagg/add', payload, {      
            });
            router.push('/superadmin/tagg/view?message=Record+created+successfully');
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
                        <Link href = '/superadmin/tagg/view' className='mt-2 mb-4'> &rsaquo; 
                        View Tags </Link>
                    </div>
                    <h3 className="text-xl font-semibold mb-4">➕ Add New Tag</h3>
                    <form onSubmit={handleFormSubmit} encType="multipart/form-data" className="space-y-4">
                        <input name="name" type="text" value={formData.name} onChange={handleInputChange} 
                        placeholder="Name" className="w-full p-2 border rounded" />
                        {formErrors.name && <p className="text-red-600 text-sm">{formErrors.name}</p>}
                        {taggChecking && <p className="text-blue-600 text-sm">Checking...</p>}
                        {checkMessage && <p className="text-sm">{checkMessage}</p>}
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
