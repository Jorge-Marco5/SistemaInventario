class ProvidersPage {
    async logicProvidersPage(container, params) {
        let searchData = '';

        async function getData(search = searchData, limit, currentPage) {
            const data = await getProviders(search, limit, currentPage);
            return {
                title: "Lista de operaciones",
                limit: data.limit,
                totalPages: data.totalPages,
                currentPage: 1,
                includeId: true,
                columns: [
                    { header: "ID", field: "id" },
                    { header: "Nombre del proveedor", field: "name" },
                    {
                        header: "Numero de Tel 1",
                        field: "phone1",
                    },
                    {
                        header: "Numero de Tel 2",
                        field: "phone2",
                    },
                    {
                        header: "Correo Electronico 1",
                        field: "email1",
                    },
                    {
                        header: "Correo Electronico 2",
                        field: "email2",
                    },
                    {
                        header: "Fecha de registro",
                        field: "created_at",
                        formatter: (val) => `${dayjs.utc(val).tz('America/Mexico_City').format("DD/MM/YYYY HH:mm") || ''}`
                    }
                ],
                data: data.providers,
                actions: [
                    {
                        name: 'provider_info',
                        title: 'Informacion del proveedor',
                        className: 'primary square',
                        html: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-info-circle"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" /><path d="M12 9h.01" /><path d="M11 12h1v4h1" /></svg>`,
                        onClick: async (item, index) => {

                            const options = {
                                size: 'md',
                                bodyContent: `
                                <table style="margin-top:5px; min-width: 0px; table-layout: fixed;  border-collapse: collapse;">
                                    <tr>
                                        <th colspan="2">Nombre del proveedor</th>
                                    </tr>    
                                    <tr>
                                        <td colspan="2">${item.name || 'Sin nombre del proveedor'}</td>
                                    </tr>
                                </table>
                                <br>
                                <h3>Contacto:</h3>
                                <table style="margin-top:5px; min-width: 0px; table-layout: fixed;  border-collapse: collapse;">
                                    <tr>
                                        <th colspan="2" style="text-align:start;">Numero de Telefono</th>
                                    </tr>    
                                    <tr>
                                        <td colspan="2">${item.phone1 || 'Sin numero de telefono'}</td>
                                    </tr>
                                    <tr>
                                        <th colspan="2" style="text-align:start;">Numero de Telefono 2</th>
                                    </tr>    
                                    <tr>
                                        <td colspan="2">${item.phone2 || 'Sin numero de telefono'}</td>
                                    </tr>
                                    <tr>
                                        <th colspan="2" style="text-align:start;">Correo Electronico</th>
                                    </tr>    
                                    <tr>
                                        <td colspan="2">${item.email1 || 'Sin correo electronico'}</td>
                                    </tr>
                                    <tr>
                                        <th colspan="2" style="text-align:start;">Correo Electronico 2</th>
                                    </tr>    
                                    <tr>
                                        <td colspan="2">${item.email2 || 'Sin correo electronico'}</td>
                                    </tr>
                                </table>
                                `
                            }

                            await modalHandler.callModalMessage(`Informacion del proveedor`,
                                "", options)
                        }
                    },
                    {
                        name: "edit",
                        title: "Editar proveedor",
                        className: "btn-edit square",
                        html: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-edit"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1" /><path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415" /><path d="M16 5l3 3" /></svg>`,
                        onClick: async (item, index) => {
                            try {

                                const modalData = await drawerHandler.callDrawerForm({
                                    title: "Actualizar Proveedor",
                                    description: "Actualización de la información de un proveedor",
                                    formContent: [
                                        {
                                            name: "name",
                                            label: "Nombre del proveedor",
                                            placeholder: "Coca Cola, Sabritas, Bimbo, etc",
                                            type: "text",
                                            value: item.name,
                                            required: true
                                        },
                                        {
                                            name: "phone1",
                                            label: "Numero de telefono",
                                            placeholder: "123 456 78 90",
                                            type: "tel",
                                            pattern:"[0-9]{10}",
                                            value: item.phone1,
                                            required: true,
                                        },
                                        {
                                            name: "phone2",
                                            label: "Numero de telefono 2",
                                            placeholder: "123 456 78 90",
                                            type: "tel",
                                            pattern:"[0-9]{10}",
                                            value: item.phone2,
                                        },
                                        {
                                            name: "email1",
                                            label: "Correo electronico",
                                            placeholder: "Correo electronico del proveedor",
                                            type: "email",
                                            value: item.email1,
                                            required: true
                                        },
                                        {
                                            name: "email2",
                                            label: "Correo electronico 2",
                                            placeholder: "Correo electronico alternativo del proveedor",
                                            type: "email",
                                            value: item.email2,
                                        },
                                    ],
                                    options: {
                                        confirmText: "Actualizar",
                                        cancelText: "Cancelar",
                                        type: "primary",
                                    }
                                });
                                if (!modalData) return;
                                await updateProvider(Number(item.id), modalData);
                                await loadProvidersPage(currentSearch);
                                showToast(`Proveedor "${modalData.name}" actualizado correctamente`, "success");
                            } catch (error) {
                                console.error(error)
                                showToast(error || "Error al obtener los datos del proveedor", "danger");
                            }
                        }
                    },
                    {
                        name: "delete",
                        title: "Eliminar proveedor",
                        className: "btn-delete square",
                        html: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-trash"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M4 7l16 0" /><path d="M10 11l0 6" /><path d="M14 11l0 6" /><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" /><path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" /></svg>`,
                        onClick: async (item, index) => {
                            const options = {
                                type: "danger",
                                confirmText: "Eliminar",
                                cancelText: "Cancelar",
                                size: "sm"
                            };
                            if (await modalHandler.callModalConfirm('Eliminar proveedor', '¿Desea eliminar el proveedor del sistema?. Esta acción no se puede deshacer.', options)) {
                                try {
                                    const res = await deleteProvider(Number(item.id));
                                    showToast(res || `Proveedor '${item.name}' eliminado correctamente`, "success");
                                    await loadProvidersPage(currentSearch, 1, currentLimit);
                                } catch (error) {
                                    showToast(error || "Error al eliminar el proveedor", "danger");
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

        /**
         * Cargar los datos de los productos
         * @param {*} searchData 
         * @param {*} page 
         * @param {*} limit 
         */
        async function loadProvidersPage(searchData = '', page = 1, limit = currentLimit) {
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
                    await loadProvidersPage(currentSearch, newPage, limit);
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
            await loadProvidersPage(currentSearch, 1, currentLimit);
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
                    await loadProvidersPage(currentSearch, 1, currentLimit);
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
        await loadProvidersPage(currentSearch, 1, currentLimit);


        /**
         * Modal para agregar nueva categoria
         */
        const btnAddProviderModal = document.getElementById("add-provider-modal")
        if (btnAddProviderModal) {
            btnAddProviderModal.addEventListener('click', async (e) => {
                e.preventDefault();
                await renderFormAddProvider();
            });
        }

        async function renderFormAddProvider() {
            const customModal = {
                title: "Nuevo Proveedor",
                description: "Registro de un nuevo proveedor",
                formContent: [
                    {
                        name: "name",
                        label: "Nombre del proveedor",
                        placeholder: "Coca Cola, Sabritas, Bimbo, etc",
                        type: "text",
                        required: true
                    },
                    {
                        name: "phone1",
                        label: "Numero de telefono",
                        placeholder: "123 456 78 90",
                        type: "tel",
                        pattern:"[0-9]{10}",
                        required: true,
                    },{
                        name: "phone2",
                        label: "Numero de telefono alternativo",
                        placeholder: "123 456 78 90",
                        type: "tel",
                        pattern:"[0-9]{10}",
                    },
                    {
                        name: "email1",
                        label: "Correo electronico",
                        placeholder: "Correo electronico del proveedor",
                        type: "email",
                        required: true
                    },
                    {
                        name: "email2",
                        label: "Correo electronico 2",
                        placeholder: "Correo electronico alternativo del proveedor",
                        type: "email",
                    },
                ],
                options: {
                    confirmText: "Crear categoria",
                    cancelText: "Cancelar",
                    type: "primary"
                }
            };

            const modalData = await modalHandler.callModalForm(customModal);
            try {
                if (!modalData) return;
                await createProvider(modalData);
                await loadProvidersPage(currentSearch);
                showToast(`Proveedor "${modalData.name}" registrado correctamente`, "success");
            } catch (error) {
                console.error(error);
                showToast("Error al registrar el proveedor: " + error, "danger");
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