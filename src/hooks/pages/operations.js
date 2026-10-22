class OperationsPage {
    async logicOperationsPage(container, params) {
        let searchData = '';

        async function getData(search = searchData, limit, currentPage) {
            const data = await getAllOperations(search, limit, currentPage);

            return {
                title: "Lista de operaciones",
                limit: data.limit,
                totalPages: data.totalPages,
                currentPage: 1,
                includeId: true,
                columns: [
                    { header: "ID", field: "id" },
                    { header: "Codigo de barras", field: "product_barcode" },
                    { header: "Nombre del producto", field: "product_name" },
                    {
                        header: "Cantidad",
                        field: "q",
                    },
                    {
                        header: "Precio individual",
                        field: "price",
                        formatter: (val) => formatCurrency(val, true)
                    },
                    {
                        header: "Tipo de operacion",
                        field: "operation_name",
                        type: "badge",
                        badgeMap: {
                            "entrada": { variant: "success", label: "Entrada", dot: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-chevrons-up"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M7 11l5 -5l5 5" /><path d="M7 17l5 -5l5 5" /></svg>` },
                            "salida": { variant: "danger", label: "Salida", dot: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-chevrons-down"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M7 7l5 5l5 -5" /><path d="M7 13l5 5l5 -5" /></svg>` },
                            "ajuste": { variant: "secondary", label: "Ajuste", dot: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-settings"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065" /><path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" /></svg>` }
                        },
                        dot: false
                    },
                    {
                        header: "Descripción",
                        field: "description",
                        formatter: (val) => val || '-'
                    },
                    {
                        header: "Id de venta",
                        field: "sell_id",
                    },
                    {
                        header: "Fecha de registro",
                        field: "created_at",
                        formatter: (val) => `${dayjs.utc(val).tz('America/Mexico_City').format("DD/MM/YYYY HH:mm") || ''}`
                    }
                ],
                data: data.operations,
                actions: [
                    {
                        name: 'operation_details',
                        title: 'Detalles de la operación',
                        className: 'info square',
                        html: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-list-details"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M13 5h8" /><path d="M13 9h5" /><path d="M13 15h8" /><path d="M13 19h5" /><path d="M3 5a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -4" /><path d="M3 15a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -4" /></svg>`,
                        onClick: async (item, index) => {
                            const product = await getProductById(Number(item.product_id));
                            if (product?.provider_id) {
                                try {
                                    const provider = await getProviderById(Number(product.provider_id));
                                } catch (e) {
                                    console.error("Error al obtener proveedor:", e);
                                }
                            }
                            let operationName = '';
                            let sign = '';
                            let prices = '';
                            const unitPrice = formatCurrency(item.price, true);
                            const totalAmount = formatCurrency(Number(item.price) * Number(item.q), true);

                            if (item.operation_name === 'entrada') {
                                sign = '<span style="color:var(--success);">+</span>';
                                operationName = `<span style="font-weight:bold; color:var(--success);">${item.operation_name.toUpperCase()}</span>`;
                                prices = `<p>Precio unitario de compra al proveedor</p>
                                <h4 style="font-size:1.2rem;">${unitPrice}</h4>
                                <br>
                                <p>Total de la operación</p>
                                <h4 style="font-size:1.2rem;">${totalAmount}</h4>`;
                            } else if (item.operation_name === 'salida') {
                                sign = '<span style="color:var(--danger);">-</span>';
                                operationName = `<span style="font-weight:bold; color:var(--danger);">${item.operation_name.toUpperCase()}</span>`;
                                prices = `<p>Precio unitario de venta al publico</p>
                                <h4 style="font-size:1.2rem;">${unitPrice}</h4>
                                <br>
                                <p>Total de la operación</p>
                                <h4 style="font-size:1.2rem;">${totalAmount}</h4>`;
                            } else if (item.operation_name === 'ajuste') {
                                sign = '<span style="color: var(--info);">=</span>';
                                operationName = `<span style="font-weight:bold; color:var(--info);">${item.operation_name.toUpperCase()}</span>`;
                                prices = `<p>Precio unitario de venta al momento de la operación</p>
                                <h4 style="font-size:1.2rem;">${unitPrice}</h4>
                                <br>
                                <p>Total de la operación</p>
                                <h4 style="font-size:1.2rem;">${totalAmount}</h4>`;
                            }
                            console.log(item)

                            const options = {
                                size: 'md',
                                bodyContent: `
                                <p>Producto - Cantidad</p>
                                <h4 style="width:100%; display:flex; flex-direction: row; align-items: center; justify-content: space-between;">${product.barcode} - ${product.name} <span style="font-size:1.3rem; "><strong>${sign} ${item.q}</strong></span></h4>
                                <br>
                                ${prices}
                                <br>
                                <p>Operación</p>
                                <h4 style="font-size:1.2rem;">${operationName}</h4>
                                <br>
                                <p>Descripcion de la Operación</p>
                                <h4 style="font-size:1rem;">${item.description || 'No hay descripcion de la operacion'}</h4>
                                <br>
                                <p>Fecha</p>
                                <h4 style="font-size:1.2rem;">${dayjs.utc(item.created_at).tz('America/Mexico_City').format("DD/MM/YYYY HH:mm")}</h4>
                                `
                            }

                            await modalHandler.callModalMessage(`Detalles de la operacion: ${item.id}`,
                                "", options)
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

        /**
         * Cargar los datos de los productos
         * @param {*} searchData 
         * @param {*} page 
         * @param {*} limit 
         */
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
         * Busqueda de operaciones
         */
        const searchHandler = new SearchHandler();
        const configSearch = {
            showAllow: true
        }
        searchHandler.renderSearch(configSearch);

        searchHandler.on('submit', async (search) => {
            currentSearch = search.value;
            await loadProductsPage(currentSearch, 1, currentLimit);
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
                await loadProductsPage(currentSearch, 1, currentLimit);
            }
        });

        /**
         * Cargar los datos al entrar a la pagina
         */
        await loadProductsPage(currentSearch, 1, currentLimit);

        // Función de limpieza al desmontar este template
        return () => {
            searchHandler?.destroy?.();
            tableHandler?.destroy?.();
            paginationHandler?.destroy?.();
        };
    }
}