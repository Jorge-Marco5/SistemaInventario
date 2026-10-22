// Registro de controladores por template (mount, unmount)
const controllers = new Map();

// Estado actual
let currentTabId = null;
let currentCleanup = null;
let contentContainer = null;

/**
 * Serializa un objeto de parámetros en un string de consulta (?k1=v1&k2=v2)
 * @param {Object} [params={}]
 * @returns {string}
 */
export function buildQueryString(params = {}) {
    if (!params || typeof params !== 'object') return '';
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
            searchParams.set(key, String(val));
        }
    });
    const qs = searchParams.toString();
    return qs ? `?${qs}` : '';
}

/**
 * Obtiene todos los parámetros actuales de la URL (query string, hash query y history.state).
 * @returns {Object} Diccionario con los parámetros clave-valor
 */
export function getParams() {
    const params = {};

    // 1. Parámetros guardados en el estado de navegación
    if (history.state && history.state.params && typeof history.state.params === 'object') {
        Object.assign(params, history.state.params);
    }

    // 2. Parámetros de la query string estándar (?foo=bar)
    if (window.location.search) {
        const searchParams = new URLSearchParams(window.location.search);
        searchParams.forEach((val, key) => {
            params[key] = val;
        });
    }

    // 3. Parámetros contenidos en el hash (#tab?foo=bar o #/tab?foo=bar)
    if (window.location.hash && window.location.hash.includes('?')) {
        const hashQuery = window.location.hash.split('?')[1];
        if (hashQuery) {
            const hashParams = new URLSearchParams(hashQuery);
            hashParams.forEach((val, key) => {
                params[key] = val;
            });
        }
    }

    return params;
}

/**
 * Obtiene el valor de un parámetro específico de la URL.
 * @param {string} key - Nombre del parámetro
 * @param {*} [defaultValue=null] - Valor por defecto si no existe
 * @returns {string|null}
 */
export function getParam(key, defaultValue = null) {
    const params = getParams();
    return params[key] !== undefined ? params[key] : defaultValue;
}

/**
 * Actualiza los parámetros de la URL actual sin cambiar de pestaña ni recargar la página.
 * @param {Object} newParams - Parámetros a actualizar o agregar
 * @param {boolean} [replace=true] - Si reemplaza la entrada actual del historial o genera un nuevo estado
 */
export function setParams(newParams = {}, replace = true) {
    const currentParams = getParams();
    const merged = { ...currentParams, ...newParams };

    Object.keys(merged).forEach((k) => {
        if (merged[k] === null || merged[k] === undefined || merged[k] === '') {
            delete merged[k];
        }
    });

    const cleanId = currentTabId || getTabFromUrl();
    const qs = buildQueryString(merged);

    try {
        if (window.location.protocol === "file:") {
            window.location.hash = `#${cleanId}${qs}`;
        } else {
            const targetPath = `/${cleanId}${qs}`;
            if (replace) {
                history.replaceState({ tab: cleanId, params: merged }, "", targetPath);
            } else {
                history.pushState({ tab: cleanId, params: merged }, "", targetPath);
            }
        }
    } catch {
        window.location.hash = `#${cleanId}${qs}`;
    }
}

/**
 * Registra los métodos del ciclo de vida (mount, unmount) para un template específico.
 * @param {string} tabId - El identificador del template (ej: 'products', 'lots')
 * @param {{ mount?: (container: HTMLElement, params: Object) => (() => void) | void, unmount?: (container: HTMLElement) => void }} controller
 */
export function registerTab(tabId, controller) {
    controllers.set(tabId, controller);

    // Si este template ya está actualmente montado en el DOM, ejecutar mount inmediatamente
    if (currentTabId === tabId && contentContainer) {
        if (typeof controller.mount === "function") {
            try {
                const cleanup = controller.mount(contentContainer, getParams());
                if (typeof cleanup === "function") {
                    currentCleanup = cleanup;
                }
            } catch (err) {
                console.error(`[TabManager] Error al montar la pestaña '${tabId}':`, err);
            }
        }
    }
}

