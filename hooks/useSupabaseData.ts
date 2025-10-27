
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabase';
import { Product, Category, Order, OrderStatus, PaymentStatus, OrderItem, User, Role } from '../types';

export const useSupabaseData = () => {
    const [users, setUsers] = useState<User[]>([
        { id: 1, name: 'Admin Geral', role: Role.Admin, avatar: 'https://i.pravatar.cc/150?u=admin' },
        { id: 2, name: 'Atendente 1', role: Role.Atendente, avatar: 'https://i.pravatar.cc/150?u=atendente1' },
        { id: 3, name: 'Atendente 2', role: Role.Atendente, avatar: 'https://i.pravatar.cc/150?u=atendente2' },
    ]);
    
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Carregar categorias do Supabase
    const loadCategories = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('id, name')
                .order('name');
            
            if (error) throw error;
            
            if (data) {
                const mappedCategories: Category[] = data.map((cat: any) => ({
                    id: cat.id.toString(),
                    name: cat.name
                }));
                setCategories(mappedCategories);
            }
        } catch (err) {
            console.error('Erro ao carregar categorias:', err);
            setError(`Erro ao carregar categorias: ${(err as Error).message}`);
        }
    }, []);

    // Carregar produtos do Supabase
    const loadProducts = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('id, name, price, category_id, size, unit, image_url')
                .order('name');
            
            if (error) throw error;
            
            if (data) {
                const mappedProducts: Product[] = data.map((prod: any) => ({
                    id: prod.id.toString(),
                    name: prod.name,
                    categoryId: prod.category_id ? prod.category_id.toString() : '',
                    price: parseFloat(prod.price),
                    size: prod.size || '',
                    unit: prod.unit || '',
                    imageUrl: prod.image_url || `https://picsum.photos/seed/${prod.name}/400`
                }));
                setProducts(mappedProducts);
            }
        } catch (err) {
            console.error('Erro ao carregar produtos:', err);
            setError(`Erro ao carregar produtos: ${(err as Error).message}`);
        }
    }, []);

    // Carregar pedidos do Supabase
    const loadOrders = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('id, customer_name, customer_whatsapp, delivery_address, status, payment_status, subtotal, created_at, data_agendamento, turno, horario_agendamento')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            
            if (data) {
                // Buscar itens dos pedidos
                const orderIds = data.map(order => order.id);
                
                let orderItems: any[] = [];
                if (orderIds.length > 0) {
                    const { data: itemsData, error: itemsError } = await supabase
                        .from('order_items')
                        .select(`
                            id,
                            order_id,
                            quantity,
                            unit_price,
                            products!inner (id, name)
                        `)
                        .in('order_id', orderIds);
                    
                    if (itemsError) throw itemsError;
                    orderItems = itemsData || [];
                }
                
                const mappedOrders: Order[] = data.map((order: any) => {
                    const orderDate = new Date(order.created_at);
                    const orderItemsForOrder = orderItems.filter(item => item.order_id === order.id);
                    
                    const items: OrderItem[] = orderItemsForOrder.map(item => ({
                        productId: item.products.id.toString(),
                        productName: item.products.name,
                        quantity: item.quantity,
                        price: parseFloat(item.unit_price)
                    }));
                    
                    return {
                        id: order.id.toString(),
                        customer: {
                            name: order.customer_name,
                            whatsapp: order.customer_whatsapp,
                            address: order.delivery_address
                        },
                        items,
                        status: order.status as OrderStatus,
                        payment_status: order.payment_status as PaymentStatus || PaymentStatus.Pendente,
                        total: parseFloat(order.subtotal),
                        createdAt: orderDate,
                        data_agendamento: order.data_agendamento,
                        turno: order.turno,
                        horario_agendamento: order.horario_agendamento
                    };
                });
                
                setOrders(mappedOrders);
            }
        } catch (err) {
            console.error('Erro ao carregar pedidos:', err);
            setError(`Erro ao carregar pedidos: ${(err as Error).message}`);
        }
    }, []);

    // Carregar dados iniciais
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([loadCategories(), loadProducts(), loadOrders()]);
            setLoading(false);
        };
        
        loadData();

        // Configurar listeners para atualizações em tempo real
        const productsChannel = supabase
            .channel('products-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'products',
                },
                () => {
                    loadProducts();
                }
            )
            .subscribe();

        const ordersChannel = supabase
            .channel('orders-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'orders',
                },
                () => {
                    loadOrders();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(productsChannel);
            supabase.removeChannel(ordersChannel);
        };
    }, [loadCategories, loadProducts, loadOrders]);

    // Funções de atualização
    const updateOrderStatus = useCallback(async (orderId: string, newStatus: OrderStatus) => {
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', orderId);
            
            if (error) throw error;
            
            // Atualizar localmente
            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order.id === orderId ? { ...order, status: newStatus } : order
                )
            );
        } catch (err) {
            console.error('Erro ao atualizar status do pedido:', err);
            setError(`Erro ao atualizar status do pedido: ${(err as Error).message}`);
        }
    }, []);

    const updatePaymentStatus = useCallback(async (orderId: string, newStatus: PaymentStatus) => {
        try {
            const { error } = await supabase
                .from('orders')
                .update({ payment_status: newStatus })
                .eq('id', orderId);
            
            if (error) throw error;
            
            // Atualizar localmente
            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order.id === orderId ? { ...order, payment_status: newStatus } : order
                )
            );
        } catch (err) {
            console.error('Erro ao atualizar status do pagamento:', err);
            setError(`Erro ao atualizar status do pagamento: ${(err as Error).message}`);
        }
    }, []);

    const saveProduct = useCallback(async (product: Product) => {
        try {
            const productData: any = {
                name: product.name,
                price: product.price,
                size: product.size || null,
                unit: product.unit || null,
                image_url: product.imageUrl,
            };

            const categoryIdAsInt = parseInt(product.categoryId);
            if (!isNaN(categoryIdAsInt)) {
                productData.category_id = categoryIdAsInt;
            }

            if (product.id && !product.id.startsWith('new')) {
                // Update
                const { data, error } = await supabase
                    .from('products')
                    .update(productData)
                    .eq('id', parseInt(product.id as string))
                    .select()
                    .single();

                if (error) throw error;

                if (data) {
                    const updatedProduct: Product = {
                        id: data.id.toString(),
                        name: data.name,
                        categoryId: data.category_id ? data.category_id.toString() : '',
                        price: parseFloat(data.price),
                        size: data.size || '',
                        unit: data.unit || '',
                        imageUrl: data.image_url || `https://picsum.photos/seed/${data.name}/400`
                    };
                    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
                }
            } else {
                // Insert
                const { data, error } = await supabase
                    .from('products')
                    .insert([productData])
                    .select()
                    .single();

                if (error) throw error;

                if (data) {
                    const newProduct: Product = {
                        id: data.id.toString(),
                        name: data.name,
                        categoryId: data.category_id ? data.category_id.toString() : '',
                        price: parseFloat(data.price),
                        size: data.size || '',
                        unit: data.unit || '',
                        imageUrl: data.image_url || `https://picsum.photos/seed/${data.name}/400`
                    };
                    setProducts(prev => [...prev, newProduct].sort((a, b) => a.name.localeCompare(b.name)));
                }
            }
        } catch (err) {
            console.error('Erro ao salvar produto:', err);
            setError(`Erro ao salvar produto: ${(err as Error).message}`);
        }
    }, []);

    const deleteProduct = useCallback(async (productId: string) => {
        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', parseInt(productId));
            
            if (error) throw error;
            
            // Atualizar localmente
            setProducts(prev => prev.filter(p => p.id !== productId));
        } catch (err) {
            console.error('Erro ao deletar produto:', err);
            setError(`Erro ao deletar produto: ${(err as Error).message}`);
        }
    }, []);

    return { 
        users, 
        products, 
        categories, 
        orders, 
        loading, 
        error, 
        updateOrderStatus, 
        updatePaymentStatus,
        saveProduct, 
        deleteProduct,
        refetch: () => {
            loadCategories();
            loadProducts();
            loadOrders();
        }
    };
};