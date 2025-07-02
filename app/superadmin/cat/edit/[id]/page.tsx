'use client';
//app\superadmin\cat\edit\[id]\page.tsx
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import Link from 'next/link';
import { APP_API_URL } from '@/lib/config';

type FormErrors = {
  name?: string;

};

type CatType = {
  id: number;    
  name: string;
};

type CatFormData = {
  name: string;
};

export default function EditCatPage() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [catChecking, setCatChecking] = useState(false);


  // userr = the user being edited (not the logged-in user)
  const [cat, setCat] = useState<CatType | null>(null);

  useEffect(() => {
    const fetchCat = async () => {
      try {
        const res = await api.get(`/api/superadmin/cat/edit/${id}`);
        setCat(res.data.cat);
      } catch (err) {
        console.error('Failed to load record:', err);
        setError('Failed to load record');
      } finally {
        setLoading(false);
      }
    };

    fetchCat();
  }, [id]);

    const [formData, setFormData] = useState<CatFormData>({
    name: '',

    });

    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
    const [catExists, setCatExists] = useState<boolean | null>(null);
    const [formLoading, setFormLoading] = useState(false);
    useEffect(() => {
    if (cat) {
        setFormData({
        name: cat.name || '',

        });
    }
    }, [cat]);

    const checkNameEditAvailability = async (name: string) => {
        setCatChecking(true);


        try {
            const res = await api.post('/api/superadmin/cats/check-cat-edit', {
            name,
            id: id, // from useParams()
            });

            if (res.data.valid) {
            setFormErrors(prev => ({ ...prev, name: undefined }));
            setCatExists(false);

            } 
            else 
            {
                setFormErrors(prev => ({ ...prev, name: res.data.message || 'name is taken' }));
                setCatExists(true);
            }
        } 
        catch (err) 
        {

            setFormErrors(prev => ({ ...prev, name: ' check failed' }));
            setCatExists(true);       
        } 
        finally {
            setCatChecking(false);
        }
    };


    const validateBeforeSubmit = async (): Promise<FormErrors> => {
      const errors: FormErrors = {};
      if (!formData.name.trim()) 
      {
          errors.name = 'Name is required';
      }
      else if (catExists) 
      {
          errors.name = 'Category already in use or has not been validated';
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
          setCatExists(null); 
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
                await api.post(`/api/superadmin/cat/update/${id}`, formPayload, {
            });

            router.push('/superadmin/cat/viewcats');
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
    console.log(' catChecking ', catChecking);
    setIsSubmitDisabled(hasErrors || catChecking);
  }, [formErrors, catChecking]);




  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-700">
        Loading ...
      </div>
    );
  }

  if (error || ! cat) {
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
              <h1 className="text-2xl font-bold mb-4">Edit  {cat.name}</h1>
              <Link href="/superadmin/cat/viewcats" className="text-blue-500 underline">
                ← Back to Categories
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
                  {catChecking && <p className="text-gray-500 text-sm">Checking …</p>}
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



