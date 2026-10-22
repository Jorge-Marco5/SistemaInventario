class SearchHandler {
    constructor(containerId = 'search-container') {
        this.containerId = containerId;
        this.events = {};
        this.searchContainer = null;
        this.searchComponent = null;
        this.iconSearch = null;
        this.inputSearch = null;
        this.iconCloseSearch = null;
        this.abortController = new AbortController();
    }

    renderSearch(config = {}) {
        this.searchContainer = document.getElementById(this.containerId);
        if (!this.searchContainer) return;

        // Limpiar para evitar componentes duplicados en el DOM
        this.searchContainer.innerHTML = '';

        this.searchComponent = document.createElement('div');
        this.iconSearch = document.createElement('span');
        this.inputSearch = document.createElement('input');
        this.iconCloseSearch = document.createElement('span');

        this.iconSearch.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-search"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M3 10a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" /><path d="M21 21l-6 -6" /></svg>`;
        this.iconSearch.setAttribute('title', 'Pulsa para abrir buscador');
        this.searchComponent.appendChild(this.iconSearch);

        this.inputSearch.setAttribute('type', 'search');
        this.inputSearch.setAttribute('placeholder', config.placeholder || 'Buscar...');
        this.inputSearch.style.width = '100%';
        this.inputSearch.style.height = '100%';
        this.inputSearch.style.boxShadow = 'none';
        this.inputSearch.style.border = 'none';
        this.inputSearch.style.display = 'none';
        this.searchComponent.appendChild(this.inputSearch);

        this.iconCloseSearch.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-x"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M18 6l-12 12" /><path d="M6 6l12 12" /></svg>`;
        this.iconCloseSearch.setAttribute('title', 'Pulsa para cerrar');
        this.searchComponent.appendChild(this.iconCloseSearch);

        this.searchContainer.appendChild(this.searchComponent);

        const { signal } = this.abortController;

        // Escuchar Enter y Escape en el propio input (NO en document global para evitar fugas de eventos)
        this.inputSearch.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const value = this.inputSearch.value.trim();
                this.emit('submit', { value });
            } else if (e.key === 'Escape') {
                e.preventDefault();
                this.inputSearch.value = '';
                this.emit('submit', { value: '' });
                if (!config.showAllow) {
                    this.closeSearch();
                }
            }
        }, { signal });

        // Clic en la lupa de búsqueda
        this.iconSearch.addEventListener('click', (e) => {
            e.preventDefault();
            if (this.searchComponent.classList.contains('collapsed')) {
                const value = this.inputSearch.value.trim();
                this.emit('submit', { value });
            } else {
                this.collapseEvents(false);
            }
        }, { signal });

        // Clic en la 'X' para limpiar y cerrar
        this.iconCloseSearch.addEventListener('click', (e) => {
            e.preventDefault();
            this.inputSearch.value = '';
            this.emit('submit', { value: '' });
            if (!config.showAllow) {
                this.closeSearch();
            } else {
                this.inputSearch.focus();
            }
        }, { signal });

        if (config && config.showAllow) {
            this.collapseEvents(true);
        }
    }

    on(nameEvent, callback) {
        if (!this.events[nameEvent]) {
            this.events[nameEvent] = [];
        }
        this.events[nameEvent].push(callback);
    }

    emit(nameEvent, data) {
        if (this.events[nameEvent]) {
            this.events[nameEvent].forEach(callback => callback(data));
        }
    }

    async collapseEvents(active = false) {
        if (!this.searchComponent) return;
        this.searchComponent.classList.add('collapsed');
        if (this.iconSearch) this.iconSearch.setAttribute('title', 'Pulsa para buscar');
        if (this.inputSearch) this.inputSearch.style.display = 'block';
        if (this.iconCloseSearch) {
            this.iconCloseSearch.style.display = 'flex';
            setTimeout(() => {
                const svg = this.iconCloseSearch?.querySelector('svg');
                if (svg) svg.style.opacity = '1';
            }, 200);
        }
    }

    async closeSearch() {
        if (!this.searchComponent) return;
        this.inputSearch.style.display = 'none';
        this.inputSearch.value = '';
        this.iconSearch.setAttribute('title', 'Pulsa para abrir buscador');
        this.iconCloseSearch.style.display = 'none';
        this.searchComponent.classList.remove('collapsed');
        const svg = this.iconCloseSearch.querySelector('svg');
        if (svg) svg.style.opacity = '0';
        this.searchComponent.classList.add('collapsed-off');
        await new Promise((resolve) => setTimeout(resolve, 300));
        this.searchComponent.classList.remove('collapsed-off');
    }

    destroy() {
        this.abortController?.abort();
        this.events = {};
        if (this.searchContainer) {
            this.searchContainer.innerHTML = '';
        }
    }
}