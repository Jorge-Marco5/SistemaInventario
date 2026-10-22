class OperationService {
    /**
     * Obtener la lista de operaciones registradas
     * @param {*} q Busqueda a partir de un texto
     * @param {*} limit Limite de resultados
     * @param {*} currentPage Pagina actual
     * @returns 
     */
    async getOperations(q, limit, currentPage) {
        return await invoke("get_operations", {
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
    async getOperation(id) {
        return await invoke('get_operation', { id });
    }

    /**
     * Obtener la lista de operaciones de unproducto en especifico
     * @param {*} product_id Id del producto
     * @param {*} q terminos de busqueda dentro de las operaciones
     * @param {*} limit limite de items a mostrar en cada pagina 
     * @param {*} currentPage pagina actual
     * @returns 
     */
    async getOperationsByProduct(product_id, q, limit, currentPage) {
        return await invoke('get_operations_by_product', {
            categoryId: product_id, params: {
                q: q || '',
                limit: limit || 10,
                currentPage: currentPage || 1
            }
        });
    }

    /**
     * Registro de un producto
     * @param {{product_id, q, operation_type_id, sell_id}} data 
     * @returns
     */
    async createOperation(data) {
        return await invoke('create_operation', { data });
    }

}