/**
 * Obtiene el ID del tab a partir de la URL actual (pathname o hash) con fallback al botón activo.
 * @returns {string} ID del template a cargar
 */
export function getTabFromUrl() {
    // 1. Revisar si hay hash (#profile o #/profile) ignorando parámetros
    if (window.location.hash) {
        const hash = window.location.hash.replace(/^#\/?/, "").split("?")[0].trim();
        if (hash && document.getElementById(hash)) {
            return hash;
        }
    }

    // 2. Revisar si hay pathname (/profile, /home, etc.) ignorando parámetros
    if (window.location.protocol !== "file:") {
        const cleanPath = window.location.pathname.split("?")[0];
        const segments = cleanPath
            .split("/")
            .filter(s => s && s !== "index.html");
        const lastSegment = segments[segments.length - 1];
        if (lastSegment && document.getElementById(lastSegment)) {
            return lastSegment;
        }
    }

    // 3. Fallback: buscar el botón que tenga la clase 'active'
    const activeBtn = document.querySelector(".tab-btn.active");
    if (activeBtn && activeBtn.getAttribute("data-target")) {
        const target = activeBtn.getAttribute("data-target");
        if (document.getElementById(target)) return target;
    }

    // 4. Fallback: primer botón de pestaña disponible
    const firstBtn = document.querySelector(".tab-btn");
    if (firstBtn && firstBtn.getAttribute("data-target")) {
        const target = firstBtn.getAttribute("data-target");
        if (document.getElementById(target)) return target;
    }

    return "products";
}

/**
 * Sincroniza la clase 'active' de los botones de pestañas según el tabId actual.
 * @param {string} tabId 
 */
export function updateActiveButton(tabId) {
    const buttons = document.querySelectorAll(".tab-btn");
    buttons.forEach(button => {
        const target = button.getAttribute("data-target");
        if (target === tabId) {
            button.classList.add("active");
        } else {
            button.classList.remove("active");
        }
    });
}

/**
 * Actualiza la URL en el navegador usando History API o Hash con soporte de parámetros.
 * @param {string} tabId 
 * @param {Object} [params={}]
 */
function updateUrl(tabId, params = {}) {
    const cleanId = String(tabId).replace(/^\/|\/$/g, "").trim();
    const qs = buildQueryString(params);
    try {
        if (window.location.protocol === "file:") {
            window.location.hash = `#${cleanId}${qs}`;
        } else {
            const targetPath = `/${cleanId}${qs}`;
            if (window.location.pathname + window.location.search !== targetPath) {
                history.pushState({ tab: cleanId, params }, "", targetPath);
            }
        }
    } catch {
        window.location.hash = `#${cleanId}${qs}`;
    }
}

/**
 * Carga el contenido de un template en el contenedor, gestionando el ciclo de vida y parámetros.
 * @param {string} templateId - ID del template a mostrar
 * @param {boolean} [pushState=false] - Si debe actualizar el historial del navegador
 * @param {Object} [customParams=null] - Parámetros explícitos a pasar y reflejar en la URL
 */
export function loadTabContent(templateId, pushState = false, customParams = null) {
    if (!contentContainer) {
        contentContainer = document.getElementById("tab-content");
    }
    if (!contentContainer) return;

    // Normalizar ID (remover posibles slashes y queries)
    const cleanId = String(templateId).replace(/^\/|\/$/g, "").split("?")[0].trim();

    // Resolver parámetros: explícitos o extraídos de la URL actual
    const finalParams = customParams !== null && typeof customParams === 'object'
        ? customParams
        : getParams();

    const hasNewParams = customParams !== null && Object.keys(customParams).length > 0;

    // Si ya estamos en esta pestaña, sin nuevos parámetros y ya tiene contenido, no duplicar trabajo
    if (!hasNewParams && currentTabId === cleanId && contentContainer.children.length > 0) {
        return;
    }

    const template = document.getElementById(cleanId);
    if (!template || template.tagName !== "TEMPLATE") {
        console.warn(`[TabManager] No se encontró el <template id="${cleanId}">`);
        return;
    }

    // 1. Ejecutar unmount / cleanup del tab actual si existe
    if (currentTabId) {
        const prevController = controllers.get(currentTabId);
        if (typeof currentCleanup === "function") {
            try {
                currentCleanup(contentContainer);
            } catch (err) {
                console.error(`[TabManager] Error en cleanup de '${currentTabId}':`, err);
            }
            currentCleanup = null;
        }
        if (prevController && typeof prevController.unmount === "function") {
            try {
                prevController.unmount(contentContainer);
            } catch (err) {
                console.error(`[TabManager] Error en unmount de '${currentTabId}':`, err);
            }
        }
    }

    // 2. Ocultar contenido previo
    contentContainer.classList.remove("fade-in");
    contentContainer.innerHTML = "";

    // 3. Clonar e insertar el nuevo template en el DOM
    const clone = template.content.cloneNode(true);
    contentContainer.appendChild(clone);

    // 4. Actualizar pestaña actual y botones en la interfaz
    currentTabId = cleanId;
    updateActiveButton(cleanId);

    // 5. Actualizar la URL si se requiere
    if (pushState) {
        updateUrl(cleanId, finalParams);
    }

    // 6. Ejecutar mount del nuevo tab pasando container y los parámetros recibidos
    const nextController = controllers.get(cleanId);
    if (nextController && typeof nextController.mount === "function") {
        try {
            const cleanup = nextController.mount(contentContainer, finalParams);
            if (typeof cleanup === "function") {
                currentCleanup = cleanup;
            }
        } catch (err) {
            console.error(`[TabManager] Error en mount de '${cleanId}':`, err);
        }
    }

    // 7. Disparar fade-in de manera suave en el siguiente frame sin reflow forzado
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            contentContainer.classList.add("fade-in");
        });
    });
}

