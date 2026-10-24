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
                            let priceMessage = '';
                            let quantityMessage = '';
                            const unitPrice = formatCurrency(item.price, true);
                            const totalAmount = formatCurrency(Number(item.price) * Number(item.q), true);

                            if (item.operation_name === 'entrada') {
                                priceMessage = 'Precio unitario de proveedor';
                                quantityMessage = 'Cant. comprada';
                                sign = '<span style="color:var(--success);">+</span>';
                                operationName = `<span style="font-weight:bold; color:var(--success);">${item.operation_name.toUpperCase()}</span>`;
                            } else if (item.operation_name === 'salida') {
                                priceMessage = 'Precio unitario de venta';
                                quantityMessage = 'Cant. vendida';
                                sign = '<span style="color:var(--danger);">-</span>';
                                operationName = `<span style="font-weight:bold; color:var(--danger);">${item.operation_name.toUpperCase()}</span>`;
                            } else if (item.operation_name === 'ajuste') {
                                priceMessage = 'Precio unitario en el momento';
                                quantityMessage = 'Cant. ajustada';
                                sign = '<span style="color: var(--info);">=</span>';
                                operationName = `<span style="font-weight:bold; color:var(--info);">${item.operation_name.toUpperCase()}</span>`;
                            }

                            const options = {
                                size: 'lg',
                                bodyContent: `
                                <table style="margin-top:5px; min-width: 0px; border-collapse: collapse;">
                                    <tr>
                                        <th colspan="3">Tipo de operacion</th>
                                    </tr>
                                    <tr>
                                        <td colspan="3">${operationName}</td>
                                    </tr>
                                    <tr>
                                        <th>Producto</th>
                                        <th>${quantityMessage}</th>
                                        <th>${priceMessage}</th>
                                    </tr>    
                                    <tr>
                                        <td>${product.barcode + ' - ' + product.name || 'Sin nombre del producto'}</td>
                                        <td><span style="font-size:1.3rem; font-weight: bold;">${sign} ${item.q}</span></td>
                                        <td>${unitPrice}</td>
                                    </tr>
                                    <tr></tr>
                                    <tr>
                                        <th colspan="2" style="background-color:var(--background-color-secondary);">Precio Total</th>
                                        <td>${totalAmount}</td>
                                    </tr>
                                    <tr>
                                        <th colspan="3">Descripcion de la operacion</th>
                                    </tr>
                                    <tr>
                                        <td colspan="3" style="text-align: start; white-space: inherit; overflow: auto; text-overflow: ellipsis;">${item.description}</td>
                                    </tr>
                                    <tr>
                                        <th colspan="3">Fecha</th>
                                    </tr>
                                    <tr>
                                        <td colspan="3">${dayjs.utc(item.created_at).tz('America/Mexico_City').format("DD/MM/YYYY HH:mm")}</td>
                                    </tr>
                                </table>
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

        const fp = flatpickr(elInput, {
            locale: "es",
            dateFormat: "Y-m-d",
            disableMobile: true,
            positionElement: elLabel,
            clickOpens: false,
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
         * Cargar los datos al entrar a la pagina
         */
        await loadProductsPage(currentSearch, 1, currentLimit);

        // Función de limpieza al desmontar este template
        return () => {
            fp?.destroy?.();
            searchHandler?.destroy?.();
            tableHandler?.destroy?.();
            paginationHandler?.destroy?.();
        };
    }
}