'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import Link from 'next/link';

import Select from "react-select";
import { useMemo } from 'react';
import { debounce } from 'lodash';
import { APP_API_URL } from '@/lib/config';
import Image from 'next/image';


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
    tagg_ids?: string;
};

type Subcategory = {
  id: number;  
  catid: number;   
  name: string;
};

type Category = {
  id: number;    
  name: string;
};

type Taggtype = {
  id: number;    
  name: string;
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

export default function EditProdPage() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cats, setCats] = useState<Category[]>([]);
  const [subcats, setSubcats] = useState<Subcategory[]>([]);
  const [taggs, setTaggs] = useState<Taggtype[]>([]);
  const [prod, setProd] = useState<ProdFormData | null>(null);
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [selectedSubcatId, setSelectedSubcatId] = useState<string | null>(null);
  const [selectedTaggIds, setSelectedTaggIds] = useState<string[]>([]);
  const [prodChecking, setProdChecking] = useState(false);

 



  useEffect(() => {
    const fetchProd = async () => {
      try {
        const res = await api.get(`/api/superadmin/prod/edit/${id}`);
        console.log('✅ Full edit response:', res.data);
        setCats(res.data.cats);
        setSubcats(res.data.subcats);
        setSelectedCatId(res.data.prod.catid?.toString() || null);
        setSelectedSubcatId(res.data.prod.subcatid?.toString() || null);

        setTaggs(res.data.allTaggs); // ✅ Load all available tags
        console.log('✅ All tags loaded:', res.data.allTaggs);
        console.log('✅ Selected tag IDs:', res.data.prod.tagg_ids);
        const selectedTIds = res.data.prod.tagg_ids ?? [];        
        setProd(res.data.prod);
    
        setSelectedTaggIds(selectedTIds); // ✅ Preload tag dropdown   
        setError(null);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load record:', err);
        setError('Failed to load record');
      } finally {
        setLoading(false);
      }
    };

    fetchProd();
  }, [id]);

    const [formData, setFormData] = useState<ProdFormData>({
    name: '',
    catid: '',
    subcatid: '',
    prix: '',
    dess: '',
    des: '',
    vis: '',
    img: null,
    filer: null,
    tagg_ids: [],
    });

    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
    const [prodExists, setProdExists] = useState<boolean | null>(null);
    const [formLoading, setFormLoading] = useState(false);
    const [prodCheckMessage, setProdCheckMessage] = useState('');
    useEffect(() => {
    if (prod) {
        setFormData({
        name: prod.name || '',
        catid: prod.catid?.toString(),
        subcatid: prod.subcatid?.toString(),
        prix: prod.prix?.toString(),
        dess: prod.dess || '',
        des: prod.des || '',
        vis: prod.vis || '',
        img: null,
        filer: null,
       tagg_ids: prod.tagg_ids || [], 

        });
        }   
    }, [prod]);

    const checkNameEditAvailability = async (name: string, catid: string, subcatid: string) => {
        setProdChecking(true);
        setProdCheckMessage('');

        if (formData.name.trim().length < 2) return; // ✅ Ensure at least 2 characters before checking
        if (!catid.trim() || !subcatid.trim()) return;

        try {
            const res = await api.post('/api/superadmin/prods/check-edit', {
            name,
            id: id, 
            catid: catid,
            subcatid: subcatid,
            });

            if (res.data.valid) {
            setProdCheckMessage('✅ Name is available.');
            setFormErrors(prev => ({ ...prev, name: undefined }));
            setProdExists(false);

            } 
            else 
            {
                setProdCheckMessage('');
                setFormErrors(prev => ({ ...prev, name: res.data.message || 'name is taken' }));
                setProdExists(true);
            }
        } 
        catch (err) 
        {
            console.error('❌ Error checking name availability:', err);
            setFormErrors(prev => ({ ...prev, name: ' check failed' }));
            setProdExists(true);
        } 
        finally {
            setProdChecking(false);
        }
    };


    interface DebouncedCheckAvailability {
        (name: string, catid?: string, subcatid?: string): void;
    }

    const debouncedCheckAvailability: DebouncedCheckAvailability = useMemo<DebouncedCheckAvailability>(
        () =>
            debounce((name: string, catid?: string, subcatid?: string) => {
                checkNameEditAvailability(name , catid || '', subcatid || ''); // ✅ Call the actual function with parameters
            }, 1000), 
       
        []
    );
    
    useEffect(() => {
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
            checkNameEditAvailability(safeValue, selectedCatId ?? "", selectedSubcatId ?? "");
        }

        /*
        if (name === 'tagg_ids') {
            console.log('✅ Line 270 tagg_ids value:', value);
            setFormData(prev => ({
                ...prev,
                tagg_ids: Array.isArray(value) ? value : [],
            }));
            console.log('✅ Line 270 Updated tagg_ids:', Array.isArray(value) ? value : []);
            return;
        }
        */

        if (name === 'tagg_ids') {
        console.log('✅ Line 270 tagg_ids value:', value);
        setFormData(prev => ({
            ...prev,
            tagg_ids: Array.isArray(value) ? value : [],
        }));
        console.log('✅ Line 270 Updated tagg_ids:', Array.isArray(value) ? value : []);
        //return;
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
            setIsSubmitDisabled(hasErrors || prodExists); // optionally disable while checking email
    }, [formErrors, prodExists]);


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
            formPayload.append('subcatid', formData.subcatid);
            formPayload.append('prix', String(formData.prix));
            formPayload.append('dess', formData.dess);
            formPayload.append('des', formData.des);
            if (formData.img) {
                formPayload.append('img', formData.img);
            }
            if (formData.filer) {
                formPayload.append('filer', formData.filer);
            }
            formPayload.append('vis', formData.vis);

            if (formData.tagg_ids && formData.tagg_ids.length > 0) {
                console.log('✅ Appending tagg_ids:', formData.tagg_ids);
                formData.tagg_ids.forEach(tid => {
                    console.log('✅ Appending tagg_id:', tid);
                    formPayload.append('tagg_ids[]', tid); // 🔄 Laravel expects this array format
                });
            }


            formPayload.append('_method', 'PUT'); 
            await api.post(`/api/superadmin/prod/update/${id}`, formPayload, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            router.push('/superadmin/prod/view');
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
    console.log(' catChecking ', prodExists);
    setIsSubmitDisabled(hasErrors || prodExists);
  }, [formErrors, prodExists]);


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


    useEffect(() => {
     if (selectedCatId !== null && selectedCatId.trim() !== "" && selectedSubcatId !== null && selectedSubcatId.trim() !== "") {
        console.log("🔄 Checking subcategory name availability for categoryid:", selectedCatId);
        checkNameEditAvailability(formData.name, selectedCatId, selectedSubcatId); // ✅ Triggers when category changes
    }
    }, [formData.name, selectedCatId, selectedSubcatId]);


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-700">
        Loading ...
      </div>
    );
  }

  if (error || ! prod) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error || 'Product not found'}
      </div>
    );
  }

  return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-5xl mx-auto space-y-8">
              <div className="bg-white p-6 rounded shadow">
              <h1 className="text-2xl font-bold mb-4">Edit  {prod.name}</h1>
              <Link href="/superadmin/prod/view" className="text-blue-500 underline">
                ← Back to Products
              </Link>

            
                <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-4">

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

                        
                    <div className="space-y-4 w-[100%]"
                    onClick={e => e.stopPropagation()}>
                      
                        <Select
                            isMulti
                            options={taggs.map(tagg => ({
                            value: tagg.id,
                            label: tagg.name,
                            }))}
                            value={selectedTaggIds.map(id => {
                            const tagg = taggs.find(t => t.id === Number(id));
                            return tagg ? { value: tagg.id, label: tagg.name } : null;
                            }).filter(Boolean)}
                            onChange={selectedOptions => {
                            const taggIds = selectedOptions.map(option => String(option.value));
                            setSelectedTaggIds(taggIds);

                            // 🔁 Forward to centralized handler like all other fields
                            handleInputChange({
                                target: {
                                name: 'tagg_ids',
                                value: taggIds,
                                },
                            } as unknown as React.ChangeEvent<HTMLInputElement>);
                            }}
                            placeholder="Select tags"
                            className="react-select-container"
                            classNamePrefix="react-select"
                            styles={{
                            menuPortal: base => ({ ...base, zIndex: 9999 }),
                    
                            }}
                        />
                    </div>

                        



                    <div className="space-y-4 w-[90%] mt-4" >
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


                        <div className="space-y-4 w-[70%] mt-4">
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

                       <div className="relative z-0">
                            <label className="block font-medium"> Image (optional)</label>
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
        
                        {!formData.img && prod?.img && (
                        <div className="mt-2">
                            <img
                            src={`${APP_API_URL}/${prod.img}`}
                            alt="Existing Profile"
                            className="max-w-xs max-h-40 rounded border"
                            />
                            <p className="text-sm text-gray-500 mt-1">Existing image shown above</p>
                        </div>
                        )}
                        {formData?.img instanceof Blob && (
                        <div className="mt-2">
                            <Image
                            src={URL.createObjectURL(formData.img)}
                            alt="Preview"
                            width={320}
                            height={160}
                            className="max-w-xs max-h-40 rounded border"
                            />
                        </div>
                        )}

                        {formErrors.img && <p className="text-red-500 text-sm">{formErrors.img}</p>}
              
                        </div>
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

                        {!formData.filer && prod?.filer && (
                        <p className="mt-2 text-sm text-gray-500">
                            Existing file:{" "}
                            <a
                            href={`${APP_API_URL}/${prod.filer}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-blue-600 hover:underline"
                            >
                            {typeof prod.filer === 'string' ? (prod.filer as string).split('/').pop() : prod.filer?.name}
                            </a>
                        </p>
                        )}

                        {formErrors.filer && <p className="text-red-500 text-sm">{formErrors.filer}</p>}
                        </div>





                        {error && <p className="text-red-700 bg-red-100 p-2 rounded">{error}</p>} 


                            <button type="submit"
                                disabled={loading || isSubmitDisabled}
                                className={`px-6 mt-4  mb-5 py-2 rounded text-white transition-opacity 
                                    duration-200 ${
                                    loading || isSubmitDisabled
                                        ? 'bg-blue-400 cursor-not-allowed opacity-60'
                                        : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                            >
                            {loading ? 'Submitting...' : 'Update'}
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


