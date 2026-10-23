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
        if (!product_id) {
            return
        }
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
        if (!data) {
            return;
        }
        //pasar como valores numericos
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
        //salir si no existen datos
        if (!data) {
            return;
        }
        //pasar como valores numericos
        data.image = '';
        data.stock_min = Number(data.stock_min);
        data.price_in = Number(data.price_in);
        data.price_shop = Number(data.price_shop);
        data.provider_id = Number(data.provider_id);
        data.category_id = Number(data.category_id);
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
        return await productService.deleteProduct(Number(id));
    } catch (error) {
        throw new Error("Error al eliminar el producto: " + error);
    }
}

/**
 * Obtener solo los productos de cierta categoria
 * @param {*} category_id id de la categoria
 * @returns {[{id, image, barcode, name, description, stock_min, price_in, price_shop, unit, presentation, provider_id, category_id, is_active, created_at }]} array con los datos del producto registrado
 */
async function getProductsByCategory(category_id) {
    try {
        if (!category_id) {
            return
        }
        return await productService.getProductsByCategory(Number(category_id));
    } catch (error) {
        throw new Error("Error al obtener los productos: " + error);
    }
}

/**
 * Obtener la lista de productos de cierto proveedor
 * @param {*} provider_id id del proveedor
 */
async function getProductsByProvider(provider_id) {
    try {
        if (!provider_id) {
            return
        }
        return await productService.getProductsByProvider(Number(provider_id));
    } catch (error) {
        throw new Error("Error al obtener los productos: " + error);
    }
}

/**
 * Obtiene la lista de lotes con stock de un producto en especifico
 * @param {Number} product_id id del producto
 */
async function getLotsByProduct(product_id, q, limit, currentPage) {
    try {
        return await lotService.getLotsByProduct(product_id, q, limit, currentPage);
    } catch (error) {
        throw new Error('Error al obtener los lotes del producto: ' + error);
    }
}

/**
 * Registrar la salida de stock de un producto
 * @param {Number} product_id id del producto
 * @param {Number} quantity cantidad de stock a restar 
 */
async function outStockByProduct(product_id, quantity) {
    try {
        if (!product_id || !quantity) {
            return
        }
        return await productService.outStockByProduct(Number(product_id), Number(quantity));
    } catch (error) {
        throw new Error(error)
    }
}

/**
 * Obtener el total de stock de un producto
 * @param {*} product_id //id de producto
 * @returns {Number} //Cantidad total de stock
 */
async function count_stock_by_product(product_id) {
    try {
        if (!product_id) {
            return
        }
        return await lotService.countStockByProduct(Number(product_id));
    } catch (error) {
        throw new Error('Error al obtener el stock')
    }
}