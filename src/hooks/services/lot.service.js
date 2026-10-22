class LotService {
    /**
     * Obtener la lista de lotes referemtes a un producto
     * @param {*} provider_id Id de la categoria
     * @param {*} q terminos de busqueda dentro de la categoria
     * @param {*} limit limite de items a mostrar en cada pagina 
     * @param {*} currentPage pagina actual
     * @returns 
     */
    async getLotsByProduct(product_id, q = '', limit = 10, currentPage = 1) {
        return await invoke('get_full_lots_by_product', {
            productId: product_id,
            params: {
                q: q || '',
                limit: limit || 10,
                currentPage: currentPage || 1
            }
        });
    }

    async countStockByProduct(product_id) {
        return await invoke('count_stock_by_product', {
            productId: product_id,
        });
    }

    /**
     * Registro de un nuevo Lote
     * @param {{image: String, barcode: String, name: String, description: String, stock_min: Number, expiration_date: String, price_in: Number, price_shop: Number, unit: String, presentation: String, provider_id: Number, category_id: Number, is_active: Number,}} data 
     * @returns
     */
    async createLot(data) {
        return await invoke('create_lot', { data });
    }

    /**
     * Actualizacion de la informacion de un Lote
     * @param {Number} id 
     * @param {{image: String, barcode: String, name: String, description: String, stock_min: Number, expiration_date: String, price_in: Number, price_shop: Number, unit: String, presentation: String, provider_id: Number, category_id: Number, is_active: Number,}} data 
     * @returns 
     */
    async updateLot(id, data) {
        return await invoke('update_lot', { id, data });
    }
}