dayjs.extend(window.dayjs_plugin_utc);
dayjs.extend(window.dayjs_plugin_timezone);
dayjs.locale('es');

import { navigateTo, registerTab, getParam, getParams, setParams } from "./hooks/router.js";

window.addEventListener("DOMContentLoaded", () => {

  const backPage = document.querySelector('#back-page');
  backPage.addEventListener('click', (e) => {
    window.history.back();
  })

  const forwardPage = document.querySelector('#forward-page');
  forwardPage.addEventListener('click', (e) => {
    window.history.go();
  })

  // Controlador para el template 'home'
  registerTab("products", {
    async mount(container, params) {
      //Cargar la logica del controlador para la pagina de productos
      const productsPage = new ProductsPage();
      await productsPage.logicProductsPage(container, params);
    },
    unmount(container) {
      // Template desmontado
    }
  });

  // Controlador para el template 'lots'
  registerTab("lots", {
    async mount(container, params = {}) {
      //Cargar la logica del controlador para la pagina de lotes
      const lotsPage = new LotsPage();
      await lotsPage.logicLotsPage(container, params);
    },
    unmount(container) {
      // Cleanup de la pestaña lots
    }
  });

  // Controlador para el template 'operations'
  registerTab("operations", {
    async mount(container, params = {}) {
      const operationsPage = new OperationsPage();
      await operationsPage.logicOperationsPage(container, params);
    },
    unmount(container) {
      //console.log("[Profile] Template desmontado");
    }
  });

  // Controlador para el template 'operations'
  registerTab("categories", {
    async mount(container, params = {}) {
      const categoriesPage = new CategoriesPage();
      await categoriesPage.logicCategoriesPage(container, params);
    },
    unmount(container) {
      //console.log("[Profile] Template desmontado");
    }
  });

  // Controlador para el template 'operations'
  registerTab("providers", {
    async mount(container, params = {}) {
      const providersPage = new ProvidersPage();
      await providersPage.logicProvidersPage(container, params);
    },
    unmount(container) {
      //console.log("[Profile] Template desmontado");
    }
  });


});