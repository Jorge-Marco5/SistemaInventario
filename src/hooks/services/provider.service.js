class ProviderService {
    /**
     * Obtener la lista de proveedores registrados
     * @param {*} q Busqueda a partir de un texto
     * @param {*} limit Limite de resultados
     * @param {*} currentPage Pagina actual
     * @returns 
     */
    async getProviders(q, limit, currentPage) {
        return await invoke("get_providers", {
            params: {
                q: q || '',
                limit: limit || 10,
                currentPage: currentPage || 1
            }
        });
    }

    /**
     * Obtener la informacion de un proveedor en especifico
     * @param {Number} id 
     * @returns
     */
    async getProvider(id) {
        return await invoke('get_provider', { id });
    }

    /**
     * Registro de un proveedor
     * @param {{name: String, phone1: String, phone2: String, email1: String, email2: String}} data 
     * @returns
     */
    async createProvider(data) {
        return await invoke('create_provider', { data });
    }

    /**
     * Actualizacion de la informacion de un proveedor en el sistema
     * @param {Number} id 
     * @param {{name: String, phone1: String, phone2: String, email1: String, email2: String}} data 
     * @returns 
     */
    async updateProvider(id, data) {
        return await invoke('update_provider', { id, data });
    }

    /**
     * Eliminación de un proveedor del sistema
     * @param {Number} id
     * @returns 
     */
    async deleteProvider(id) {
        return await invoke('delete_provider', { id });
    }
}