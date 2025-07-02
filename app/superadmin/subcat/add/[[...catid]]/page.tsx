//app\superadmin\subcat\add\[[...catid]]\page.tsx
'use client';

import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import Link from 'next/link';
import { useSuperActions } from '@/app/hooks/superadmin/useSuperActions';
import Select from "react-select";
import { APP_API_URL } from '@/lib/config';
type Category = { id: number; name: string };

type FormErrors = 
{
  name?: string;
  catid?: string;
};

type SubCatFormData = 
{
  name: string;
  catid: string;
};

export default function SuperAdminAddSubCatPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const params = useParams() as { catid?: string[] };
    const { user, isInitialLoad} = useSuperActions();
    const [cats, setCats] = useState<Category[]>([]);
    const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
    const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [formData, setFormData] = useState<SubCatFormData>({ name: '', catid: '' });
    const [subcatCheckMessage, setSubcatCheckMessage] = useState('');
    const [subcatExists, setSubcatExists] = useState<boolean | null>(null);
    const [subcatChecking, setSubcatChecking] = useState(false);

    // **FIRST** Set selectedCatId based on params **before** anything else
    useEffect(() => {
        const initialCatId = params?.catid?.[0] ?? searchParams.get('catid') ?? null;
        setSelectedCatId(initialCatId);
        setFormData(prev => ({ ...prev, catid: initialCatId ?? '' })); // Ensure formData gets updated too
        console.log('Initial selectedCatId:', initialCatId); // Debugging log
    }, [params, searchParams]);

    // **THEN** Fetch categories using selectedCatId
    useEffect(() => {

        const fetchCategories = async () => 
        {
            try 
            {
                const res = await api.get(`/api/superadmin/subcat/create/${selectedCatId}`);
                setCats(res.data.cats);
            } 
            catch (err) 
            {
                setError('Failed to load categories.');
            } 
            finally 
            {
                setLoading(false);
            }
        };

        fetchCategories();
    }, [selectedCatId]);


    const checkSubcatAvailability = async (name: string, catid: string) => {
        if (!name.trim() || !catid.trim()) return; // Ensure both values are present

        setSubcatChecking(true);
        setSubcatCheckMessage('');
        try {
            const res = await api.post('/api/superadmin/subcats/check-subcat', { name, catid });

            if (res.data.valid) {
                setSubcatCheckMessage('✅ Name is available.');
                setSubcatExists(false);
                setFormErrors(prev => ({ ...prev, name: undefined })); // Clear errors
            } 
            else 
            {
                setSubcatCheckMessage('❌ ' + res.data.message);
                setSubcatExists(true);
                setFormErrors(prev => ({ ...prev, name: res.data.message || 'Name is taken' }));
            }
        } catch (err) {
            setSubcatCheckMessage('⚠️ Unable to check name availability.');
            setSubcatExists(true);
            setFormErrors(prev => ({ ...prev, name: 'Unavailable title' }));
        } finally {
            setSubcatChecking(false);
        }
    };

    useEffect(() => {
    if (formData.name.trim() && formData.catid.trim()) {
        console.log("🔄 Checking subcategory availability for:", {
        name: formData.name,
        catid: formData.catid
        });
        checkSubcatAvailability(formData.name, formData.catid);
    }
    }, [formData.name, formData.catid]); // ✅ Runs when either `name` or `catid` changes



    /*

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (!value.trim()) {
            setFormErrors(prev => ({
                ...prev,
                [name]: `${name === 'name' ? 'Subcategory name' : 'Category'} cannot be empty`,
            }));
        } 
        else 
        {
            setFormErrors(prev => ({ ...prev, [name]: undefined })); // ✅ Clears error on valid selection
        }

        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'catid') 
        {
            setSelectedCatId(value !== "" ? value : null); // ✅ Correctly resets when blank
        }

        // Check subcategory availability **only when name changes**
        if (name === 'name' && value.trim() && selectedCatId) {
            checkSubcatAvailability(value, selectedCatId);
        }
    };
    */

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
            checkSubcatAvailability(safeValue, selectedCatId);
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

    const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        const errors = validateBeforeSubmit();
        if (Object.keys(errors).length > 0) 
        {
            setFormErrors(errors);
            return;
        }

        setLoading(true);
        try {
            const res = await api.post('/api/superadmin/subcat/addsubcat', formData); // ✅ Store the response

            if (res.status === 200) { // ✅ Now, `res` is defined
                router.push('/superadmin/subcat/view?message=Subcategory+added+successfully');
            }
        } catch (err) {
            setError('Failed to submit the form.');
        }
        finally 
        {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading categories...</div>;
    if (error) return <div className="text-red-500">{error}</div>;


    const categoryOptions = [
        { value: "", label: "Choose a category" }, // ✅ Ensures empty selection
        ...cats.map((cat) => ({
            value: String(cat.id), // ✅ Convert to string to match formData.catid
            label: cat.name,
        })),
    ];


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
                <div className="mt-2 mb-4">
                    <Link href="/superadmin/subcat/view" className="mt-2 mb-4">
                        &rsaquo; View Subcategories
                    </Link>
                </div>
                <h3 className="text-xl font-semibold mb-4">➕ Add New Subcategory</h3>
                <form onSubmit={handleFormSubmit} encType="multipart/form-data" className="space-y-4">
                    { /*}
                    <select
                        name="catid"
                        value={formData.catid}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                    >
                        <option value="">Choose a category</option>
                        {cats.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                    */ }



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


                    {formErrors.catid && <p className="text-red-600 text-sm">{formErrors.catid}</p>}
   
                    {selectedCatId && (
                        <>
                            {/* Subcategory Name Input */}
                            <input
                                name="name"
                                type="text"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Subcategory Name"
                                className="w-full p-2 border rounded"
                            />

                            {formErrors.name && <p className="text-red-600 text-sm">{formErrors.name}</p>}

                            {error && <p className="text-red-700 bg-red-100 p-2 rounded">{error}</p>}

                            <button type="submit"
                                disabled={loading || isSubmitDisabled}
                                className={`px-4 py-2 rounded text-white transition-opacity duration-200 ${
                                    loading || isSubmitDisabled
                                        ? 'bg-blue-400 cursor-not-allowed opacity-60'
                                        : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                            >
                                {loading ? 'Submitting...' : 'Add Subcategory'}
                            </button>
                        </>
                    )}


                    {loading && (
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



