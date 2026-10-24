  //const miDropdownUsuarios = new Dropdown('dropdown-usuarios', {
  //   renderContent: () => {
  //     //remover la alerta de notificacion
  //     miDropdownUsuarios.container.querySelector('.alert-dropdown').classList.remove('active')
  //     return `
  //   <div class="notify-head">
  //       <h3 class="notify-title">Notificaciones</h3>
  //   </div>
  //   <div class="notify-body">
  //   </div >
  // `;
  //   },
  //   onOpen: () => {
  //     const bodyCards = miDropdownUsuarios.menu.querySelector('.notify-body');
  //     for (let i = 0; i <= 10; i++) {
  //       const cardNotification = document.createElement('div');
  //       cardNotification.classList.add('card-notify');

  //       const divIcon = document.createElement('div');
  //       divIcon.classList.add('icon')
  //       divIcon.innerHTML = `<span>
  //           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-bell"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M10 5a2 2 0 1 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3h-16a4 4 0 0 0 2 -3v-3a7 7 0 0 1 4 -6" /><path d="M9 17v1a3 3 0 0 0 6 0v-1" /></svg>
  //         </span>`

  //       const notifyText = document.createElement('div');
  //       notifyText.classList.add('text')
  //       const title = document.createElement('h4');
  //       title.innerText = 'Nuevo mensaje del sistema';
  //       const description = document.createElement('p');
  //       description.innerText = 'Está es una descripcion larga para mi notificacion';
  //       notifyText.appendChild(title);
  //       notifyText.appendChild(description);

  //       cardNotification.appendChild(divIcon);
  //       cardNotification.appendChild(notifyText);
  //       bodyCards.appendChild(cardNotification);
  //     }
  //   }
  // });

  // miDropdownUsuarios.container.querySelector('.alert-dropdown').classList.add('active')