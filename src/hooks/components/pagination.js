class PaginationHandler {
    constructor(containerId = 'pagination-container') {
        this.containerId = containerId;
        this.paginationContainer = document.getElementById(containerId);
        this.paginationComponent = null;
        this.onPageChangeCallback = null;
        this.currentPage = 1;
        this.totalPages = 1;
        this.currentLimit = 10;
        this.currentConfig = null;
    }

    /**
     * Renderiza el componente de paginación
     * @param {Object} data = { totalPages, currentPage, limit, config, onPageChange }
     */
    async renderPagination(data = {}) {
        // Obtener el contenedor actual en el DOM
        this.paginationContainer = document.getElementById(this.containerId);
        if (!this.paginationContainer) return;

        // Registrar callback si fue provisto
        if (typeof data.onPageChange === 'function') {
            this.onPageChangeCallback = data.onPageChange;
        }

        this.totalPages = Math.max(1, Number(data.totalPages) || 1);
        this.currentPage = Math.min(Math.max(1, Number(data.currentPage) || 1), this.totalPages);
        if (data.config) {
            this.currentConfig = data.config;
        }

        // Crear o reinsertar contenedor interno de botones asegurando que no existan duplicados
        if (!this.paginationComponent || !this.paginationContainer.contains(this.paginationComponent) || this.paginationContainer.children.length > 1) {
            this.paginationContainer.innerHTML = '';
            this.paginationComponent = document.createElement('div');
            this.paginationContainer.appendChild(this.paginationComponent);
            this.bindEvents();
        }

        this.paginationComponent.innerHTML = "";

        const isFirstDisabled = this.currentPage <= 1;
        const isLastDisabled = this.currentPage >= this.totalPages;

        // --- Selector opcional de límite de filas por página ---
        const config = data.config || this.currentConfig;
        if (config && config.includeLimit) {
            this.paginationComponent.style.width = '100%';
            const pageLimit = document.createElement('div');

            const limitText = document.createElement('p');
            limitText.innerText = `Filas por página:`;
            limitText.style.fontSize = '0.85rem';
            pageLimit.appendChild(limitText);

            const limitSelect = document.createElement('select');
            limitSelect.setAttribute('title', 'Seleccionar límite de filas');

            const limits = Array.isArray(config.limits) && config.limits.length > 0
                ? config.limits
                : [10, 25, 50, 100];

            this.currentLimit = Number(data.limit) || this.currentLimit || limits[0];

            limits.forEach(limit => {
                const option = document.createElement('option');
                option.dataset.limit = limit;
                option.value = limit;
                option.innerText = `${limit}`;
                if (Number(limit) === Number(this.currentLimit)) {
                    option.selected = true;
                }
                limitSelect.appendChild(option);
            });

            // Capturar el evento de cambio de límite
            limitSelect.addEventListener('change', (e) => {
                const newLimit = Number(e.target.value);
                this.currentLimit = newLimit;
                this.currentPage = 1; // Reiniciar a página 1 al cambiar el tamaño de página

                if (typeof this.onPageChangeCallback === 'function') {
                    this.onPageChangeCallback({ newPage: 1, limit: newLimit });
                }
            });

            pageLimit.appendChild(limitSelect);
            this.paginationComponent.appendChild(pageLimit);
        } else {
            this.paginationComponent.style.width = 'auto';
        }

        // --- Contenedor de controles de paginación ---
        const pagesList = document.createElement('div');

        // 1. Botón primera página
        const firstPage = document.createElement('span');
        firstPage.dataset.action = 'first';
        firstPage.title = 'Ir a la primera página';
        if (isFirstDisabled) firstPage.classList.add('deactivate');
        firstPage.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-chevrons-left"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M11 7l-5 5l5 5" /><path d="M17 7l-5 5l5 5" /></svg>`;
        pagesList.appendChild(firstPage);

        // 2. Botón página anterior
        const beforePage = document.createElement('span');
        beforePage.dataset.action = 'prev';
        beforePage.title = 'Página anterior';
        if (isFirstDisabled) beforePage.classList.add('deactivate');
        beforePage.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-chevron-left"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M15 6l-6 6l6 6" /></svg>`;
        pagesList.appendChild(beforePage);

        // 3. Rango de páginas numeradas (ventana dinámica)
        const maxItems = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxItems / 2));
        let endPage = startPage + maxItems - 1;

        if (endPage > this.totalPages) {
            endPage = this.totalPages;
            startPage = Math.max(1, endPage - maxItems + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            const page = document.createElement('span');
            page.title = `Ir a la página ${i}`;
            page.dataset.page = `${i}`;
            page.innerText = `${i}`;
            if (i === this.currentPage) {
                page.classList.add('current');
            }
            pagesList.appendChild(page);
        }

        // 4. Botón página siguiente
        const afterPage = document.createElement('span');
        afterPage.dataset.action = 'next';
        afterPage.title = 'Página siguiente';
        if (isLastDisabled) afterPage.classList.add('deactivate');
        afterPage.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-chevron-right"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M9 6l6 6l-6 6" /></svg>`;
        pagesList.appendChild(afterPage);

        // 5. Botón última página
        const lastPage = document.createElement('span');
        lastPage.dataset.action = 'last';
        lastPage.title = 'Ir a la última página';
        if (isLastDisabled) lastPage.classList.add('deactivate');
        lastPage.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-chevrons-right"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M7 7l5 5l-5 5" /><path d="M13 7l5 5l-5 5" /></svg>`;

        pagesList.appendChild(lastPage);
        this.paginationComponent.appendChild(pagesList);
    }

    /**
     * Escucha eventos de clic en los controles de paginación
     */
    bindEvents() {
        this.paginationComponent.addEventListener('click', (e) => {
            const btn = e.target.closest('span');
            if (!btn || btn.classList.contains('deactivate') || btn.classList.contains('current')) {
                return;
            }

            let targetPage = this.currentPage;

            if (btn.dataset.page) {
                targetPage = Number(btn.dataset.page);
            } else if (btn.dataset.action === 'first') {
                targetPage = 1;
            } else if (btn.dataset.action === 'prev') {
                targetPage = this.currentPage - 1;
            } else if (btn.dataset.action === 'next') {
                targetPage = this.currentPage + 1;
            } else if (btn.dataset.action === 'last') {
                targetPage = this.totalPages;
            }

            if (targetPage !== this.currentPage && targetPage >= 1 && targetPage <= this.totalPages) {
                this.changePage(targetPage);
            }
        });
    }

    /**
     * Cambia de página, actualiza la vista y dispara el callback onPageChange
     * @param {number} newPage 
     * @param {number} [totalPages] 
     */
    changePage(newPage, totalPages) {
        if (totalPages) {
            this.totalPages = Number(totalPages);
        }
        this.currentPage = Number(newPage);

        // Actualizar visualmente los controles
        this.renderPagination({
            totalPages: this.totalPages,
            currentPage: this.currentPage,
            limit: this.currentLimit,
            config: this.currentConfig,
            onPageChange: this.onPageChangeCallback
        });

        // Notificar al consumidor (main.js)
        if (typeof this.onPageChangeCallback === 'function') {
            this.onPageChangeCallback({ newPage: this.currentPage, limit: this.currentLimit });
        }
    }

    getCurrentPage() {
        return this.currentPage;
    }

    getTotalPages() {
        return this.totalPages;
    }

    getCurrentLimit() {
        return this.currentLimit;
    }

    destroy() {
        if (this.paginationContainer) {
            this.paginationContainer.innerHTML = '';
        }
        this.paginationComponent = null;
        this.onPageChangeCallback = null;
    }
}