
import React, { useState, FormEvent, ChangeEvent } from 'react';
import { Product, Category } from '../types';
import { supabase } from '../utils/supabase';

interface ProductModalProps {
    product: Product | null;
    categories: Category[];
    onClose: () => void;
    onSave: (product: Product) => void;
}

// Definindo o InputField fora do componente principal para evitar recriações
interface InputFieldProps {
    name: string;
    label: string;
    value: string | number;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    type?: string;
    required?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({ name, label, value, onChange, type = 'text', required = true }) => (
    <div>
        <label htmlFor={name} className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{label}</label>
        <input
            type={type}
            name={name}
            id={name}
            value={value}
            onChange={onChange}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            required={required}
            step={type === 'number' ? '0.01' : undefined}
        />
    </div>
);

const ProductModal: React.FC<ProductModalProps> = ({ product, categories, onClose, onSave }) => {
    const [formData, setFormData] = useState<Omit<Product, 'id' | 'imageUrl' > & {id?: string, imageUrl?: string}>(
        product || {
            name: '',
            categoryId: categories[0]?.id || '',
            price: 0,
            size: '',
            unit: '',
        }
    );
    const [imageFile, setImageFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'price' ? parseFloat(value) : value,
        }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        let finalImageUrl = product?.imageUrl || '';

        if (imageFile) {
            const sanitizedName = imageFile.name
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^\w\-.]/g, '');

            const fileName = `${Date.now()}_${sanitizedName}`;

            const { error: uploadError } = await supabase.storage
                .from('storage-produtos')
                .upload(fileName, imageFile);

            if (uploadError) {
                console.error('Error uploading image:', uploadError);
                alert(`Erro no upload da imagem: ${uploadError.message}`);
                return;
            }

            const { data: urlData } = supabase.storage
                .from('storage-produtos')
                .getPublicUrl(fileName);
            
            finalImageUrl = urlData.publicUrl;
        }

        onSave({
            ...formData,
            id: product?.id || `new-${Date.now()}`,
            imageUrl: finalImageUrl || `https://picsum.photos/seed/${formData.name}/400`
        } as Product);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md m-4" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">{product ? 'Editar Produto' : 'Adicionar Produto'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <InputField name="name" label="Nome do Produto" value={formData.name} onChange={handleChange} />
                    <div>
                        <label htmlFor="categoryId" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Categoria</label>
                        <select name="categoryId" id="categoryId" value={formData.categoryId} onChange={handleChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white">
                            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <InputField name="price" label="Preço" type="number" value={formData.price} onChange={handleChange} />
                        <InputField name="size" label="Tamanho" value={formData.size} onChange={handleChange} />
                    </div>
                     <InputField name="unit" label="Unidade (ex: un, kg, 100 un)" value={formData.unit} onChange={handleChange} />
                     <div>
                        <label htmlFor="image" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Imagem do Produto</label>
                        <input
                            type="file"
                            name="image"
                            id="image"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                        />
                    </div>

                    <div className="flex justify-end pt-6 space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">
                            Cancelar
                        </button>
                        <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                            Salvar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductModal;
