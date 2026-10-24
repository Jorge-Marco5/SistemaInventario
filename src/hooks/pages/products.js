class ProductsPage {
    /**
     * Logica principal para la pagina de productos
     * @param {*} container 
     * @param {*} params 
     * @returns 
     */
    async logicProductsPage(container, params) {

        let searchData = '';

        async function getData(search = searchData, limit, currentPage) {
            let data = [];
            try {
                data = await getProducts(search, limit, currentPage);
            } catch (error) {
                showToast("Error al obtener la lista de productos: " + error, 'danger');
            }

            //aplicar nombrey descripcion del producto en el titulo
            const title = container.querySelector('.titles');
            title.querySelector('h1').textContent = `Productos (${data.productsFull.length})`;

            let categoryOptions = [];
            try {
                const categories = await categoryService.getCategories('');
                if (Array.isArray(categories)) {
                    categoryOptions = categories.map((cat) => ({
                        label: cat.name,
                        value: cat.id
                    }));
                }
            } catch (error) {
                console.error("Error al cargar categorías para el formulario:", error);
            }

            return {
                title: "Lista de productos",
                limit: data.limit,
                totalPages: data.totalPages,
                currentPage: 1,
                includeId: true,
                columns: [
                    { header: "ID", field: "id" },
                    {
                        header: "Codigo de barras",
                        field: "barcode",
                    },
                    { header: "Nombre", field: "name" },
                    {
                        header: "Descripcion",
                        field: "description",
                    },
                    {
                        header: "Unidad",
                        field: "unit",
                    },
                    {
                        header: "Presentación",
                        field: "presentation",
                    },
                    {
                        header: "Stock Minimo",
                        field: "stock_min",
                    },
                    {
                        header: "Stock Total",
                        field: "stock_total",
                    },
                    {
                        header: "Precio de compra",
                        field: "price_in",
                        formatter: (val) => formatCurrency(val)
                    },
                    {
                        header: "Precio de venta",
                        field: "price_shop",
                        formatter: (val) => formatCurrency(val)
                    }
                ],
                data: data.productsFull,
                actions: [
                    {
                        name: 'admin_stock',
                        title: 'Administrar stock',
                        className: 'success square',
                        html: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-building-warehouse"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M3 21v-13l9 -4l9 4v13" /><path d="M13 13h4v8h-10v-6h6" /><path d="M13 21v-9a1 1 0 0 0 -1 -1h-2a1 1 0 0 0 -1 1v3" /></svg>`,
                        onClick: async (item, index) => {
                            navigateTo('lots', { productId: item.id, productName: item.name });
                        }
                    },
                    {
                        name: 'product_info',
                        title: 'Información del producto',
                        className: 'primary square',
                        html: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-info-circle"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" /><path d="M12 9h.01" /><path d="M11 12h1v4h1" /></svg>`,
                        onClick: async (item, index) => {
                            let provider = {};
                            let category = {};
                            if (item?.provider_id && item?.category_id) {
                                try {
                                    provider = await getProviderById(Number(item.provider_id));
                                    category = await getCategoryById(Number(item.category_id));
                                } catch (e) {
                                    console.error("Error al obtener la informacion completa:", e);
                                }
                            }

                            const options = {
                                size: 'md',
                                bodyContent: `
                                <h3>Detalles del producto:</h3>
                                <table style="margin-top:5px; min-width: 0px; table-layout: fixed;  border-collapse: collapse;">
                                    ${item.is_active ? '' : `<tr><th colspan="2" style="color:var(--danger);">El producto ya no está en activo</th></tr>`}
                                    <tr>
                                        <th colspan="2">Nombre del producto</th>
                                    </tr>
                                    <tr>
                                        <td colspan="2">${item.name || 'Sin nombre del producto'}</td>
                                    </tr>
                                    <tr>
                                        <th colspan="2">Descripción del producto</th>
                                    </tr>    
                                    <tr>
                                        <td colspan="2">${item.description || 'Sin descripcion del producto'}</td>
                                    </tr>
                                    <tr>
                                        <th colspan="2">Codigo de barras</tg>
                                    </tr>    
                                    <tr>
                                        <td colspan="2">${item.barcode || 'Sin codigo de barras'}</td>
                                    </tr>
                                    <tr>
                                        <th colspan="2">Categoria</tg>
                                    </tr>  
                                    <tr>
                                        <td colspan="2">${category.name || 'Sin categoria'}</td>
                                    </tr>
                                    <tr>
                                        <th>Unidad</th>
                                        <th>Presentación</th>
                                    </tr>    
                                    <tr>
                                        <td>${item.unit || ''}</td>
                                        <td>${item.presentation || ''}</td>
                                    </tr>
                                    <tr>
                                        <th>Stock total</th>
                                        <th>Stock minimo</td>
                                    </tr>    
                                    <tr>
                                        <td>${item.stock_total || '0'}</td>
                                        <td>${item.stock_min || '0'}</td>
                                    </tr>
                                </table>
                                <br>
                                <h3>Precios del producto:</h3>
                                <table style="margin-top:5px; min-width: 0px; table-layout: fixed;  border-collapse: collapse;">
                                    <tr>
                                        <th>Precio de compra</th>
                                        <th>Precio de venta</th>
                                    </tr>    
                                    <tr>
                                        <td>${formatCurrency(item.price_in) || '$0.00'}</td>
                                        <td>${formatCurrency(item.price_shop) || '$0.00'}</td>
                                    </tr>
                                </table>
                                <br>
                                <h3>Detalles del proveedor:</h3>
                                <table style="margin-top:5px; min-width: 0px; table-layout: fixed;  border-collapse: collapse;">
                                    <tr>
                                        <th colspan="2">Nombre del proveedor</th>
                                    </tr>    
                                    <tr>
                                        <td colspan="2">${provider.name || 'Sin nombre del proveedor'}</td>
                                    </tr>
                                    <tr>
                                        <th colspan="2">Numero de telefono</th>
                                    </tr>    
                                    <tr>
                                        <td colspan="2">${provider.phone1 || 'Sin numero de telefono'}</td>
                                    </tr>
                                    <tr>
                                        <th colspan="2">Correo Electronico</th>
                                    </tr>    
                                    <tr>
                                        <td colspan="2">${provider.email1 || 'Sin correo electronico'}</td>
                                    </tr>
                                </table>
                                `
                            }

                            await modalHandler.callModalMessage(`Informacion del producto`,
                                "", options)
                        }
                    },
                    {
                        name: "edit",
                        title: "Editar producto",
                        className: "btn-edit square",
                        html: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-edit"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1" /><path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415" /><path d="M16 5l3 3" /></svg>`,
                        onClick: async (item, index) => {
                            try {
                                const product = await getProductById(item.id.toString());
                                let currentProviderName = '';
                                if (product?.provider_id) {
                                    try {
                                        const prov = await providerService.getProvider(product.provider_id);
                                        if (prov && prov.name) currentProviderName = prov.name;
                                    } catch (e) {
                                        console.error("Error al obtener proveedor:", e);
                                    }
                                }

                                const modalData = await drawerHandler.callDrawerForm({
                                    title: "Actualizar producto",
                                    description: "Actualización de la información del producto",
                                    formContent: [
                                        {
                                            name: "barcode",
                                            label: "Codigo de barras",
                                            placeholder: "Codigo de barras del producto",
                                            type: "text",
                                            value: product.barcode,
                                            required: true
                                        },
                                        {
                                            name: "name",
                                            label: "Nombre",
                                            placeholder: "Nombre del producto",
                                            type: "text",
                                            value: product.name,
                                            required: true
                                        },
                                        {
                                            name: "description",
                                            label: "Descripción",
                                            placeholder: "Descripcion del producto",
                                            type: "text",
                                            value: product.description,
                                            required: true
                                        },
                                        {
                                            name: "stock_min",
                                            label: "Stock minimo",
                                            placeholder: "Stock minimo del producto en bodega",
                                            type: "number",
                                            min: "0",
                                            value: product.stock_min,
                                            required: true
                                        },
                                        {
                                            name: "price_in",
                                            label: "Precio de compra",
                                            placeholder: "Precio de compra al proveedor",
                                            type: "number",
                                            step: "0.01",
                                            min: "0",
                                            value: product.price_in,
                                            required: true
                                        },
                                        {
                                            name: "price_shop",
                                            label: "Precio de venta",
                                            placeholder: "Precio de venta al publico",
                                            type: "number",
                                            step: "0.01",
                                            min: "0",
                                            value: product.price_shop,
                                            required: true
                                        },
                                        {
                                            name: "unit",
                                            label: "Tipo de Unidades",
                                            placeholder: "Pieza, Kilos, Litros",
                                            type: "select",
                                            options: [{ label: 'Bolsa', value: 'Bolsa' }, { label: 'Botella', value: 'Botella' }, { label: 'Caja', value: 'Caja' }, { label: 'Kg', value: 'Kg' }, { label: 'Litro', value: 'Litro' }, { label: 'Pieza', value: 'Pieza' }],
                                            value: product.unit,
                                            required: true
                                        },
                                        {
                                            name: "presentation",
                                            label: "Presentación",
                                            placeholder: "Empaque, Botella, Bolsa, Caja",
                                            type: "select",
                                            options: [{ label: 'Botella', value: 'Botella' }, { label: 'Bolsa', value: 'Bolsa' }, { label: 'Caja', value: 'Caja' }, { label: 'Empaque', value: 'Empaque' }, { label: 'Envase', value: 'Envase' }, { label: 'Estuche', value: 'Estuche' }, { label: 'Paquete', value: 'Paquete' },],
                                            value: product.presentation,
                                            required: true
                                        },
                                        {
                                            name: "provider_id",
                                            label: "Proveedor",
                                            placeholder: "Escribe el nombre del proveedor...",
                                            type: "autocomplete",
                                            valueType: "number",
                                            value: product.provider_id,
                                            initialLabel: currentProviderName,
                                            required: true,
                                            onSearch: async (query) => {
                                                try {
                                                    const res = await providerService.getProviders(query, 8, 1);
                                                    const providers = res?.providers || [];
                                                    return providers.map((prov) => ({
                                                        label: prov.name,
                                                        value: prov.id,
                                                        hint: prov.phone1 || prov.email1 || ''
                                                    }));
                                                } catch (err) {
                                                    console.error("Error al buscar proveedores:", err);
                                                    return [];
                                                }
                                            }
                                        },
                                        {
                                            name: "category_id",
                                            label: "Categoría",
                                            placeholder: "Selecciona una categoría",
                                            type: "select",
                                            options: categoryOptions,
                                            value: product.category_id,
                                            valueType: "number",
                                            required: true
                                        },
                                        {
                                            name: "is_active",
                                            label: "Estado",
                                            type: "select",
                                            options: [
                                                { label: "Activo", value: 1 },
                                                { label: "Inactivo", value: 0 }
                                            ],
                                            value: product.is_active,
                                            valueType: "number",
                                            required: true
                                        }
                                    ],
                                    options: {
                                        confirmText: "Actualizar",
                                        cancelText: "Cancelar",
                                        type: "primary",
                                    }
                                });
                                if (!modalData) return;
                                await updateProduct(item.id.toString(), modalData);
                                await loadProductsPage(currentSearch, 1, currentLimit);
                                showToast(`Producto "${modalData.name}" actualizado correctamente`, "success");
                            } catch (error) {
                                showToast(error || "Error al obtener los datos del producto", "danger");
                            }
                        }
                    },
                    {
                        name: "delete",
                        title: "Eliminar producto",
                        className: "btn-delete square",
                        html: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-trash"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M4 7l16 0" /><path d="M10 11l0 6" /><path d="M14 11l0 6" /><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" /><path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" /></svg>`,
                        onClick: async (item, index) => {
                            const options = {
                                type: "danger",          // Pone el botón en rojo
                                confirmText: "Eliminar", // Texto del botón afirmativo
                                cancelText: "Cancelar",    // Texto del botón negativo
                                size: "sm"               // Tamaño compacto para diálogos
                            }
                            if (await modalHandler.callModalConfirm('Eliminar producto', '¿Desea eliminar el producto del sistema?. Esta acción no se puede deshacer.', options)) {
                                try {
                                    const res = await deleteProduct(item.id.toString());
                                    showToast(res || `Producto '${item.name}' eliminado correctamente`, "success")
                                    await loadProductsPage(currentSearch, 1, currentLimit);
                                } catch (error) {
                                    showToast(error || "Error al eliminar el producto", "danger")
                                }
                            }
                        }
                    }
                ]
            };
        }

        const tableHandler = new TableHandler();
        const paginationHandler = new PaginationHandler();
        let currentPage = 1;
        let currentLimit = 10;
        let currentSearch = '';

        //cargar los datos de productos
        async function loadProductsPage(searchData = '', page = 1, limit = currentLimit) {
            currentPage = page;
            currentLimit = limit;
            const data = await getData(searchData, currentLimit, currentPage);
            tableHandler.renderTable(data);
            paginationHandler.renderPagination({
                totalPages: data.totalPages || 1,
                currentPage: currentPage,
                limit: currentLimit,
                config: {
                    includeLimit: true,
                    limits: [10, 30, 50, 100, 150]
                },
                onPageChange: async ({ newPage, limit }) => {
                    await loadProductsPage(currentSearch, newPage, limit);
                }
            });
        }

        /**
         * Busqueda de productos
         */
        const searchHandler = new SearchHandler();
        const configSearch = {
            showAllow: true
        }
        searchHandler.renderSearch(configSearch);
        
        if (params.search) {
            currentSearch = params.search;
        }
        searchHandler.on('submit', async (search) => {
            currentSearch = search.value;
            await loadProductsPage(currentSearch, 1, currentLimit);
        });

        const elInput = document.getElementById('fecha-input');
        const elLabel = document.querySelector('label[for="fecha-input"]');

        const fp = flatpickr(elInput, {
            locale: "es",            // Idioma en español
            dateFormat: "Y-m-d",     // Formato estándar ISO (igual al input date nativo)
            disableMobile: true,     // Evita que intente abrir menús nativos del sistema
            positionElement: elLabel, // Ancla el calendario al botón/label
            clickOpens: false,       // Apertura controlada manualmente por el label
            onChange: async (selectedDates, dateStr) => {
                if (dateStr) {
                    currentSearch = dateStr;
                    await loadProductsPage(currentSearch, 1, currentLimit);
                }
            }
        });

        elLabel.addEventListener('click', (e) => {
            e.preventDefault();
            fp.toggle();
        });

        /**
         * Cargar los datos al ingresar
         */
        await loadProductsPage(currentSearch, 1, currentLimit);

        /**
         * Modal para agregar nuevos productos
         */
        const btnAddProductModal = document.getElementById("add-product-modal")
        if (btnAddProductModal) {
            btnAddProductModal.addEventListener('click', async (e) => {
                e.preventDefault();
                await renderFormAddProduct();
            });
        }

        async function renderFormAddProduct() {
            let categoryOptions = [];
            try {
                const categories = await categoryService.getCategories('');
                if (Array.isArray(categories)) {
                    categoryOptions = categories.map((cat) => ({
                        label: cat.name,
                        value: cat.id
                    }));
                }
            } catch (error) {
                console.error("Error al cargar categorías para el formulario:", error);
            }

            const customModal = {
                title: "Nuevo producto",
                description: "Registro de un nuevo producto",
                formContent: [
                    {
                        name: "barcode",
                        label: "Codigo de barras",
                        placeholder: "Codigo de barras del producto",
                        type: "text",
                        required: true
                    },
                    {
                        name: "name",
                        label: "Nombre",
                        placeholder: "Nombre del producto",
                        type: "text",
                        required: true
                    },
                    {
                        name: "description",
                        label: "Descripción",
                        placeholder: "Descripcion del producto",
                        type: "text",
                        required: true
                    },
                    {
                        name: "stock_min",
                        label: "Stock minimo",
                        placeholder: "Stock minimo del producto en bodega",
                        type: "number",
                        min: "0",
                        required: true
                    },
                    {
                        name: "price_in",
                        label: "Precio de compra",
                        placeholder: "Precio de compra al proveedor",
                        type: "number",
                        step: "0.01",
                        min: "0",
                        required: true
                    },
                    {
                        name: "price_shop",
                        label: "Precio de venta",
                        placeholder: "Precio de venta al publico",
                        type: "number",
                        step: "0.01",
                        min: "0",
                        required: true
                    },
                    {
                        name: "unit",
                        label: "Tipo de Unidades",
                        placeholder: "Pieza, Kilos, Litros",
                        type: "select",
                        options: [{ label: 'Bolsa', value: 'Bolsa' }, { label: 'Botella', value: 'Botella' }, { label: 'Caja', value: 'Caja' }, { label: 'Kg', value: 'Kg' }, { label: 'Litro', value: 'Litro' }, { label: 'Pieza', value: 'Pieza' }],
                        required: true
                    },
                    {
                        name: "presentation",
                        label: "Presentación",
                        placeholder: "Empaque, Botella, Bolsa, Caja",
                        type: "select",
                        options: [{ label: 'Botella', value: 'Botella' }, { label: 'Bolsa', value: 'Bolsa' }, { label: 'Caja', value: 'Caja' }, { label: 'Empaque', value: 'Empaque' }, { label: 'Envase', value: 'Envase' }, { label: 'Estuche', value: 'Estuche' }, { label: 'Paquete', value: 'Paquete' },],
                        required: true
                    },
                    {
                        name: "provider_id",
                        label: "Proveedor",
                        placeholder: "Escribe el nombre del proveedor...",
                        type: "autocomplete",
                        valueType: "number",
                        required: true,
                        onSearch: async (query) => {
                            try {
                                const res = await providerService.getProviders(query, 8, 1);
                                const providers = res?.providers || [];
                                return providers.map((prov) => ({
                                    label: prov.name,
                                    value: prov.id,
                                    hint: prov.phone1 || prov.email1 || ''
                                }));
                            } catch (err) {
                                console.error("Error al buscar proveedores:", err);
                                return [];
                            }
                        }
                    },
                    {
                        name: "category_id",
                        label: "Categoría",
                        placeholder: "Selecciona una categoría",
                        type: "select",
                        options: categoryOptions,
                        valueType: "number",
                        required: true
                    },
                    {
                        name: "is_active",
                        label: "Estado",
                        type: "select",
                        options: [
                            { label: "Activo", value: 1 },
                            { label: "Inactivo", value: 0 }
                        ],
                        value: 1,
                        valueType: "number",
                        required: true
                    }
                ],
                options: {
                    confirmText: "Crear producto",
                    cancelText: "Cancelar",
                    type: "primary"
                }
            };

            const modalData = await modalHandler.callModalForm(customModal);
            try {
                if (!modalData) return;
                await createProduct(modalData);
                await loadProductsPage(currentSearch, 1, currentLimit);
                showToast(`Producto "${modalData.name}" creado correctamente`, "success");
            } catch (error) {
                console.error(error);
                showToast("Error al crear el producto: " + error, "danger");
            }
        }

        // Función de limpieza al desmontar este template
        return () => {
            fp?.destroy?.();
            searchHandler?.destroy?.();
            tableHandler?.destroy?.();
            paginationHandler?.destroy?.();
        };
    }
}