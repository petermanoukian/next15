'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import Link from 'next/link';
import Select from "react-select";
import { APP_API_URL } from '@/lib/config';

type FormErrors = {
  name?: string;
  catid?: string;
};

type SubcatType = {
  id: number;  
  catid: number;   
  name: string;
};

type Category = {
  id: number;    
  name: string;
};

type SubcatFormData = {
  name: string;
  catid: string;
};

export default function EditSubCatPage() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cats, setCats] = useState<Category[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [subcatChecking, setSubcatChecking] = useState(false);


  // userr = the user being edited (not the logged-in user)
  const [subcat, setSubcat] = useState<SubcatType | null>(null);

  useEffect(() => {
    const fetchSubCat = async () => {
      try {
        const res = await api.get(`/api/superadmin/subcat/edit/${id}`);
        setSubcat(res.data.subcat);
        setCats(res.data.cats);
        setSelectedCatId(res.data.subcat.catid);
        setError(null);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load record:', err);
        setError('Failed to load record');
      } finally {
        setLoading(false);
      }
    };

    fetchSubCat();
  }, [id]);

    const [formData, setFormData] = useState<SubcatFormData>({
    name: '',
    catid: '',
    });

    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
    const [subcatExists, setSubcatExists] = useState<boolean | null>(null);
    const [formLoading, setFormLoading] = useState(false);
    useEffect(() => {
    if (subcat) {
        setFormData({
        name: subcat.name || '',
        catid: subcat.catid?.toString(),
        });
        }   
    }, [subcat]);

    const checkNameEditAvailability = async (name: string) => {
        setSubcatChecking(true);


        try {
            const res = await api.post('/api/superadmin/subcats/check-subcat-edit', {
            name,
            id: id, 
            catid: selectedCatId,
            });

            if (res.data.valid) {
            setFormErrors(prev => ({ ...prev, name: undefined }));
            setSubcatExists(false);

            } 
            else 
            {
                setFormErrors(prev => ({ ...prev, name: res.data.message || 'name is taken' }));
                setSubcatExists(true);
            }
        } 
        catch (err) 
        {

            setFormErrors(prev => ({ ...prev, name: ' check failed' }));
            setSubcatExists(true);       
        } 
        finally {
            setSubcatChecking(false);
        }
    };


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => 
    {
        const { name, value } = e.target;
        const safeValue = typeof value === "string" ? value : String(value); // Ensure it's always a string
        setFormData(prev => ({ ...prev, [name]: safeValue }));
        if (!safeValue.trim()) {
            setFormErrors(prev => ({
                ...prev,
                [name]: `${name === "name" ? "Subcategory name" : "Category"} cannot be empty`,
            }));
        } 
        else 
        {
            setFormErrors(prev => ({ ...prev, [name]: undefined })); 
        }

        if (name === "catid") {
            setSelectedCatId(safeValue !== "" ? safeValue : null);
        }

        if (name === "name" && safeValue.trim() && selectedCatId) 
        {
            checkNameEditAvailability(safeValue);
        }
    };

    const validateBeforeSubmit = (): FormErrors => {
        const errors: FormErrors = {};
        if (!formData.name.trim()) 
        {
            errors.name = 'Name is required';
        }
        if (!formData.catid.trim()) {
            errors.catid = 'Please select a category.';
        }

        if (subcatExists) {
            errors.name = 'Subcategory already exists';
        }
        return errors;
    };


    useEffect(() => {
            const hasErrors = Object.values(formErrors).some(Boolean);
            setIsSubmitDisabled(hasErrors || subcatChecking); // optionally disable while checking email
    }, [formErrors, subcatChecking]);


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
            formPayload.append('catid', formData.catid);
            formPayload.append('_method', 'PUT'); 
                await api.post(`/api/superadmin/subcat/update/${id}`, formPayload, {
            });

            router.push('/superadmin/subcat/view');
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
    console.log(' catChecking ', subcatChecking);
    setIsSubmitDisabled(hasErrors || subcatChecking);
  }, [formErrors, subcatChecking]);


    const categoryOptions = [
        { value: "", label: "Choose a category" }, // ✅ Ensures empty selection
        ...cats.map((cat) => ({
            value: String(cat.id), // ✅ Convert to string to match formData.catid
            label: cat.name,
        })),
    ];

    useEffect(() => {
     if (selectedCatId !== null) {
        console.log("🔄 Checking subcategory name availability for categoryid:", selectedCatId);
        checkNameEditAvailability(formData.name); // ✅ Triggers when category changes
    }
    }, [selectedCatId, formData.name]);// ✅ Runs when category or name changes


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-700">
        Loading ...
      </div>
    );
  }

  if (error || ! subcat) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error || 'subcategory not found'}
      </div>
    );
  }

  return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-5xl mx-auto space-y-8">
              <div className="bg-white p-6 rounded shadow">
              <h1 className="text-2xl font-bold mb-4">Edit  {subcat.name}</h1>
              <Link href="/superadmin/subcat/view" className="text-blue-500 underline">
                ← Back to SubCategories
              </Link>

              <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
                {/* Name */}

                    <Select
                        name="catid"
                        value={categoryOptions.find(option => option.value === String(formData.catid)) || null} // ✅ Match the value properly
                        onChange={(selectedOption) => {
                            handleInputChange({
                                target: { name: "catid", value: selectedOption?.value || "" } 
                            } as React.ChangeEvent<HTMLSelectElement>);
                        }}
                        options={categoryOptions}
                        isSearchable={true} // ✅ Enables search functionality
                        className="w-full"
                        placeholder="Choose a category"
                    />




                <div>
                  <label className="block font-medium">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full border rounded p-2 mt-1"
                  />
                  {subcatChecking && <p className="text-gray-500 text-sm">Checking …</p>}
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




