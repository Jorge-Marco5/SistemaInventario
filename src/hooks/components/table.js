class TableHandler {
    constructor(containerId = 'table-container') {
        this.containerId = containerId;
        this.tableContainer = null;
        this.tableComponent = null;
    }

    async renderTable(data) {
        this.tableContainer = document.getElementById(this.containerId);
        if (!this.tableContainer) return;

        // Asegurar que el contenedor esté limpio y contenga exactamente una sola tabla activa
        if (!this.tableComponent || !this.tableContainer.contains(this.tableComponent) || this.tableContainer.children.length > 1) {
            this.tableContainer.innerHTML = '';
            this.tableComponent = document.createElement('table');
            this.tableContainer.appendChild(this.tableComponent);
        }

        // Limpiar contenido previo de la tabla para evitar duplicaciones
        this.tableComponent.innerHTML = '';

        let items = data.data || [];
        if (!Array.isArray(items)) {
            items = [];
        }

        const hasActions = Array.isArray(data.actions) && data.actions.length > 0;

        // 1. Normalizar y resolver columnas
        // Soporta:
        // - [{ header: 'Nombre', field: 'name' }, ...]
        // - ['name', 'stock', ...] (campos directos)
        // - Si no se especifican, se infieren automáticamente del primer item
        const resolvedColumns = this.resolveColumns(data.columns, items, data.includeId);


        // 2. Renderizar título (caption)
        if (data.title) {
            const caption = document.createElement('caption');
            caption.innerText = `${data.title}`;
            this.tableComponent.appendChild(caption);
            this.tableComponent.style.borderRadius = '0 0 10px 10px';
        }

        // 3. Renderizar encabezados (thead)
        const head = this.renderColumns(resolvedColumns, hasActions);
        this.tableComponent.appendChild(head);

        // 4. Renderizar cuerpo de la tabla (tbody)
        const body = this.renderBody(items, resolvedColumns, data.actions);
        this.tableComponent.appendChild(body);
    }

    resolveColumns(columnsConfig, items, includeId = true) {
        let cols = [];

        if (Array.isArray(columnsConfig) && columnsConfig.length > 0) {
            cols = columnsConfig.map(col => {
                if (typeof col === 'string') {
                    return { header: col, field: col };
                }
                return {
                    header: col.header || col.field,
                    field: col.field,
                    formatter: col.formatter,
                    ...col // Preserva type, badgeMap, render, html, etc.
                };
            });
        } else if (items.length > 0) {
            // Deducir a partir de las claves del primer elemento
            cols = Object.keys(items[0]).map(key => ({ header: key, field: key }));
        }

        // Filtrar ID si includeId es false
        if (!includeId) {
            cols = cols.filter(col => {
                const f = String(col.field).toLowerCase();
                return f !== 'id' && f !== 'id_producto';
            });
        }

        return cols;
    }

    renderColumns(columns, hasActions = false) {
        const headTable = document.createElement('thead');
        const headRow = document.createElement('tr');

        columns.forEach(col => {
            const th = document.createElement('th');
            th.textContent = col.header;
            headRow.appendChild(th);
        });

        if (hasActions) {
            const thActions = document.createElement('th');
            thActions.textContent = 'Acciones';
            thActions.classList.add('th-actions');
            headRow.appendChild(thActions);
        }

        headTable.appendChild(headRow);
        return headTable;
    }

    /**
     * Renderiza el contenido de una celda según su tipo de columna o formateador
     */
    renderCellContent(td, col, cellValue, item, index) {
        // 1. Si la columna define una función renderizadora personalizada (render)
        if (typeof col.render === 'function') {
            const rendered = col.render(cellValue, item, index);
            if (rendered instanceof Node) {
                td.appendChild(rendered);
            } else if (rendered !== undefined && rendered !== null) {
                td.innerHTML = String(rendered);
            }
            return;
        }

        // 2. Si el valor ya es un nodo DOM (HTMLElement, SVGElement, DocumentFragment)
        if (cellValue instanceof Node) {
            td.appendChild(cellValue);
            return;
        }

        // 3. Renderizado declarativo por 'type'
        const colType = col.type ? String(col.type).toLowerCase() : null;

        switch (colType) {
            case 'badge':
            case 'pill':
            case 'status': {
                const rawVal = String(cellValue ?? '').trim();
                const rawKey = rawVal.toLowerCase();

                let variant = 'secondary';
                let label = rawVal;
                let customIcon = '';

                if (col.badgeMap && typeof col.badgeMap === 'object') {
                    const mapped = col.badgeMap[rawKey] || col.badgeMap[rawVal];
                    if (typeof mapped === 'string') {
                        variant = mapped;
                    } else if (mapped && typeof mapped === 'object') {
                        if (mapped.variant) variant = mapped.variant;
                        if (mapped.label) label = mapped.label;
                        if (mapped.icon) customIcon = mapped.icon;
                        else if (mapped.svg) customIcon = mapped.svg;
                        else if (mapped.dot && typeof mapped.dot === 'string' && mapped.dot.includes('<')) {
                            customIcon = mapped.dot;
                        }
                    }
                } else if (typeof col.badgeVariant === 'function') {
                    variant = col.badgeVariant(cellValue, item, index) || 'secondary';
                } else {
                    // Valores por defecto inteligentes
                    if (['entrada', 'in', 'in stock', 'activo', 'success', 'completado'].includes(rawKey)) {
                        variant = 'success';
                    } else if (['salida', 'out', 'out of stock', 'inactivo', 'danger', 'cancelado'].includes(rawKey)) {
                        variant = 'danger';
                    } else if (['ajuste', 'pendiente', 'warning', 'revision'].includes(rawKey)) {
                        variant = rawKey === 'ajuste' ? 'secondary' : 'warning';
                    }
                }

                // Determinar el elemento visual del badge:
                // 1. Icono personalizado (SVG o HTML)
                // 2. Punto circular (.badge-dot) si no hay icono y dot no es false
                let indicatorHtml = '';
                if (customIcon) {
                    indicatorHtml = `<span class="badge-icon badge-svg">${customIcon}</span>`;
                } else if (col.dot !== false && col.showDot !== false) {
                    indicatorHtml = `<span class="badge-dot"></span>`;
                }

                td.innerHTML = `<span class="badge ${variant}">${indicatorHtml}<span class="badge-text">${label}</span></span>`;
                break;
            }

            case 'image':
            case 'img': {
                if (!cellValue) {
                    td.textContent = '-';
                    break;
                }
                const img = document.createElement('img');
                img.classList.add('table-img');
                img.src = String(cellValue);
                img.alt = col.header || 'Imagen';
                if (col.width) img.style.width = typeof col.width === 'number' ? `${col.width}px` : col.width;
                if (col.height) img.style.height = typeof col.height === 'number' ? `${col.height}px` : col.height;
                td.appendChild(img);
                break;
            }

            case 'icon': {
                if (col.iconMap && col.iconMap[cellValue]) {
                    td.innerHTML = col.iconMap[cellValue];
                } else if (typeof cellValue === 'string' && cellValue.trim().startsWith('<svg')) {
                    td.innerHTML = cellValue;
                } else {
                    td.textContent = cellValue !== undefined && cellValue !== null ? cellValue : '';
                }
                break;
            }

            case 'html': {
                td.innerHTML = cellValue !== undefined && cellValue !== null ? String(cellValue) : '';
                break;
            }

            default: {
                if (col.html === true) {
                    td.innerHTML = cellValue !== undefined && cellValue !== null ? String(cellValue) : '';
                } else {
                    td.textContent = cellValue !== undefined && cellValue !== null ? cellValue : '';
                }
                break;
            }
        }
    }

    renderBody(items, columns, actions = []) {
        const tBody = document.createElement('tbody');
        const hasActions = Array.isArray(actions) && actions.length > 0;
        const totalColspan = columns.length + (hasActions ? 1 : 0);

        // Estado vacío (Empty State)
        if (items.length === 0) {
            const trEmpty = document.createElement('tr');
            trEmpty.classList.add('empty-row');
            trEmpty.innerHTML = `
                <td colspan="${totalColspan}">
                    <div class="empty-state">
                        <div class="empty-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m16.5 0v-2.25A2.25 2.25 0 0 0 18 3H6a2.25 2.25 0 0 0-2.25 2.25V7.5m16.5 0Y12a9 9 0 1 1-18 0V7.5m11.25 3.75h-3"/>
                            </svg>
                        </div>
                        <h3 class="empty-title">No hay registros disponibles</h3>
                        <p class="empty-description">Aún no hay elementos registrados para mostrar.</p>
                    </div>
                </td>
            `;
            tBody.appendChild(trEmpty);
            return tBody;
        }

        items.forEach((item, index) => {
            const tr = document.createElement('tr');
            const rowId = item.id || index;
            tr.setAttribute('id', `row-${rowId}`);

            // Celdas de datos mapeadas estrictamente por su field
            columns.forEach(col => {
                const td = document.createElement('td');
                let cellValue = item[col.field];

                if (typeof col.formatter === 'function') {
                    cellValue = col.formatter(cellValue, item, index);
                }

                this.renderCellContent(td, col, cellValue, item, index);
                tr.appendChild(td);
            });

            // Columna de acciones
            if (hasActions) {
                const tdActions = document.createElement('td');
                tdActions.classList.add('td-actions');

                actions.forEach(action => {
                    // Si la acción tiene condición de visibilidad
                    if (typeof action.show === 'function' && !action.show(item, index)) {
                        return;
                    }

                    const btn = document.createElement('button');
                    btn.type = 'button';
                    btn.className = action.className || 'btn-table-action square';
                    btn.disabled = typeof action.disabled === 'function' ? action.disabled(item, index) : Boolean(action.disabled);
                    if (btn.disabled) {
                        btn.style.opacity = '0.5';
                        btn.style.pointerEvents = "none";
                        btn.style.cursor = "not-allowed";
                    }

                    if (action.title) {
                        btn.title = action.title;
                    }

                    // Contenido del botón: HTML (svg/iconos) o texto plano
                    if (action.html) {
                        btn.innerHTML = action.html;
                    } else if (action.label) {
                        btn.textContent = action.label;
                    }

                    // Escuchar evento click y propagar el item actual
                    btn.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (btn.disabled) {
                            return;
                        }
                        if (typeof action.onClick === 'function') {
                            action.onClick(item, index, tr);
                        }
                    });

                    tdActions.appendChild(btn);
                });

                tr.appendChild(tdActions);
            }

            tBody.appendChild(tr);
        });

        return tBody;
    }

    destroy() {
        if (this.tableContainer) {
            this.tableContainer.innerHTML = '';
        }
        this.tableComponent = null;
    }
}