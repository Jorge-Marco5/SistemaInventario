class ProductService {
    /**
     * Obtener la lista de productos registrados
     * @param {*} q Busqueda a partir de un texto
     * @param {*} limit Limite de resultados
     * @param {*} currentPage Pagina actual
     * @returns 
     */
    async getProducts(q, limit, currentPage) {
        return await invoke("get_products", {
            params: {
                q: q || '',
                limit: limit || 10,
                currentPage: currentPage || 1
            }
        });
    }

    /**
     * Obtener la informacion de un producto en especifico
     * @param {Number} id 
     * @returns
     */
    async getProduct(id) {
        return await invoke('get_product', { id });
    }

    /**
     * Obtener la lista de productos de una categoria en especifico
     * @param {*} category_id Id de la categoria
     * @param {*} q terminos de busqueda dentro de la categoria
     * @param {*} limit limite de items a mostrar en cada pagina 
     * @param {*} currentPage pagina actual
     * @returns 
     */
    async getProductsByCategory(category_id, q, limit, currentPage) {
        return await invoke('get_products_by_category', {
            categoryId: category_id, params: {
                q: q || '',
                limit: limit || 10,
                currentPage: currentPage || 1
            }
        });
    }

    /**
     * Obtener la lista de productos de una categoria en especifico
     * @param {*} provider_id Id de la categoria
     * @param {*} q terminos de busqueda dentro de la categoria
     * @param {*} limit limite de items a mostrar en cada pagina 
     * @param {*} currentPage pagina actual
     * @returns 
     */
    async getProductsByProvider(provider_id, q, limit, currentPage) {
        return await invoke('get_products_by_provider', {
            providerId: provider_id, params: {
                q: q || '',
                limit: limit || 10,
                currentPage: currentPage || 1
            }
        });
    }

    /**
     * Registro de un producto
     * @param {{image: String, barcode: String, name: String, description: String, stock_min: Number, expiration_date: String, price_in: Number, price_shop: Number, unit: String, presentation: String, provider_id: Number, category_id: Number, is_active: Number,}} data 
     * @returns
     */
    async createProduct(data) {
        return await invoke('create_product', { data });
    }

    /**
     * Actualizacion de la informacion de un producto en el sistema
     * @param {Number} id 
          * @param {{image: String, barcode: String, name: String, description: String, stock_min: Number, expiration_date: String, price_in: Number, price_shop: Number, unit: String, presentation: String, provider_id: Number, category_id: Number, is_active: Number,}} data 

     * @returns 
     */
    async updateProduct(id, data) {
        return await invoke('update_product', { id, data });
    }

    /**
     * Eliminación de un producto del sistema
     * @param {Number} id
     * @returns 
     */
    async deleteProduct(id) {
        return await invoke('delete_product', { id });
    }

    async outStockByProduct(product_id, quantity) {
        if (!product_id || !quantity) {
            console.error("Ingresa los datos de salida del producto")
        }
        // Llamada disponible desde el frontend cuando lo requieras:
        return await invoke("out_stock_by_product", {
            productId: product_id,
            quantity: quantity
        });
    }
}