
import React, { useState } from 'react';
import { Product, Category } from '../types';
import ProductModal from './ProductModal';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

interface ProductsProps {
    products: Product[];
    categories: Category[];
    saveProduct: (product: Product) => void;
    deleteProduct: (productId: string) => void;
}

const Products: React.FC<ProductsProps> = ({ products, categories, saveProduct, deleteProduct }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const handleOpenModal = (product: Product | null = null) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingProduct(null);
        setIsModalOpen(false);
    };

    const getCategoryName = (categoryId: string) => {
        return categories.find(c => c.id === categoryId)?.name || 'N/A';
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4 sm:mb-0">Gerenciamento de Produtos</h2>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors shadow"
                >
                    <FaPlus className="mr-2" />
                    <span className="whitespace-nowrap">Adicionar Produto</span>
                </button>
            </div>

            {/* Mobile Card View */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
                {products.map(product => (
                    <div key={product.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg shadow p-4 space-y-3">
                        <img src={product.imageUrl} alt={product.name} className="w-full h-32 object-cover rounded-md mb-2" />
                        <div className="flex justify-between items-start">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">{product.name}</h3>
                            <span className="text-sm font-medium text-purple-600 dark:text-purple-400">{getCategoryName(product.categoryId)}</span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-300">Preço: <span className="font-semibold text-gray-800 dark:text-gray-100">{product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">Tamanho/Un.: <span className="font-semibold text-gray-800 dark:text-gray-100">{product.size} / {product.unit}</span></p>
                        </div>
                        <div className="flex items-center justify-end space-x-4 pt-2">
                            <button onClick={() => handleOpenModal(product)} className="text-blue-500 hover:text-blue-700 transition-colors" title="Editar">
                                <FaEdit size={20} />
                            </button>
                            <button onClick={() => deleteProduct(product.id)} className="text-red-500 hover:text-red-700 transition-colors" title="Deletar">
                                <FaTrash size={20} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Imagem</th>
                            <th scope="col" className="px-6 py-3">Produto</th>
                            <th scope="col" className="px-6 py-3">Categoria</th>
                            <th scope="col" className="px-6 py-3">Preço</th>
                            <th scope="col" className="px-6 py-3">Tamanho/Un.</th>
                            <th scope="col" className="px-6 py-3">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => (
                            <tr key={product.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-6 py-4">
                                    <img src={product.imageUrl} alt={product.name} className="w-12 h-12 object-cover rounded-md" />
                                </td>
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{product.name}</td>
                                <td className="px-6 py-4">{getCategoryName(product.categoryId)}</td>
                                <td className="px-6 py-4">{product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                <td className="px-6 py-4">{product.size} / {product.unit}</td>
                                <td className="px-6 py-4 flex items-center space-x-3">
                                    <button onClick={() => handleOpenModal(product)} className="text-blue-500 hover:text-blue-700 transition-colors" title="Editar">
                                        <FaEdit size={18} />
                                    </button>
                                    <button onClick={() => deleteProduct(product.id)} className="text-red-500 hover:text-red-700 transition-colors" title="Deletar">
                                        <FaTrash size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {products.length === 0 && <p className="text-center py-8 text-gray-500">Nenhum produto encontrado.</p>}

            {isModalOpen && (
                <ProductModal
                    product={editingProduct}
                    categories={categories}
                    onClose={handleCloseModal}
                    onSave={saveProduct}
                />
            )}
        </div>
    );
};

export default Products;
