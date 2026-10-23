class DrawerHandler {
    constructor(containerId = 'drawer-container') {
        this.containerId = containerId;
        this.drawerContainer = document.getElementById(containerId);
        this.drawerContent = null;
        this.drawerHeader = null;
        this.drawerBody = null;
        this.drawerFooter = null;
        this.activeResolve = null;
        this.activeAbortController = null;
        this.previousActiveElement = null;

        this.initDOM();
    }

    /**
     * Inicializa la estructura interna del drawer dentro del contenedor base
     */
    initDOM() {
        if (!this.drawerContainer) {
            this.drawerContainer = document.getElementById(this.containerId);
        }

        if (!this.drawerContainer) return;

        // Atributos de accesibilidad en el contenedor del diálogo
        this.drawerContainer.setAttribute('role', 'dialog');
        this.drawerContainer.setAttribute('aria-modal', 'true');
        this.drawerContainer.setAttribute('aria-labelledby', 'drawer-title-heading');
        this.drawerContainer.setAttribute('aria-describedby', 'drawer-desc-heading');

        // Si ya contiene drawer-content, evitar recrearlo
        if (this.drawerContainer.querySelector('.drawer-content')) {
            this.drawerContent = this.drawerContainer.querySelector('.drawer-content');
            this.drawerHeader = this.drawerContent.querySelector('.drawer-header');
            this.drawerBody = this.drawerContent.querySelector('.drawer-body');
            this.drawerFooter = this.drawerContent.querySelector('.drawer-footer');
            return;
        }

        // Crear la estructura de manera dinámica
        this.drawerContent = document.createElement('div');
        this.drawerContent.className = 'drawer-content';

        // 1. Cabecera
        this.drawerHeader = document.createElement('div');
        this.drawerHeader.className = 'drawer-header';
        this.drawerHeader.innerHTML = `
            <div class="drawer-title-row">
                <h3 class="drawer-title" id="drawer-title-heading">Formulario</h3>
                <button type="button" class="drawer-close" aria-label="Cerrar panel lateral" title="Cerrar">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M18 6l-12 12" />
                        <path d="M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <p class="drawer-description" id="drawer-desc-heading"></p>
        `;

        // 2. Cuerpo
        this.drawerBody = document.createElement('div');
        this.drawerBody.className = 'drawer-body';

        // 3. Footer
        this.drawerFooter = document.createElement('div');
        this.drawerFooter.className = 'drawer-footer';
        this.drawerFooter.innerHTML = `
            <div class="drawer-actions">
                <button type="button" class="outline default btn-cancel">Cancelar</button>
                <button type="submit" form="drawer-form" class="primary default btn-submit">Guardar</button>
            </div>
        `;

        this.drawerContent.appendChild(this.drawerHeader);
        this.drawerContent.appendChild(this.drawerBody);
        this.drawerContent.appendChild(this.drawerFooter);
        this.drawerContainer.appendChild(this.drawerContent);

        this.bindEvents();
    }

    /**
     * Vincula eventos globales de cierre (backdrop, botón close, Escape) y contención de foco
     */
    bindEvents() {
        if (!this.drawerContainer) return;

        // Cerrar al hacer clic en el backdrop fuera de drawer-content
        this.drawerContainer.addEventListener('click', (e) => {
            if (e.target === this.drawerContainer) {
                this.closeDrawer(null);
            }
        });

        // Botón cerrar (X)
        const closeBtn = this.drawerHeader?.querySelector('.drawer-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeDrawer(null);
            });
        }

        // Botón Cancelar del footer
        const cancelBtn = this.drawerFooter?.querySelector('.btn-cancel');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeDrawer(null);
            });
        }

        // Cerrar con Escape y contención de foco (Focus Trap)
        document.addEventListener('keydown', (e) => {
            if (!this.drawerContainer || !this.drawerContainer.classList.contains('active')) return;

            if (e.key === 'Escape') {
                e.preventDefault();
                this.closeDrawer(null);
                return;
            }

            if (e.key === 'Tab') {
                const focusableElements = this.drawerContent.querySelectorAll(
                    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
                );
                const focusable = Array.from(focusableElements).filter((el) => el.offsetParent !== null);
                if (focusable.length === 0) return;

                const firstEl = focusable[0];
                const lastEl = focusable[focusable.length - 1];

                if (e.shiftKey) {
                    if (document.activeElement === firstEl || !this.drawerContent.contains(document.activeElement)) {
                        e.preventDefault();
                        lastEl.focus();
                    }
                } else {
                    if (document.activeElement === lastEl || !this.drawerContent.contains(document.activeElement)) {
                        e.preventDefault();
                        firstEl.focus();
                    }
                }
            }
        });
    }

    /**
     * Construye y despliega el Drawer con un formulario dinámico.
     * Soporta inputs convencionales, textarea, select y autocomplete asíncrono.
     * Retorna una Promesa que resuelve con los datos del formulario (Objeto tipado) al hacer submit,
     * o resuelve con null si el usuario cancela o cierra el drawer.
     *
     * @param {Object} config - { title, description, size, formContent: [...], options: { confirmText, cancelText, type } }
     * @returns {Promise<Object|null>}
     */
    callDrawerForm(config = {}) {
        return new Promise((resolve) => {
            this.initDOM();
            if (!this.drawerContainer || !this.drawerContent) {
                console.error('[DrawerHandler] No se encontró el contenedor #drawer-container en el DOM');
                resolve(null);
                return;
            }

            // Guardar elemento enfocado previamente para restaurarlo al cerrar
            this.previousActiveElement = document.activeElement;

            // Cancelar cualquier promesa previa pendiente
            if (this.activeResolve) {
                this.activeResolve(null);
            }
            this.activeResolve = resolve;

            // Limpiar listeners previos del formulario
            this.activeAbortController?.abort();
            this.activeAbortController = new AbortController();
            const { signal } = this.activeAbortController;

            const drawerOptions = config.options || {};
            const fields = config.formContent || config.fields || [];

            // 1. Tamaño del drawer
            this.drawerContainer.classList.remove('drawer-sm', 'drawer-lg', 'drawer-xl', 'drawer-fullscreen');
            if (config.size) {
                this.drawerContainer.classList.add(`drawer-${config.size}`);
            }

            // 2. Título y descripción
            const titleEl = this.drawerHeader.querySelector('.drawer-title');
            const descEl = this.drawerHeader.querySelector('.drawer-description');
            if (titleEl) titleEl.textContent = config.title || 'Formulario';
            if (descEl) {
                descEl.textContent = config.description || '';
                descEl.style.display = config.description ? 'block' : 'none';
            }

            // 3. Botones del footer
            const btnCancel = this.drawerFooter.querySelector('.btn-cancel');
            const btnSubmit = this.drawerFooter.querySelector('.btn-submit');

            if (btnCancel) {
                btnCancel.textContent = drawerOptions.cancelText || 'Cancelar';
                btnCancel.style.display = drawerOptions.showCancel === false ? 'none' : 'inline-flex';
            }

            if (btnSubmit) {
                btnSubmit.textContent = drawerOptions.confirmText || 'Guardar';
                btnSubmit.classList.remove('primary', 'danger', 'info', 'warning', 'success');
                btnSubmit.classList.add(drawerOptions.type || 'primary');
            }

            // 4. Construcción del Formulario en el Body
            this.drawerBody.innerHTML = '';
            const formFather = document.createElement('form');
            formFather.id = 'drawer-form';

            fields.forEach((field) => {
                const formGroup = document.createElement('div');
                formGroup.classList.add('form-group');

                const fieldName = field.name || '';
                const fieldId = field.id || `drawer-${fieldName}-id`;
                const isRequired = Boolean(field.required || field.require);
                const onlyRead = Boolean(field.onlyRead || field.onlyread);
                const disabled = Boolean(field.disabled || field.disabled);
                const fieldType = (field.type || 'text').toLowerCase();
                const hintText = field.hint || field.description;
                const hintId = hintText ? `${fieldId}-hint` : null;

                // Label
                if (field.label) {
                    const newLabel = document.createElement('label');
                    newLabel.textContent = field.label;
                    newLabel.setAttribute('for', fieldId);
                    if (isRequired) {
                        newLabel.classList.add('required');
                    }
                    formGroup.appendChild(newLabel);
                }

                // Control del formulario (textarea, select, autocomplete, input)
                let inputEl;

                if (fieldType === 'textarea') {
                    inputEl = document.createElement('textarea');
                    if (field.placeholder) inputEl.placeholder = field.placeholder;
                    if (field.rows) inputEl.rows = field.rows;
                    if (field.value !== undefined) inputEl.value = field.value;

                    inputEl.name = fieldName;
                    inputEl.id = fieldId;
                    inputEl.required = isRequired;
                    if (isRequired) inputEl.setAttribute('aria-required', 'true');
                    if (hintId) inputEl.setAttribute('aria-describedby', hintId);
                    if (onlyRead) inputEl.onlyread = onlyRead;
                    if (disabled) inputEl.disabled = disabled;
                    formGroup.appendChild(inputEl);

                } else if (fieldType === 'select') {
                    inputEl = document.createElement('select');

                    if (field.placeholder) {
                        const placeholderOpt = document.createElement('option');
                        placeholderOpt.value = '';
                        placeholderOpt.textContent = field.placeholder;
                        placeholderOpt.disabled = true;
                        if (field.value === undefined || field.value === null || field.value === '') {
                            placeholderOpt.selected = true;
                        }
                        inputEl.appendChild(placeholderOpt);
                    }

                    if (Array.isArray(field.options)) {
                        field.options.forEach((opt) => {
                            const optionEl = document.createElement('option');
                            const optVal = typeof opt === 'object' && opt !== null ? opt.value : opt;
                            const optLabel = typeof opt === 'object' && opt !== null ? (opt.label ?? opt.value) : opt;
                            optionEl.value = optVal !== undefined ? optVal : '';
                            optionEl.textContent = optLabel !== undefined ? optLabel : '';
                            if (field.value !== undefined && String(optVal) === String(field.value)) {
                                optionEl.selected = true;
                            }
                            inputEl.appendChild(optionEl);
                        });
                    }

                    inputEl.name = fieldName;
                    inputEl.id = fieldId;
                    inputEl.required = isRequired;
                    if (onlyRead) inputEl.onlyread = onlyRead;
                    if (disabled) inputEl.disabled = disabled;
                    if (isRequired) inputEl.setAttribute('aria-required', 'true');
                    if (hintId) inputEl.setAttribute('aria-describedby', hintId);
                    formGroup.appendChild(inputEl);

                } else if (fieldType === 'autocomplete' || fieldType === 'combobox') {
                    const autocompleteWrap = document.createElement('div');
                    autocompleteWrap.className = 'autocomplete-wrap';
                    autocompleteWrap.style.position = 'relative';
                    autocompleteWrap.style.width = '100%';

                    // Input oculto con el valor real (ID) que enviará el formulario
                    const hiddenInput = document.createElement('input');
                    hiddenInput.type = 'hidden';
                    hiddenInput.name = fieldName;
                    hiddenInput.id = fieldId;
                    if (field.value !== undefined && field.value !== null) {
                        hiddenInput.value = field.value;
                    }

                    // Determinar etiqueta inicial si se pasó initialLabel o si se encuentra en options
                    let initialText = field.initialLabel || '';
                    if (!initialText && field.value !== undefined && Array.isArray(field.options)) {
                        const found = field.options.find(opt => (typeof opt === 'object' ? opt.value : opt) == field.value);
                        if (found) {
                            initialText = typeof found === 'object' ? found.label : found;
                        }
                    }

                    // Input visible para búsqueda
                    const searchInput = document.createElement('input');
                    searchInput.type = 'text';
                    searchInput.autocomplete = 'off';
                    searchInput.id = `${fieldId}-search`;
                    if (field.placeholder) searchInput.placeholder = field.placeholder;
                    if (initialText) searchInput.value = initialText;
                    searchInput.required = isRequired;
                    if (onlyRead) inputEl.onlyread = onlyRead;
                    if (disabled) inputEl.disabled = disabled;

                    if (isRequired) searchInput.setAttribute('aria-required', 'true');
                    if (hintId) searchInput.setAttribute('aria-describedby', hintId);

                    // Contenedor flotante de resultados
                    const dropdownEl = document.createElement('div');
                    dropdownEl.className = 'autocomplete-dropdown';
                    dropdownEl.style.cssText = `
                        position: absolute;
                        top: calc(100% + 4px);
                        left: 0;
                        right: 0;
                        background: var(--background-color-secondary, #1e1e24);
                        border: 1px solid var(--border, #3a3a44);
                        border-radius: 8px;
                        max-height: 200px;
                        overflow-y: auto;
                        z-index: 1050;
                        display: none;
                        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.35);
                        box-sizing: border-box;
                    `;

                    let debounceTimer = null;
                    let currentItems = [];
                    let highlightedIndex = -1;

                    const highlightItem = (index) => {
                        const itemEls = dropdownEl.querySelectorAll('.autocomplete-item');
                        itemEls.forEach((el, idx) => {
                            if (idx === index) {
                                el.style.backgroundColor = 'var(--bg-shadow, rgba(255, 255, 255, 0.12))';
                                el.scrollIntoView({ block: 'nearest' });
                            } else {
                                el.style.backgroundColor = 'transparent';
                            }
                        });
                        highlightedIndex = index;
                    };

                    const selectItem = (item) => {
                        searchInput.value = item.label;
                        hiddenInput.value = item.value;
                        searchInput.setCustomValidity('');
                        dropdownEl.style.display = 'none';
                        highlightedIndex = -1;
                        if (typeof field.onSelect === 'function') {
                            field.onSelect(item);
                        }
                    };

                    const renderResults = (items) => {
                        dropdownEl.innerHTML = '';
                        currentItems = items || [];
                        highlightedIndex = -1;

                        if (!currentItems.length) {
                            const emptyEl = document.createElement('div');
                            emptyEl.style.cssText = 'padding: 10px 14px; font-size: 0.85rem; color: var(--secondary, #888);';
                            emptyEl.textContent = 'Sin resultados coincidentes';
                            dropdownEl.appendChild(emptyEl);
                            dropdownEl.style.display = 'block';
                            return;
                        }

                        currentItems.forEach((item, idx) => {
                            const itemEl = document.createElement('div');
                            itemEl.className = 'autocomplete-item';
                            itemEl.style.cssText = `
                                padding: 8px 14px;
                                cursor: pointer;
                                display: flex;
                                flex-direction: row;
                                justify-content: space-between;
                                align-items: center;
                                gap: 8px;
                                border-bottom: 1px solid var(--border, rgba(255, 255, 255, 0.05));
                                transition: background-color 0.15s ease;
                            `;

                            const labelEl = document.createElement('span');
                            labelEl.style.cssText = 'font-weight: 500; font-size: 0.9rem; color: var(--text, #fff);';
                            labelEl.textContent = item.label;
                            itemEl.appendChild(labelEl);

                            if (item.hint) {
                                const hintEl = document.createElement('small');
                                hintEl.style.cssText = 'font-size: 0.78rem; opacity: 0.7; color: var(--secondary, #aaa);';
                                hintEl.textContent = item.hint;
                                itemEl.appendChild(hintEl);
                            }

                            itemEl.addEventListener('mouseenter', () => highlightItem(idx));
                            itemEl.addEventListener('mousedown', (e) => {
                                e.preventDefault();
                                selectItem(item);
                            });

                            dropdownEl.appendChild(itemEl);
                        });

                        dropdownEl.style.display = 'block';
                    };

                    searchInput.addEventListener('input', (e) => {
                        const query = e.target.value.trim();
                        hiddenInput.value = '';
                        if (isRequired) {
                            searchInput.setCustomValidity('Selecciona una opción válida de la lista');
                        }

                        clearTimeout(debounceTimer);
                        if (!query) {
                            dropdownEl.style.display = 'none';
                            return;
                        }

                        debounceTimer = setTimeout(async () => {
                            try {
                                if (typeof field.onSearch === 'function') {
                                    const results = await field.onSearch(query);
                                    renderResults(results);
                                } else if (Array.isArray(field.options)) {
                                    const filtered = field.options.filter((opt) => {
                                        const text = typeof opt === 'object' ? opt.label : String(opt);
                                        return text.toLowerCase().includes(query.toLowerCase());
                                    }).map((opt) => (typeof opt === 'object' ? opt : { label: opt, value: opt }));
                                    renderResults(filtered);
                                }
                            } catch (err) {
                                console.error("[DrawerHandler] Error en búsqueda autocomplete:", err);
                            }
                        }, 250);
                    });

                    searchInput.addEventListener('keydown', (e) => {
                        if (dropdownEl.style.display === 'block') {
                            if (e.key === 'ArrowDown') {
                                e.preventDefault();
                                const nextIndex = (highlightedIndex + 1) % currentItems.length;
                                highlightItem(nextIndex);
                            } else if (e.key === 'ArrowUp') {
                                e.preventDefault();
                                const prevIndex = (highlightedIndex - 1 + currentItems.length) % currentItems.length;
                                highlightItem(prevIndex);
                            } else if (e.key === 'Enter') {
                                if (highlightedIndex >= 0 && highlightedIndex < currentItems.length) {
                                    e.preventDefault();
                                    selectItem(currentItems[highlightedIndex]);
                                }
                            } else if (e.key === 'Escape') {
                                dropdownEl.style.display = 'none';
                            }
                        }
                    });

                    searchInput.addEventListener('blur', () => {
                        setTimeout(() => {
                            dropdownEl.style.display = 'none';
                            if (isRequired && !hiddenInput.value) {
                                searchInput.setCustomValidity('Selecciona una opción válida de la lista');
                            }
                        }, 180);
                    });

                    autocompleteWrap.appendChild(hiddenInput);
                    autocompleteWrap.appendChild(searchInput);
                    autocompleteWrap.appendChild(dropdownEl);
                    formGroup.appendChild(autocompleteWrap);

                } else {
                    inputEl = document.createElement('input');
                    inputEl.setAttribute('type', fieldType);
                    if (field.placeholder) inputEl.setAttribute('placeholder', field.placeholder);
                    if (field.step !== undefined) inputEl.setAttribute('step', field.step);
                    if (field.min !== undefined) inputEl.setAttribute('min', field.min);
                    if (field.max !== undefined) inputEl.setAttribute('max', field.max);
                    if (field.pattern !== undefined) inputEl.setAttribute('pattern', field.pattern);
                    
                    if (fieldType === 'text'){
                        if (field.maxlength !== undefined) inputEl.setAttribute('maxlength', field.maxlength);
                    }

                    if (field.value !== undefined) {
                        if (fieldType === 'checkbox') {
                            inputEl.checked = Boolean(field.value);
                        } else {
                            inputEl.value = field.value;
                        }
                    }

                    inputEl.name = fieldName;
                    inputEl.id = fieldId;
                    inputEl.required = isRequired;
                    if (onlyRead) inputEl.onlyread = onlyRead;
                    if (disabled) inputEl.disabled = disabled;

                    if (isRequired) inputEl.setAttribute('aria-required', 'true');
                    if (hintId) inputEl.setAttribute('aria-describedby', hintId);

                    formGroup.appendChild(inputEl);
                }

                // Hint opcional
                if (hintText) {
                    const hintEl = document.createElement('span');
                    hintEl.className = 'form-hint';
                    hintEl.id = hintId;
                    hintEl.textContent = hintText;
                    formGroup.appendChild(hintEl);
                }

                formFather.appendChild(formGroup);
            });

            this.drawerBody.appendChild(formFather);

            // Manejo del Submit con validación y tipado
            formFather.addEventListener('submit', (e) => {
                e.preventDefault();

                // Validar campos de autocomplete requeridos
                let hasInvalidAutocomplete = false;
                fields.forEach((field) => {
                    const fieldType = (field.type || 'text').toLowerCase();
                    if (fieldType === 'autocomplete' || fieldType === 'combobox') {
                        const fieldName = field.name;
                        const isReq = Boolean(field.required || field.require);
                        const hiddenEl = formFather.querySelector(`input[type="hidden"][name="${fieldName}"]`);
                        const searchEl = formFather.querySelector(`#drawer-${fieldName}-id-search`);
                        if (isReq && (!hiddenEl || !hiddenEl.value)) {
                            if (searchEl) {
                                searchEl.setCustomValidity('Selecciona una opción válida de la lista');
                                searchEl.reportValidity();
                                hasInvalidAutocomplete = true;
                            }
                        }
                    }
                });

                if (hasInvalidAutocomplete) return;

                const rawData = Object.fromEntries(new FormData(formFather));
                const formData = { ...rawData };

                // Procesamiento y casteo tipado según definición de campos
                fields.forEach((field) => {
                    const fieldName = field.name;
                    if (!fieldName) return;

                    const fieldType = (field.type || 'text').toLowerCase();
                    const element = formFather.elements[fieldName];

                    if (fieldType === 'checkbox' && element) {
                        formData[fieldName] = Boolean(element.checked);
                    } else if (fieldType === 'number' && element) {
                        const val = typeof element.value === 'string' ? element.value.trim() : '';
                        formData[fieldName] = val === '' ? null : Number(val);
                    } else if (fieldType === 'autocomplete' || fieldType === 'combobox') {
                        const hiddenEl = formFather.querySelector(`input[type="hidden"][name="${fieldName}"]`);
                        const val = typeof hiddenEl?.value === 'string' ? hiddenEl.value.trim() : '';
                        if (field.valueType === 'number' || (val !== '' && !isNaN(Number(val)))) {
                            formData[fieldName] = val === '' ? null : Number(val);
                        } else {
                            formData[fieldName] = val;
                        }
                    } else if (fieldType === 'select' && element) {
                        const isNumericOption = Array.isArray(field.options) && field.options.length > 0 &&
                            (typeof field.options[0] === 'number' || typeof field.options[0]?.value === 'number');
                        if (isNumericOption || field.valueType === 'number') {
                            const val = typeof element.value === 'string' ? element.value.trim() : '';
                            formData[fieldName] = val === '' ? null : Number(val);
                        } else {
                            formData[fieldName] = element.value;
                        }
                    }
                });

                if (this.activeResolve) {
                    const cb = this.activeResolve;
                    this.activeResolve = null;
                    this.closeDrawer(formData);
                    cb(formData);
                }
            }, { signal });

            // Bloquear scroll global del documento
            document.body.style.overflow = 'hidden';
            this.drawerContainer.classList.add('active');

            // Autofoco en el primer control tras activarse
            requestAnimationFrame(() => {
                setTimeout(() => {
                    const firstInput = formFather.querySelector('input:not([type="hidden"]), select, textarea') || btnSubmit;
                    firstInput?.focus();
                }, 50);
            });
        });
    }

    /**
     * Cierra el drawer y resuelve la promesa pendiente con animación suave
     * @param {Object|null} [result=null]
     */
    closeDrawer(result = null) {
        if (!this.drawerContainer) return;

        if (this.activeResolve) {
            const cb = this.activeResolve;
            this.activeResolve = null;
            cb(result);
        }

        // Limpiar listeners de la acción actual
        this.activeAbortController?.abort();
        this.activeAbortController = null;

        // Si ya está cerrándose o no está activo, salir
        if (!this.drawerContainer.classList.contains('active') || this.drawerContainer.classList.contains('closing')) {
            return;
        }

        this.drawerContainer.classList.remove('active');
        this.drawerContainer.classList.add('closing');

        const animTarget = this.drawerContent || this.drawerContainer;

        let isCleanedUp = false;
        const finishCleanup = () => {
            if (isCleanedUp) return;
            isCleanedUp = true;
            animTarget.removeEventListener('animationend', onAnimationEnd);
            this.cleanupDrawerDOM();
        };

        const onAnimationEnd = (e) => {
            if (e.target === animTarget) {
                finishCleanup();
            }
        };

        animTarget.addEventListener('animationend', onAnimationEnd);

        // Fallback de seguridad si animationend no se dispara
        setTimeout(() => {
            if (this.drawerContainer.classList.contains('closing')) {
                finishCleanup();
            }
        }, 280);
    }

    /**
     * Limpia el estado y contenido del drawer tras completarse la animación de salida
     */
    cleanupDrawerDOM() {
        this.drawerContainer.classList.remove('closing');
        this.drawerContainer.classList.remove('drawer-sm', 'drawer-lg', 'drawer-xl', 'drawer-fullscreen');
        document.body.style.overflow = '';
        if (this.drawerBody) {
            this.drawerBody.innerHTML = '';
        }

        // Restaurar el foco al elemento que abrió el drawer
        if (this.previousActiveElement && typeof this.previousActiveElement.focus === 'function') {
            this.previousActiveElement.focus();
            this.previousActiveElement = null;
        }
    }
}

// Instancia global disponible en window
const drawerHandler = new DrawerHandler();
window.drawerHandler = drawerHandler;