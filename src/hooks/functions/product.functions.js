const productService = new ProductService();
/**
 * Obtiene la lista de productos registrados
 * @param {String} q terminos de busqueda
 * @param {Number} limit //limite de items por pagina
 * @param {Number} currentPage pagina a mostrar (para paginacion)
 * * @returns {{id, image, barcode, name, description, stock_min, price_in, price_shop, unit, presentation, provider_id, category_id, is_active, created_at }} array con los datos del producto registrado
 */
async function getProducts(q = '', limit = 10, currentPage = 1) {
    try {
        return await productService.getProducts(q, limit, currentPage);
    } catch (error) {
        throw new Error("Error al obtener los productos: " + error);
    }
}

/**
 * Obtener la los datos de un producto a traves de su ID
 * @param {*} product_id id del proveedor
 */
async function getProductById(product_id) {
    try {
        //Verificar que siempre se proporcione un ID de producto
        if (!product_id) throw new Error("No se proporcionó el ID de producto")
    
            return await productService.getProduct(Number(product_id));
    } catch (error) {
        throw new Error("Error al obtener los productos: " + error);
    }
}

/**
 * Registro de un producto en el sistema
 * @param {{ image, barcode, name, description, stock_min, price_in, price_shop, unit, presentation, provider_id, category_id, is_active }} data 
 * @returns {{id, image, barcode, name, description, stock_min, price_in, price_shop, unit, presentation, provider_id, category_id, is_active, created_at }} array con los datos del producto registrado
 */
async function createProduct(data = {}) {
    /*
      name, description, inventary_min, price_in, price_out, unit, presentation
    'Laptop HP 15"', 'Intel Core i5 8GB RAM 256GB SSD', 5, 450.00, 650.00, 'Pieza', 'Caja'
    'Mouse Inalámbrico Logitech', 'Mouse óptico ergonómico USB', 10, 12.00, 25.00, 'Pieza', 'Empaque'
    'Cuaderno Profesional 100 Hojas', 'Cuaderno de raya espiral doble', 20, 1.50, 3.50, 'Pieza', 'Paquete'
    'Bolígrafo Gel Negro 0.7mm', 'Caja con 12 bolígrafos de gel', 15, 4.00, 8.50, 'Caja', 'Caja'
    'Café Tostado en Grano 1kg', 'Café 100% Arábica de altura', 10, 8.00, 15.00, 'Kg', 'Bolsa'
    'Leche Entera 1 Litro', 'Leche pasteurizada adicionada con vitaminas', 30, 0.80, 1.40, 'Litro', 'Envase'
    'Jugo de Naranja 1L', 'Jugo 100% natural sin azúcar añadida', 25, 1.20, 2.20, 'Litro', 'Botella'
    'Detergente Multiusos 2kg', 'Detergente en polvo biodegradable', 15, 3.50, 6.00, 'Bolsa', 'Bolsa'
    'Juego de Destornilladores 6 pzs', 'Destornilladores de cruz y planos en acero', 5, 7.50, 14.00, 'Juego', 'Estuche'
    'Camiseta Algodón Talla M', 'Camiseta 100% algodón cuello redondo', 10, 5.00, 11.00, 'Pieza', 'Bolsa'
     */
    try {
        //salir si no existen datos
        if (!data) throw new Error("No se proporcionaron datos para el producto");
        //pasar como valores numericos

        if(data.stock_min < 0) throw new Error("El stock minimo no puede ser negativo1");
        if(data.price_in < 0 || data.price_shop < 0 || data.provider_id < 0 || data.category_id < 0) throw new Error("Los precios no pueden ser negativos")
        if(data.is_active < 0 || data.is_active > 1) data.is_active = 1;

        data.image = '';
        data.stock_min = Number(data.stock_min);
        data.price_in = Number(data.price_in);
        data.price_shop = Number(data.price_shop);
        data.provider_id = Number(data.provider_id);
        data.category_id = Number(data.category_id);
        data.is_active = Number(data.is_active !== undefined ? data.is_active : 1);
        return await productService.createProduct(data);
    } catch (error) {
        throw new Error(error || "Error al registrar el nuevo producto");
    }
}

/**
 * Registro de un producto en el sistema
 * @param {Number} id id del producto a actualizar
 * @param {{ image, barcode, name, description, stock_min, price_in, price_shop, unit, presentation, provider_id, category_id, is_active }} data 
 * @returns {{id, image, barcode, name, description, stock_min, price_in, price_shop, unit, presentation, provider_id, category_id, is_active, created_at }} array con los datos del producto registrado
 */
