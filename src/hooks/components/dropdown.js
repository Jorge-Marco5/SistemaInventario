class Dropdown {
    constructor(containerId, options = {}) {
        // Seleccionar el contenedor principal del dropdown
        this.container = document.getElementById(containerId);
        if (!this.container) throw new Error(`Contenedor #${containerId} no encontrado.`);

        // Configuración y callbacks externos
        this.renderContent = options.renderContent || (() => '<p>Sin contenido</p>');
        this.onOpen = options.onOpen || (() => { });
        this.onClose = options.onClose || (() => { });

        this.isOpen = false;
        this.isClosing = false;
        this._init();
    }

    // Inicializa la estructura básica y los eventos
    _init() {
        this.button = this.container.querySelector('[data-toggle="dropdown"]');
        this.menu = this.container.querySelector('[data-menu="dropdown"]');

        if (!this.button || !this.menu) {
            throw new Error("El contenedor debe incluir un botón (data-toggle) y un menú (data-menu).");
        }

        // Evento para abrir/cerrar
        this.button.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggle();
        });

        // Cerrar si se hace click fuera del dropdown
        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.menu.contains(e.target) && !this.button.contains(e.target)) {
                this.close();
            }
        });

        // Cerrar con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    }

    // Alterna el estado del dropdown
    toggle() {
        this.isOpen ? this.close() : this.open();
    }

    // Abre el dropdown y renderiza el contenido dinámico
    open() {
        if (this.isOpen && !this.isClosing) return;

        // Si estaba cerrándose, cancelamos el estado de cierre
        this.isClosing = false;
        this.menu.classList.remove('closing');

        // Ejecutamos la función externa para obtener el contenido HTML
        const htmlContenido = this.renderContent();
        this.menu.innerHTML = htmlContenido;

        // 1. Mostrar fuera de pantalla sin animación para medir sus dimensiones reales
        this.menu.style.animation = 'none';
        this.menu.style.visibility = 'hidden';
        this.menu.style.top = '-9999px';
        this.menu.style.left = '-9999px';
        this.menu.classList.add('show');

        // 2. Medir coordenadas del botón y del menú
        const btnRect = this.button.getBoundingClientRect();
        const menuRect = this.menu.getBoundingClientRect();

        // 3. Posicionamiento por defecto (debajo del botón con un pequeño margen)
        let top = btnRect.bottom + 8;
        let left = btnRect.left;

        // 4. Validar colisión vertical (si se sale por abajo, abrir hacia arriba)
        if (top + menuRect.height > window.innerHeight) {
            top = btnRect.top - menuRect.height - 8;
        }

        // 5. Validar colisión horizontal (si se sale por la derecha, alinear al borde derecho del botón)
        if (left + menuRect.width > window.innerWidth) {
            left = btnRect.right - menuRect.width;
        }

        // Si queda fuera por la izquierda de la pantalla
        if (left < 8) {
            left = 8;
        }

        // 6. Aplicar coordenadas finales
        this.menu.style.top = `${top}px`;
        this.menu.style.left = `${left}px`;

        // 7. Limpiar overrides para que la animación CSS se ejecute desde la posición correcta
        this.menu.style.visibility = '';
        this.menu.style.animation = '';

        this.isOpen = true;

        // Callback opcional de apertura
        this.onOpen();
    }

    // Cierra el dropdown con animación de salida sin parpadeos
    close() {
        if (!this.isOpen || this.isClosing) return;

        this.isClosing = true;
        this.menu.classList.remove('show');
        this.menu.classList.add('closing');

        const onAnimationEnd = (e) => {
            if (e.target === this.menu) {
                this.menu.removeEventListener('animationend', onAnimationEnd);
                this._finishClose();
            }
        };

        this.menu.addEventListener('animationend', onAnimationEnd);

        // Fallback de seguridad en caso de que animationend no se dispare
        setTimeout(() => {
            if (this.isClosing) {
                this._finishClose();
            }
        }, 220);
    }

    _finishClose() {
        this.menu.classList.remove('closing');
        this.menu.classList.remove('show');
        this.isOpen = false;
        this.isClosing = false;
        this.onClose();
    }
}