/**
 * Navega hacia una pestaña actualizando la URL, el historial y pasando parámetros opcionales.
 * @param {string} tabId - Identificador del template al que se navega
 * @param {Object} [params={}] - Parámetros a añadir a la URL y enviar al mount (ej: { productId: 5 })
 */
export function navigateTo(tabId, params = {}) {
    loadTabContent(tabId, true, params);
}

/**
 * Inicializa la escucha de eventos y la carga inicial de pestañas.
 */
export function initTabs() {
    contentContainer = document.getElementById("tab-content");

    // Escuchar clics en los botones de pestañas
    const buttons = document.querySelectorAll(".tab-btn");
    buttons.forEach(button => {
        button.addEventListener("click", (e) => {
            e.preventDefault();
            const target = button.getAttribute("data-target");
            if (target) {
                navigateTo(target);
            }
        });
    });

    // Escuchar navegación del historial (Atrás / Adelante)
    window.addEventListener("popstate", (e) => {
        const target = (e.state && e.state.tab) || getTabFromUrl();
        const params = (e.state && e.state.params) || getParams();
        loadTabContent(target, false, params);
    });

    // Escuchar cambios de hash si aplica
    window.addEventListener("hashchange", () => {
        const target = getTabFromUrl();
        const params = getParams();
        loadTabContent(target, false, params);
    });

    // Cargar la pestaña inicial basada en la URL actual y sus parámetros
    const initialTab = getTabFromUrl();
    loadTabContent(initialTab, false, getParams());
}

// Inicialización automática cuando el DOM esté listo
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTabs);
} else {
    initTabs();
}

// Exponer en window para acceso global opcional
if (typeof window !== "undefined") {
    window.TabManager = {
        registerTab,
        loadTabContent,
        navigateTo,
        getTabFromUrl,
        getParams,
        getParam,
        setParams,
        initTabs,
        getCurrentTab: () => currentTabId
    };
    window.registerTab = registerTab;
    window.navigateTo = navigateTo;
    window.getParams = getParams;
    window.getParam = getParam;
    window.setParams = setParams;
}


