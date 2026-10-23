class CategoryService {
    /**
     * Obtiene la lista de categorias registradas en el sistema
     * @returns 
     */
    async getCategories(search) {
        return await invoke('get_categories', { search });
    }

    /**
     * Obtiene la informacion de una categoria
     */
    async getCategoryById(id) {
        return await invoke('get_category_by_id', { id });
    }


    /**
     * Registro de una nueva categoria
     * @param {{name:String, description: String}} data 
     * @returns 
     */
    async createCategory(data) {
        return await invoke('create_category', { data });
    }

    /**
     * Actualización de la informacion de una categoria
     * @param {Number} id 
     * @param {{name:String, description: String}} data 
     * @returns 
     */
    async updateCategory(id, data) {
        return await invoke('update_category', { id, data });
    }
}