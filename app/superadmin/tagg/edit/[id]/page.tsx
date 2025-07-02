//app\superadmin\tagg\edit\[id]\page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import Link from 'next/link';
import { APP_APi_URL } from '@/lib/config';

type FormErrors = {
  name?: string;

};

type TaggType = {
  id: number;    
  name: string;
};

type TaggFormData = {
  name: string;
};

export default function EditTaggPage() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [taggChecking, setTaggChecking] = useState(false);


  // userr = the user being edited (not the logged-in user)
  const [tagg, setTagg] = useState<TaggType | null>(null);

  useEffect(() => {
    const fetchTagg = async () => {
      try {
        const res = await api.get(`/api/superadmin/tagg/edit/${id}`);
        setTagg(res.data.tagg);
      } catch (err) {
        console.error('Failed to load record:', err);
        setError('Failed to load record');
      } finally {
        setLoading(false);
      }
    };

    fetchTagg();
  }, [id]);

    const [formData, setFormData] = useState<TaggFormData>({
    name: '',

    });

    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
    const [taggExists, setTaggExists] = useState<boolean | null>(null);
    const [formLoading, setFormLoading] = useState(false);
    useEffect(() => {
    if (tagg) {
        setFormData({
        name: tagg.name || '',

        });
    }
    }, [tagg]);

    const checkNameEditAvailability = async (name: string) => {
        setTaggChecking(true);


        try 
        {
            const res = await api.post('/api/superadmin/taggs/check-edit', {
            name,
            id: id, // from useParams()
            });
            if (res.data.valid) 
            {
                setFormErrors(prev => ({ ...prev, name: undefined }));
                setTaggExists(false);
            } 
            else 
            {
                setFormErrors(prev => ({ ...prev, name: res.data.message || 'name is taken' }));
                setTaggExists(true);
            }
        } 
        catch (err) 
        {

            setFormErrors(prev => ({ ...prev, name: ' check failed' }));
            setTaggExists(true);
        } 
        finally {
            setTaggChecking(false);
        }
    };


    const validateBeforeSubmit = async (): Promise<FormErrors> => {
      const errors: FormErrors = {};
      if (!formData.name.trim()) 
      {
          errors.name = 'Name is required';
      }
      else if (taggExists) 
      {
          errors.name = 'Tag already in use or has not been validated';
      }
      return errors;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: value }));
        setFormErrors(prev => ({ ...prev, [name]: undefined }));

        if (name === 'name') 
        {
          if (!value.trim()) 
          {
            setFormErrors(prev => ({ ...prev, name: 'Name is required' }));
          } 
          
          else 
          {
            setFormErrors(prev => ({ ...prev, name: undefined }));
          }
        }

        if (name === 'name') 
        {
          setTaggExists(null); 
          checkNameEditAvailability(value); 
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

            formPayload.append('_method', 'PUT'); 
                await api.post(`/api/superadmin/tagg/update/${id}`, formPayload, {
            });

            router.push('/superadmin/tagg/view');
        } 
        catch (err: any) 
        {
                console.error('Update failed:', err);
                setError('Failed to update user. Please try again.');
                setIsSubmitDisabled(false);
        } 
        finally 
        {
            setFormLoading(false);
        }
   };

  useEffect(() => {
    const hasErrors = Object.values(formErrors).some(Boolean);
    console.log(' formErrors ', formErrors);
    console.log(' taggChecking ', taggChecking);
    setIsSubmitDisabled(hasErrors || taggChecking);
  }, [formErrors, taggChecking]);




  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-700">
        Loading ...
      </div>
    );
  }

  if (error || ! tagg) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error || 'category not found'}
      </div>
    );
  }

  return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-5xl mx-auto space-y-8">
              <div className="bg-white p-6 rounded shadow">
              <h1 className="text-2xl font-bold mb-4">Edit  {tagg.name}</h1>
              <Link href="/superadmin/tagg/view" className="text-blue-500 underline">
                ← Back to Tags
              </Link>

              <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
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
                  {taggChecking && <p className="text-gray-500 text-sm">Checking …</p>}
                  {formErrors.name && <p className="text-red-500 text-sm">{formErrors.name}</p>}
                </div>

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


