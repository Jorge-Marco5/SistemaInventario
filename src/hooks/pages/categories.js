class CategoriesPage {
    /**
     * Logica principal para la pagina de productos
     * @param {*} container 
     * @param {*} params 
     * @returns 
     */
    async logicCategoriesPage(container, params) {

        let searchData = '';
        localStorage.setItem('queryLotsByProduct', 0)


        async function getData(search = searchData) {
            let data = [];
            try {
                data = await getCategories(search);
            } catch (error) {
                showToast("Error al obtener la lista de categorias", 'danger');
            }

            return {
                title: "Lista de categorias",
                includeId: true,
                columns: [
                    { header: "ID", field: "id" },
                    { header: "Nombre", field: "name" },
                    {
                        header: "Descripcion",
                        field: "description",
                    },
                    {
                        header: "Fecha de creación",
                        field: "created_at",
                        formatter: (val) => `${dayjs.utc(val).tz('America/Mexico_City').format("DD/MM/YYYY HH:mm") || ''}`
                    }
                ],
                data: data,
                actions: [
                    {
                        name: "watch_products",
                        title: "Ver productos",
                        className: "success square",
                        html: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-box"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M12 3l8 4.5l0 9l-8 4.5l-8 -4.5l0 -9l8 -4.5" /><path d="M12 12l8 -4.5" /><path d="M12 12l0 9" /><path d="M12 12l-8 -4.5" /></svg>`,
                        onClick: async (item, index) => {
                            navigateTo('products', { search: item.name });
                        }
                    },
                    {
                        name: "edit",
                        title: "Editar categoria",
                        className: "btn-edit square",
                        html: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-edit"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1" /><path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415" /><path d="M16 5l3 3" /></svg>`,
                        onClick: async (item, index) => {
                            try {

                                const modalData = await drawerHandler.callDrawerForm({
                                    title: "Actualizar categoria",
                                    description: "Actualización de la información de una categoria",
                                    formContent: [
                                        {
                                            name: "name",
                                            label: "Nombre de la categoria",
                                            placeholder: "Abarrotes, Lacteos, Papeleria, etc.",
                                            type: "text",
                                            value: item.name,
                                            required: true
                                        },
                                        {
                                            name: "description",
                                            label: "Descripción",
                                            placeholder: "Descripcion de la categoria",
                                            type: "text",
                                            value: item.description,
                                            required: true
                                        },
                                    ],
                                    options: {
                                        confirmText: "Actualizar",
                                        cancelText: "Cancelar",
                                        type: "primary",
                                    }
                                });
                                if (!modalData) return;
                                await updateCategory(Number(item.id), modalData);
                                await loadCategoriesPage(currentSearch);
                                showToast(`Categoria "${modalData.name}" actualizado correctamente`, "success");
                            } catch (error) {
                                showToast(error || "Error al obtener los datos de la categoria", "danger");
                            }
                        }
                    }
                ]
            };
        }

        const tableHandler = new TableHandler();
        let currentSearch = '';

        //cargar los datos de productos
        async function loadCategoriesPage(searchData = '') {
            const data = await getData(searchData);
            tableHandler.renderTable(data);
        }

        /**
         * Busqueda de categorias
         */
        const searchHandler = new SearchHandler();
        const configSearch = {
            showAllow: true
        }
        searchHandler.renderSearch(configSearch);

        searchHandler.on('submit', async (search) => {
            currentSearch = search.value;
            await loadCategoriesPage(currentSearch);
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
                await loadCategoriesPage(currentSearch);
            }
        });

        /**
         * Cargar los datos al ingresar
         */
        await loadCategoriesPage(currentSearch);

        /**
         * Modal para agregar nueva categoria
         */
        const btnAddCategorieModal = document.getElementById("add-category-modal")
        if (btnAddCategorieModal) {
            btnAddCategorieModal.addEventListener('click', async (e) => {
                e.preventDefault();
                await renderFormAddCategory();
            });
        }

        async function renderFormAddCategory() {
            const customModal = {
                title: "Nueva categoria",
                description: "Registro de una nueva categoria",
                formContent: [
                    {
                        name: "name",
                        label: "Nombre",
                        placeholder: "Nombre de la categoria",
                        type: "text",
                        required: true
                    },
                    {
                        name: "description",
                        label: "Descripción",
                        placeholder: "Descripcion de la categoria",
                        type: "text",
                        required: true
                    }
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
                await createCategory(modalData);
                await loadCategoriesPage(currentSearch);
                showToast(`Categoria "${modalData.name}" creada correctamente`, "success");
            } catch (error) {
                console.error(error);
                showToast("Error al crear la categoria: " + error, "danger");
            }
        }

        // Función de limpieza al desmontar este template
        return () => {
            searchHandler?.destroy?.();
            tableHandler?.destroy?.();
        };
    }
}