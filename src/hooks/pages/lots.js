class LotsPage {
    /**
     * Renderizar la informacion de los Lotes de cada producto en el Stock
     * @param {*} container 
     * @param {*} params 
     */
    async logicLotsPage(container, params) {

        //id del producto que se va mostrar la información
        const productId = params.productId || getParam('productId');
        let product = {};
        try {
            //obtener los datos del producto en base a su ID en el sistema
            product = await getProductById(Number(productId));
        } catch (error) {
            showToast("Error al obtener los datos del producto actual", 'danger')
        }
        //aplicar nombre y descripcion del producto en el titulo
        const title = container.querySelector('.titles');
        title.querySelector('h1').textContent = `${product.name}`;
        title.querySelector('h1').style.textDecoration = product.is_active ? '' : 'line-through';
        title.querySelector('p').textContent = `${product.is_active ? product.description : 'El producto ya no está activo'}`;

        //funcion para generar la tabla en base a la informacion de la base de datos
        async function getData(search = searchData, limit, currentPage) {
            //Obtiene la lista de lotes del producto registrados en el sistema
            //El backend retorna un objeto paginado: { lots, total, limit, currentPage, totalPages }
            const data = await getLotsByProduct(Number(productId), search, limit, currentPage) || {};
            //retorna la estructura de como se genera la tabla
            return {
                title: `Lotes del producto en bodega`,//titulo
                limit: data.limit,
                totalPages: data.totalPages,
                currentPage: data.currentPage || 1,
                includeId: true,
                columns: [//columnas que se muestran en la tabla
                    { header: "ID", field: "id" },
                    { header: "Numero de lote", field: "lot_num", },
                    { header: "Stock", field: "stock" },
                    { header: "Fecha de caducidad", field: "expiration_date" },
                    { header: "Fecha de entrada a bodega", field: "date_entry", formatter: (val) => `${dayjs.utc(val).format("DD/MM/YYYY") || ''}` },
                    { header: "Fecha de registro", field: "created_at", formatter: (val) => `${dayjs.utc(val).tz('America/Mexico_City').format("DD/MM/YYYY HH:mm") || ''}` }
                ],
                data: Array.isArray(data.lots) ? data.lots : [],//informacion del cuerpo de la tabla
                actions: [
                    {//editar la informacion de un lote
                        name: "edit",
                        title: "Editar lote",
                        className: "btn-edit square",
                        html: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-edit"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1" /><path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415" /><path d="M16 5l3 3" /></svg>`,
                        disabled: product.is_active ? false : true,
                        onClick: async (item, index) => {
                            try {
                                const updateProduct = await getProductById(Number(item.product_id));
                                let currentProviderName = '';
                                if (updateProduct?.provider_id) {
                                    try {
                                        const prov = await providerService.getProvider(updateProduct.provider_id);
                                        if (prov && prov.name) currentProviderName = prov.name;
                                    } catch (e) {
                                        console.error("Error al obtener producto:", e);
                                    }
                                }

                                const modalData = await drawerHandler.callDrawerForm({
                                    title: "Ajustar lote",
                                    description: "Ajuste o actualizacion de la informacion en el lote, se registra la operacion como 'ajuste'",
                                    formContent: [
                                        {
                                            name: "product_id",
                                            type: "hidden",
                                            value: updateProduct.product_id,
                                            required: true
                                        }, {
                                            name: "product_name",
                                            label: "Nombre del producto",
                                            type: "text",
                                            disabled: true,
                                            value: updateProduct.name
                                        }, {
                                            name: "lot_num",
                                            label: 'Numero de lote',
                                            placeholder: 'Numero de el lote en stock, ej. U-701',
                                            type: "text",
                                            value: item.lot_num,
                                            required: true
                                        }, {
                                            name: "stock",
                                            label: 'Cantidad de stock que entra',
                                            placeholder: 'Cantidad de producto en el Lote',
                                            type: "number",
                                            value: item.stock,
                                            required: true
                                        },
                                        {
                                            name: "expiration_date",
                                            label: 'Fecha de vencimiento',
                                            placeholder: '(Opcional)Fecha de consumo preferente del producto',
                                            type: "date",
                                            value: item.expiration_date,
                                        }, {
                                            name: "date_entry",
                                            label: 'Fecha de entrada',
                                            placeholder: 'Fecha en la que ingreso el lote a bodega',
                                            type: "date",
                                            value: item.date_entry,
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
                                //actualizar la informacion
                                await updateLot(item.id, modalData);
                                await loadLotsPage(currentSearch, 1, currentLimit);
                                showToast(`Lote "${modalData.lot_num}" actualizado correctamente`, "success");
                            } catch (error) {
                                showToast(error || "Error al obtener los datos del producto", "danger");
                            }
                        }
                    },
                ]
            };
        }

        //construir la tabla de Lotes
        const tableHandler = new TableHandler();
        const paginationHandler = new PaginationHandler();
        let currentPage = 1;//pagina actual
        let currentLimit = 10;//limite de items en la tabla
        let currentSearch = '';//terminos de busqueda en la tabla

        //cargar los la informacion de la tabla asi como la paginacion
        async function loadLotsPage(searchData = '', page = 1, limit = currentLimit) {
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
                    await loadLotsPage(currentSearch, newPage, limit);
                }
            });
        }

        /**
         * Seccion para busqueda
         */
        const searchHandler = new SearchHandler();
        searchHandler.renderSearch({ showAllow: true, placeholder: 'Buscar por Numero de lote o ID' });
        searchHandler.on('submit', async (search) => {
            currentSearch = search.value;
            await loadLotsPage(currentSearch, 1, currentLimit);
        });

        const elInput = document.getElementById('fecha-input');
        const elLabel = document.querySelector('label[for="fecha-input"]');

        elLabel.addEventListener('click', (e) => {
            e.preventDefault();

            if (typeof elInput.showPicker === 'function') {
                elInput.showPicker();
            } else {
                elInput.focus();
            }
        });

        elInput.addEventListener('change', async (e) => {
            if (e.target.value) {
                currentSearch = e.target.value;
                await loadLotsPage(currentSearch, 1, currentLimit);
            }
        });

        //Cargar los datos de la tabla al iniciar la pagina
        await loadLotsPage(currentSearch, 1, currentLimit);

        /**
         * Registrar la entrada de stock de un producto
         */
        const btnAddStockModal = document.getElementById("add-lot-modal")
        btnAddStockModal.style.pointerEvents = product.is_active ? 'auto' : "none";
        btnAddStockModal.style.opacity = product.is_active ? '1' : "0.5";
        btnAddStockModal.style.cursor = product.is_active ? 'pointer' : "not-allowed";

        if (btnAddStockModal && product.is_active) {
            btnAddStockModal.addEventListener('click', async (e) => {
                e.preventDefault();
                await renderFormInModal();
            });
        }

        //Funcion para mostrar la tarjeta con el formulario
        async function renderFormInModal() {
            const customModal = {
                title: "Entrada de stock",
                description: " Permite registrar el ingreso de nuevos productos al almacén por compras a proveedores, devoluciones de clientes o ajustes manuales, se registra la operacion como 'entrada'",
                formContent: [
                    {
                        name: "product_id",
                        type: "hidden",
                        value: productId,
                        required: true
                    }, {
                        name: "product_name",
                        label: "Nombre del producto al que se registra el lote",
                        type: "text",
                        readOnly: true,
                        disabled: true,
                        value: product.name
                    }, {
                        name: "lot_num",
                        label: 'Numero de lote',
                        placeholder: 'Numero de el lote en stock, ej. U-701',
                        type: "text",
                        required: true
                    }, {
                        name: "stock",
                        label: 'Cantidad de stock que entra',
                        placeholder: 'Cantidad de producto en el Lote',
                        type: "number",
                        required: true
                    },
                    {
                        name: "expiration_date",
                        label: 'Fecha de vencimiento',
                        placeholder: '(Opcional)Fecha de consumo preferente del producto',
                        type: "date",
                    }, {
                        name: "date_entry",
                        label: 'Fecha de entrada',
                        placeholder: 'Fecha en la que ingreso el lote a bodega',
                        type: "date",
                        required: true
                    }
                ],
                options: {
                    confirmText: "Registrar entrada",
                    cancelText: "Cancelar",
                    type: "primary"
                }
            };
            //Obtener los datos del formulario
            const modalData = await modalHandler.callModalForm(customModal);
            modalData.product_id = Number(modalData.product_id);
            try {
                if (!modalData) return;
                //Registro del lote en la base de datos
                await createLot(modalData);
                //Actualizar la tabla con los nuevos datos.
                await loadLotsPage(currentSearch, 1, currentLimit);
                showToast(`Lote "${modalData.lot_num}" creado correctamente`, "success");
            } catch (error) {
                console.error(error);
                showToast(error || "Error al registrar el lote" + error, "danger");
            }
        }

        /**
         * Salida de stock de un producto
         */
        const btnOutStockModal = document.getElementById("out-lot-modal")
        btnOutStockModal.style.pointerEvents = product.is_active ? 'auto' : "none";
        btnOutStockModal.style.opacity = product.is_active ? '1' : "0.5";
        btnOutStockModal.style.cursor = product.is_active ? 'pointer' : "not-allowed";
        if (btnOutStockModal && product.is_active) {
            btnOutStockModal.addEventListener('click', async (e) => {
                e.preventDefault();
                await renderFormOutModal();
            });
        }
        //funcion para mostrar la tarjeta con el formulario para registrar la salida.
        async function renderFormOutModal() {
            const customModal = {
                title: "Salida de stock",
                description: "Permite registrar la baja o retiro de productos del inventario debido a ventas, mermas, daños, robo o consumo interno, se registra la operacion como 'salida'",
                formContent: [
                    {
                        name: "product_id",
                        type: "hidden",
                        value: productId,
                        required: true
                    }, {
                        name: "product_name",
                        label: "Nombre del producto al que se registra el lote",
                        type: "text",
                        disabled: true,
                        value: product.name
                    }, {
                        name: "quantity",
                        label: 'Cantidad',
                        placeholder: 'Cantidad de producto a restar',
                        type: "number",
                        required: true
                    }
                ],
                options: {
                    confirmText: "Registrar salida",
                    cancelText: "Cancelar",
                    type: "primary"
                }
            };

            const modalData = await modalHandler.callModalForm(customModal);
            modalData.product_id = Number(modalData.product_id);// Id del producto al cual se le va a reducir el stock
            let quantity = modalData.quantity;//Cantidad a restar del stock
            try {
                //Esperamos 300ms para permitir la animacion de cierre de la tarjeta y continuar
                await new Promise((resolve) => setTimeout(resolve, 300));
                if (!modalData) return;
                //registrar la operacion 
                const outStockOperation = await outStockByProduct(modalData.product_id, quantity);
                //si ocurre algun error al registrar o si no alcanza el stock actual
                if (!outStockOperation.success && outStockOperation.status === 'INSUFFICIENT_STOCK') {
                    //Mostrar alerta
                    const continueOperation = await modalHandler.callModalConfirm('Alerta', outStockOperation.message + `, ¿Desea continuar con ${outStockOperation.stock}?`, {})
                    //
                    if (continueOperation) {
                        quantity = outStockOperation.stock;
                        await outStockByProduct(modalData.product_id, quantity);
                    } else {
                        showToast('Operacion cancelada, el stock se mantuvo intacto', 'info');
                        return;
                    }
                } else if (!outStockOperation.success && outStockOperation.status === 'NO_STOCK') {
                    showToast(outStockOperation.message || 'No hay suficiente stock para realizar la operación', 'warning');
                    return;
                }
                await loadLotsPage(currentSearch, 1, currentLimit);
                showToast(`Se registro la salida de ${quantity} de stock del producto "${product.name}".`, "success");
            } catch (error) {
                console.error(error);
                showToast("Error al registrar el lote: " + error, "danger");
            }
        }

    }
}