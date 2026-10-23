const categoryService = new CategoryService();

async function createCategory(data) {
    /**
      'Abarrotes', 'Productos alimenticios y víveres'
      'Lácteos', 'Leche, quesos y derivados lácteos'
      'Bebidas', 'Refrescos, jugos y aguas'
      'Electrónica', 'Dispositivos y accesorios electrónicos'
      'Papelería', 'Artículos de oficina y papelería'
      'Limpieza', 'Productos para aseo y limpieza del hogar'
      'Ferretería', 'Herramientas y materiales de ferretería'
      'Ropa y Calzado', 'Prendas de vestir y calzado'
      'Farmacia', 'Medicamentos y cuidado personal'
      'Hogar y Jardín', 'Artículos para el hogar y jardinería'
     */
    try {
        data.image = '';
        return await categoryService.createCategory(data);
    } catch (error) {
        throw new Error("Error al crear la categoria");
    }
}

async function updateCategory(id, data) {
    try {
        data.image = '';
        return await categoryService.updateCategory(Number(id), data);
    } catch (error) {
        throw new Error("Error al actualizar la categoria");
    }
}

async function getCategories(search) {
    try {
        return await categoryService.getCategories(search);
    } catch (error) {
        throw new Error("Error al obtener las categorias");
    }
}

async function getCategoryById(category_id) {
    try {
        return await categoryService.getCategoryById(category_id);
    } catch (error) {
        throw new Error("Error al obtener informacion de la categoria");
    }
}