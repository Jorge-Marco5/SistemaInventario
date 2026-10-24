dayjs.extend(window.dayjs_plugin_utc);
dayjs.extend(window.dayjs_plugin_timezone);
dayjs.locale('es');

import { navigateTo, registerTab, getParam, getParams, setParams } from "./hooks/router.js";

window.addEventListener("DOMContentLoaded", () => {

  // Botón de navegación hacia atrás en el historial
  const backPage = document.querySelector('#back-page');
  backPage.addEventListener('click', () => {
    window.history.back();
  });

  // Botón de navegación hacia adelante en el historial
  const forwardPage = document.querySelector('#forward-page');
  forwardPage.addEventListener('click', () => {
    window.history.forward();
  });

  // Controlador para el template 'products'
  registerTab("products", {
    async mount(container, params) {
      // Cargar la lógica del controlador para la página de productos
      const productsPage = new ProductsPage();
      return await productsPage.logicProductsPage(container, params);
    },
    unmount(container) {
      // Template desmontado
    }
  });

  // Controlador para el template 'lots'
  registerTab("lots", {
    async mount(container, params = {}) {
      // Cargar la lógica del controlador para la página de lotes
      const lotsPage = new LotsPage();
      return await lotsPage.logicLotsPage(container, params);
    },
    unmount(container) {
      // Cleanup de la pestaña lots
    }
  });

  // Controlador para el template 'operations'
  registerTab("operations", {
    async mount(container, params = {}) {
      const operationsPage = new OperationsPage();
      return await operationsPage.logicOperationsPage(container, params);
    },
    unmount(container) {
      // Cleanup de la pestaña operations
    }
  });

  // Controlador para el template 'categories'
  registerTab("categories", {
    async mount(container, params = {}) {
      const categoriesPage = new CategoriesPage();
      return await categoriesPage.logicCategoriesPage(container, params);
    },
    unmount(container) {
      // Cleanup de la pestaña categories
    }
  });

  // Controlador para el template 'providers'
  registerTab("providers", {
    async mount(container, params = {}) {
      const providersPage = new ProvidersPage();
      return await providersPage.logicProvidersPage(container, params);
    },
    unmount(container) {
      // Cleanup de la pestaña providers
    }
  });

});
