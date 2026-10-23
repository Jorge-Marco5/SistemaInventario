dayjs.extend(window.dayjs_plugin_utc);
dayjs.extend(window.dayjs_plugin_timezone);
dayjs.locale('es');

import { navigateTo, registerTab, getParam, getParams, setParams } from "./hooks/router.js";

window.addEventListener("DOMContentLoaded", () => {

  /**
   * Dropdown de notificaciones
   */
  const miDropdownUsuarios = new Dropdown('dropdown-usuarios', {
    renderContent: () => {
      //remover la alerta de notificacion
      miDropdownUsuarios.container.querySelector('.alert-dropdown').classList.remove('active')
      return `
    <div class="notify-head">
        <h3 class="notify-title">Notificaciones</h3>
    </div>
    <div class="notify-body">
    </div >
  `;
    },
    onOpen: () => {
      const bodyCards = miDropdownUsuarios.menu.querySelector('.notify-body');
      for (let i = 0; i <= 10; i++) {
        const cardNotification = document.createElement('div');
        cardNotification.classList.add('card-notify');

        const divIcon = document.createElement('div');
        divIcon.classList.add('icon')
        divIcon.innerHTML = `<span>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-bell"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M10 5a2 2 0 1 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3h-16a4 4 0 0 0 2 -3v-3a7 7 0 0 1 4 -6" /><path d="M9 17v1a3 3 0 0 0 6 0v-1" /></svg>
          </span>`

        const notifyText = document.createElement('div');
        notifyText.classList.add('text')
        const title = document.createElement('h4');
        title.innerText = 'Nuevo mensaje del sistema';
        const description = document.createElement('p');
        description.innerText = 'Está es una descripcion larga para mi notificacion';
        notifyText.appendChild(title);
        notifyText.appendChild(description);

        cardNotification.appendChild(divIcon);
        cardNotification.appendChild(notifyText);
        bodyCards.appendChild(cardNotification);
      }
    }
  });

  miDropdownUsuarios.container.querySelector('.alert-dropdown').classList.add('active')

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