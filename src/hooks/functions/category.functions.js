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
        console.error(error || "Error al crear la categoria");
    }
}

async function updateCategory(id, data) {
    try {
        data.image = '';
        return await categoryService.updateCategory(Number(id), data);
    } catch (error) {
        console.error("Error al actualizar la categoria: " + error);
    }
}

async function getCategories(search) {
    try {
        return await categoryService.getCategories(search);
    } catch (error) {
        console.error("Error al realizar operaciones en categorias");
    }
}