async function updateProduct(id, data = {}) {
    /*
      name, description, inventary_min, price_in, price_out, unit, presentation
    'Laptop HP 15"', 'Intel Core i5 8GB RAM 256GB SSD', 5, 450.00, 650.00, 'Pieza', 'Caja'
    'Mouse Inalámbrico Logitech', 'Mouse óptico ergonómico USB', 10, 12.00, 25.00, 'Pieza', 'Empaque'
    'Cuaderno Profesional 100 Hojas', 'Cuaderno de raya espiral doble', 20, 1.50, 3.50, 'Pieza', 'Paquete'
    'Bolígrafo Gel Negro 0.7mm', 'Caja con 12 bolígrafos de gel', 15, 4.00, 8.50, 'Caja', 'Caja'
    'Café Tostado en Grano 1kg', 'Café 100% Arábica de altura', 10, 8.00, 15.00, 'Kg', 'Bolsa'
    'Leche Entera 1 Litro', 'Leche pasteurizada adicionada con vitaminas', 30, 0.80, 1.40, 'Litro', 'Envase'
    'Jugo de Naranja 1L', 'Jugo 100% natural sin azúcar añadida', 25, 1.20, 2.20, 'Litro', 'Botella'
    'Detergente Multiusos 2kg', 'Detergente en polvo biodegradable', 15, 3.50, 6.00, 'Bolsa', 'Bolsa'
    'Juego de Destornilladores 6 pzs', 'Destornilladores de cruz y planos en acero', 5, 7.50, 14.00, 'Juego', 'Estuche'
    'Camiseta Algodón Talla M', 'Camiseta 100% algodón cuello redondo', 10, 5.00, 11.00, 'Pieza', 'Bolsa'
     */
    try {
        //Verificar que se indique un producto a actualizar y que los datos no estén vacios
        if(data.stock_min < 0) throw new Error("El stock minimo no puede ser negativo1");
        if(!id || id < 0)throw new Error("No se proporciono el Producto a actualizar");
        if(!data) throw new Error("No se proporcionaron datos para el producto");
        //Verificar que los precios no sean negativos o que activo sea bool
        if(data.price_in < 0 || data.price_shop < 0 || data.provider_id < 0 || data.category_id < 0) throw new Error("Los precios no pueden ser negativos");
        if(data.is_active < 0 || data.is_active > 1) data.is_active = 1;

        //Conversion de tipos de datos
        data.image = '';
        data.stock_min = Number(data.stock_min);
        data.price_in = Number(data.price_in);
        data.price_shop = Number(data.price_shop);
        data.provider_id = Number(data.provider_id);
        data.category_id = Number(data.category_id);
        data.is_active = Number(data.is_active !== undefined ? data.is_active : 1);

        return await productService.updateProduct(Number(id), data);
    } catch (error) {
        throw new Error(error || "Error al registrar el nuevo producto");
    }
}

/**
 * Elimina un producto del sistema
 * @param {Number} id //id del producto
 * @returns {boolean} true/false en cada caso
 */
async function deleteProduct(id) {
    try {
        if (!id || id < 0)throw new Error("No se proporciono el Producto a eliminar");
        return await productService.deleteProduct(Number(id));
    } catch (error) {
        throw new Error("Error al eliminar el producto: " + error);
    }
}

/**
 * Obtener solo los productos de cierta categoria
 * @param {*} id id de la categoria
 * @returns {[{id, image, barcode, name, description, stock_min, price_in, price_shop, unit, presentation, provider_id, category_id, is_active, created_at }]} array con los datos del producto registrado
 */
async function getProductsByCategory(id) {
    try {
        if (!id || id < 0)throw new Error("No se proporciono la categoria.");

        return await productService.getProductsByCategory(Number(id));
    } catch (error) {
        throw new Error("Error al obtener los productos: " + error);
    }
}

/**
 * Obtener la lista de productos de cierto proveedor
 * @param {*} id id del proveedor
 */
async function getProductsByProvider(id) {
    try {
        if (!id || id < 0)throw new Error("No se proporciono el proveedor.");

        return await productService.getProductsByProvider(Number(id));
    } catch (error) {
        throw new Error("Error al obtener los productos: " + error);
    }
}

/**
 * Obtiene la lista de lotes con stock de un producto en especifico
 * @param {Number} id id del producto
 */
async function getLotsByProduct(id, q, limit, currentPage) {
    try {
        if (!id || id < 0)throw new Error("No se proporciono el lote a obtener");
        return await lotService.getLotsByProduct(Number(id), q, limit, currentPage);
    } catch (error) {
        throw new Error('Error al obtener los lotes del producto: ' + error);
    }
}

/**
 * Registrar la salida de stock de un producto
 * @param {Number} id id del producto
 * @param {Number} quantity cantidad de stock a restar 
 */
async function outStockByProduct(id, quantity) {
    try {
        if (!id || id < 0)throw new Error("No se proporciono el Producto a actualizar");

        return await productService.outStockByProduct(Number(id), Number(quantity));
    } catch (error) {
        throw new Error(error)
    }
}

/**
 * Obtener el total de stock de un producto
 * @param {*} id //id de producto
 * @returns {Number} //Cantidad total de stock
 */
async function count_stock_by_product(id) {
    try {
        if (!id || id < 0)throw new Error("No se proporciono el Producto a verificar.");

        return await lotService.countStockByProduct(Number(id));
    } catch (error) {
        throw new Error('Error al obtener el stock')
    }
}