'use client';

import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { useEffect, useState , useRef , useMemo } from 'react';
import api from '@/lib/axios';
import Link from 'next/link';
import { useSuperActions } from '@/app/hooks/superadmin/useSuperActions';
import Select from "react-select";
import Image from 'next/image';
import { debounce } from 'lodash';
import { APP_API_URL } from '@/lib/config';

type Category = { id: number; name: string };
type Subcategory = { id: number; name: string; catid: string }

type Taggtype = {
  id: number;    
  name: string;
};

type FormErrors = 
{
    name?: string;
    catid?: string;
    subcatid?: string;
    prix?: string | number;
    des?: string;
    dess?: string;
    img?: string | null;
    filer?: string | null;
    vis?: string;
};

type ProdFormData = 
{
    name: string;
    catid: string;
    subcatid: string;
    prix: string | number;
    des: string;
    dess: string;
    img: File | null;
    filer: File | null;
    vis: string;
    tagg_ids: string[]; 
};


export default function SuperAdminProdPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, isInitialLoad} = useSuperActions();
    const [cats, setCats] = useState<Category[]>([]);
    const [subcats, setSubcats] = useState<Subcategory[]>([]);
    const [selectedSubcatId, setSelectedSubcatId] = useState<string | null>(null);
    const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
    const [isSubmitDisabled, setIsSubmitDisabled] = useState(false); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [formErrors, setFormErrors] = useState<FormErrors>({} as FormErrors);

    const [selectedTaggId, setSelectedTaggId] = useState<string | null>(null);
    //const [availableTaggs, setAvailableTaggs] = useState<any[]>([]);
    const [availableTaggs, setAvailableTaggs] = useState<Taggtype[]>([]);
    const [selectedTaggIds, setSelectedTaggIds] = useState<string[]>([]);

    const [formData, setFormData] = useState<ProdFormData>(
        { name: '', 
        catid: selectedCatId ?? "",
        subcatid: selectedSubcatId ?? "",
        prix: 0, des: '', dess: '', img: null, filer: null, vis: 'yes' ,
          tagg_ids: selectedTaggId ? [selectedTaggId] : []
        });

    const [prodCheckMessage, setProdCheckMessage] = useState('');
    const [prodExists, setProdExists] = useState<boolean | null>(null);
    const [prodChecking, setProdChecking] = useState(false);
    const params = useParams() as { catid?: string[]; subcatid?: string[] };
    //const hasFetchedOnce = useRef(false);
 
    /*
    useEffect(() => {
        const initialCatId = params?.params?.[0] ?? searchParams.get('catid') ?? null;
        const initialSubcatId = params?.params?.[1] ?? searchParams.get('subcatid') ?? null;

        setSelectedCatId(initialCatId);
        setSelectedSubcatId(initialSubcatId);

        setFormData(prev => ({
            ...prev,
            catid: initialCatId ?? '',
            subcatid: initialSubcatId ?? '',
            }
            )
        );
 
        const fetchSubsAndCats = async () => {
            try {
            const categorySegment = initialCatId ? `/${initialCatId}` : ""; 
            const subcategorySegment = initialSubcatId ? `/${initialSubcatId}` : ""; 

            const res = await api.get(`/api/superadmin/prod/create${categorySegment}${subcategorySegment}`);
            setCats(res.data.cats);
            setSubcats(res.data.subcats);
            } catch (err) {
            setError('Failed to load categories and subcategories.');
            } finally {
            setLoading(false);
            }
        };

        fetchSubsAndCats();
    }, [params, searchParams]);

        */

    useEffect(() => {
        const initialCatId = params?.params?.[0] ?? searchParams.get('catid') ?? null;
        const initialSubcatId = params?.params?.[1] ?? searchParams.get('subcatid') ?? null;

        const initialTaggId = searchParams.get('taggid') ?? null;
        console.log("Line 121 Initial TaggId:", initialTaggId);

        setSelectedCatId(initialCatId);
        setSelectedSubcatId(initialSubcatId);

        setFormData(prev => ({
            ...prev,
            catid: initialCatId ?? '',
            subcatid: initialSubcatId ?? '',
            }
            )
        );
 
        const fetchSubsAndCats = async () => {
            try 
            {
                const categorySegment = initialCatId ? `/${initialCatId}` : ""; 
                const subcategorySegment = initialSubcatId ? `/${initialSubcatId}` : ""; 
                const querySegment = initialTaggId ? `?taggid=${initialTaggId}` : "";
                //const res = await api.get(`/api/superadmin/prod/create${categorySegment}${subcategorySegment}`);
                const res = await api.get(`/api/superadmin/prod/create${categorySegment}${subcategorySegment}${querySegment}`);
                setCats(res.data.cats);
                setSubcats(res.data.subcats);
                console.log("Line 146 Initial TaggId:", initialTaggId);
                console.log("Line 146 Response Data:", res.data.selected_taggid);
                if (res.data.taggs) 
                {
                    setAvailableTaggs(res.data.taggs);
                    if (res.data.selected_taggid) 
                    {
                        setSelectedTaggId(res.data.selected_taggid);
                        setSelectedTaggIds([res.data.selected_taggid]);

                        setFormData(prev => ({
                        ...prev,
                        tagg_ids: [res.data.selected_taggid],
                        }));
                    }
                } 
            }
            catch (err) 
            {
                setError('Failed to load categories and subcategories.');
            } 
            finally 
            {
                setLoading(false);
            }
        };

        fetchSubsAndCats();
    }, [params, searchParams]);


    const checkProdAvailability = async (name: string, catid: string , subcatid: string) => {
        if (!name.trim() || !catid.trim()  || !subcatid.trim()) return; // Ensure both values are present

        setProdChecking(true);
        setProdCheckMessage('');
        try {
            const res = await api.post('/api/superadmin/prods/check', { name, catid , subcatid});

            if (res.data.valid) {
                setProdCheckMessage('✅ Name is available.');
                setProdExists(false);
                setFormErrors(prev => ({ ...prev, name: undefined })); // Clear errors
            } 
            else 
            {
                setProdCheckMessage('');
                setProdExists(true);
                setFormErrors(prev => ({ ...prev, name: res.data.message || 'Name is taken' }));
            }
        } catch (err) {
            setProdCheckMessage('⚠️ Unable to check name availability.');
            setProdExists(true);
            setFormErrors(prev => ({ ...prev, name: 'Unavailable title' }));
        } finally {
            setProdChecking(false);
        }
    };

    const debouncedCheckAvailability = useMemo(() => 
        debounce((name, catid, subcatid) => {
            checkProdAvailability(name, catid, subcatid);
        }, 1000), 
    [], []);

    useEffect(() => {
        if (formData.name.trim().length < 2) return;
        if (formData.name.trim().length < 2) return; // ✅ Ensure at least 2 characters before checking
        if (!formData.catid.trim() || !formData.subcatid.trim()) return;

        console.log("🔄 Debounced availability check for:", {
            name: formData.name,
            catid: formData.catid,
            subcatid: formData.subcatid
        });

        debouncedCheckAvailability(formData.name, formData.catid, formData.subcatid); // ✅ Call debounce function here
    }, [formData.name, formData.catid, formData.subcatid]);



    const MAX_IMAGE_SIZE_MB = 9;
    const MAX_FILE_SIZE_MB = 9;


    const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, files } = e.target;
        const safeValue = typeof value === "string" ? value : String(value); // Ensure it's always a string

        setFormData(prev => ({ ...prev, [name]: safeValue }));

        if (!safeValue.trim()) {
            setFormErrors(prev => ({
                ...prev,
                [name]: `${name === "name" ? "Subcategory name" : "Category"} cannot be empty`,
            }));
        } else {
            setFormErrors(prev => ({ ...prev, [name]: undefined }));
        }

        if (name === "catid") {
            const newCatId = safeValue !== "" ? safeValue : null;
            setSelectedCatId(newCatId);
            setSelectedSubcatId(null);
            setFormData(prev => ({ ...prev, subcatid: '' }));

            if (newCatId) {
            try {
                setLoading(true);
                const res = await api.get(`/api/superadmin/prod/getsybcatbycatidforc/${newCatId}`);
                setSubcats(res.data.subcats || []);
                console.log('✅ Subcategories loaded from Laravel for catid:', newCatId);
            } catch (err) {
                console.error('❌ Error loading subcategories:', err);
                setError('Failed to load subcategories from Laravel.');
            } finally {
                setLoading(false);
            }
            } else {
            setSubcats([]);
            }
        }


        if (name === "subcatid") {
            setSelectedSubcatId(safeValue !== "" ? safeValue : null);
        }

        if (
            name === "name" &&
            safeValue.trim().length >= 2 &&
            selectedCatId &&
            selectedSubcatId
            ) {
            checkProdAvailability(safeValue, selectedCatId, selectedSubcatId);
        }

        if (name === 'tagg_ids') {
            setFormData(prev => ({
                ...prev,
                tagg_ids: Array.isArray(value) ? value : [],
            }));
            return;
        }


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
                    'application/pdf', 'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'text/plain', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
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
    };


    const validateBeforeSubmit = (): FormErrors => {
        const errors: FormErrors = {};
        //const errors: FormErrors = { ...formErrors }; 
        if (!formData.name.trim()) 
        {
            errors.name = 'Name is required';
        }
        if (!formData.catid.trim()) {
            errors.catid = 'Please select a category.';
        }
        if (!formData.subcatid.trim()) {
            errors.subcatid = 'Please select a subcategory.';
        }
        if (prodExists) {
            errors.name = 'Product already exists';
        }
        console.log('Line 252 Form data before validation:', formData);
        console.log('Line 253 Form errors before validation:', errors);
        return errors;
    };


    useEffect(() => {
            const hasErrors = Object.values(formErrors).some(Boolean);
            setIsSubmitDisabled(hasErrors || prodChecking); 
    }, [formErrors, prodChecking]);

    const handleFormSubmit = async (e) => {
        console.log('Form data before submit:', formData); 
        console.log('Form errors before submit:', formErrors);
        console.log('Prod checking status before submit:', prodChecking);
        e.preventDefault();
        
        const errors = validateBeforeSubmit();
        if (Object.keys(errors).length > 0) 
        {
            console.log('Form validation errors preventing:', errors);
            setFormErrors(errors);
            return;
        }

        setLoading(true);
        try {
            console.log('Submitting form with data:', formData);
            const res = await api.post('/api/superadmin/prod/add', formData,{
                    headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            if (res.status === 200) { 
                router.push('/superadmin/prod/view?message=Product+added+successfully');
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
        { value: "", label: "Choose a category" }, 
        ...cats.map((cat) => ({
            value: String(cat.id), 
            label: cat.name,
        })),
    ];

    const subcategoryOptions = [
        { value: "", label: "Choose a subcategory" }, 
        ...subcats.map((sub) => ({
            value: String(sub.id), 
            label: sub.name,
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
                    <Link
                        href={`/superadmin/prod/view${selectedCatId ? `/${selectedCatId}` : ''}${
                        selectedSubcatId ? `/${selectedSubcatId}` : ''
                        }`}
                        className="mt-2 mb-4"
                    >
                        &rsaquo; View Products selectedTaggId: {selectedTaggId }
                    </Link>
                </div>
                <h3 className="text-xl font-semibold mb-4">➕ Add New product</h3>
                <form onSubmit={handleFormSubmit} encType="multipart/form-data" className="space-y-4">

                    <Select
                        name="catid"
                        value={categoryOptions.find(option => option.value === String(formData.catid)) || null} // ✅ Match the value properly
                        onChange={(selectedOption) => {
                            handleInputChange({
                                target: { name: "catid", value: selectedOption?.value || "" } 
                            } as React.ChangeEvent<HTMLSelectElement>);
                        }}
                        options={categoryOptions}
                        isSearchable={true} 
                        className="w-full"
                        placeholder="Choose a category"
                    />


                    {formErrors.catid && <p className="text-red-600 text-sm">{formErrors.catid}</p>}
   
                    {selectedCatId && (
                        <>
                        <Select
                        name="subcatid"
                        value={subcategoryOptions.find(option => option.value === String(formData.subcatid)) || null} // ✅ Match the value properly
                        onChange={(selectedOption) => {
                            handleInputChange({
                                target: { name: "subcatid", value: selectedOption?.value || "" }  
                            } as React.ChangeEvent<HTMLSelectElement>);
                        }}
                        options={subcategoryOptions}
                        isSearchable={true} 
                        className="w-full"
                        placeholder="Choose a category"
                    />
                    {selectedSubcatId && (        
                        <>
                        <div className="space-y-4 w-[90%]">
                        <input
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="ProductName"
                            className="w-full p-2 border rounded"
                        />

                       {formErrors.name && <p className="text-red-600 text-sm">{formErrors.name}</p>}
                        {prodCheckMessage && (
                            <p className={`text-sm ${prodExists ? 'text-red-600' : 'text-green-600'}`}>
                                {prodCheckMessage}
                            </p>
                        )}
                        </div>

                        <div className="space-y-4 w-[100%]">
                        <Select
                        isMulti
                        options={availableTaggs.map(tagg => ({
                            value: tagg.id,
                            label: tagg.name,
                        }))}
                        value={selectedTaggIds.map(id => {
                            const tagg = availableTaggs.find(t => t.id === id);
                            return tagg ? { value: tagg.id, label: tagg.name } : null;
                        }).filter(Boolean)}
                        onChange={selectedOptions => {
                            const taggIds = selectedOptions.map(option => option.value);
                            setSelectedTaggIds(taggIds);

                            // 🔄 Forward to input handler via synthetic event
                            handleInputChange({
                            target: {
                                name: 'tagg_ids',
                                value: taggIds,
                            },
                            } as unknown as React.ChangeEvent<HTMLInputElement>);
                        }}
                        placeholder="Select Tags"
                        className="react-select-container"
                        classNamePrefix="react-select"
                        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                        />

                        </div>


                        <div className="space-y-4 w-[90%]">
                            <label className="block font-medium mb-1">Visibility</label>
                            <div className="flex gap-4">
                                <label>
                                    <input
                                        type="radio"
                                        name="vis"
                                        value="yes"
                                        checked={formData.vis === "yes"}
                                        onChange={handleInputChange}
                                        className="mr-2"
                                    />
                                    Yes
                                </label>

                                <label>
                                    <input
                                        type="radio"
                                        name="vis"
                                        value="no"
                                        checked={formData.vis === "no"}
                                        onChange={handleInputChange}
                                        className="mr-2"
                                    />
                                    No
                                </label>
                            </div>
                        </div>


                        <div className="space-y-4 w-[70%]">
                            <label className="block font-medium mb-1">Price (Optional)</label>
                            <input
                                type="number"
                                name="prix"
                                value={formData.prix}
                                onChange={handleInputChange}
                                placeholder="Enter price (optional)"
                                className="w-[200px] p-2 border rounded"
                            />
                        </div>

                            
                        <div className="space-y-4 w-[80%] relative z-0">
                      
                            <div  className="w-[90%]">
                                <label className="block font-medium mb-1">Upload Image (jpg, png, webp, gif)</label>
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
                                {formData.img && (
                                    <div className="mt-2 ">
                                        <Image
                                            src={URL.createObjectURL(formData.img)}
                                            alt="Preview"
                                            width={320}
                                            height={160}
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

                            <button type="submit"
                                disabled={loading || isSubmitDisabled}
                                className={`px-4 py-2 rounded text-white transition-opacity duration-200 ${
                                    loading || isSubmitDisabled
                                        ? 'bg-blue-400 cursor-not-allowed opacity-60'
                                        : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                            >
                            {loading ? 'Submitting...' : 'Add'}
                            </button>
                            </>
                             )}
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



