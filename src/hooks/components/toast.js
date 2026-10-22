// Sistema de Notificaciones Toast
function showToast(message, type = 'info', duration = 4000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast show ${type}`;

    // Iconos dinámicos según el tipo
    let icon = '';
    if (type === 'success') {
        icon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          class="icon icon-tabler icons-tabler-outline icon-tabler-circle-check">
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
          <path d="M9 12l2 2l4 -4" />
        </svg>`;
    } else if (type === 'danger') {
        icon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          class="icon icon-tabler icons-tabler-outline icon-tabler-alert-hexagon">
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path
            d="M19.875 6.27c.7 .398 1.13 1.143 1.125 1.948v7.284c0 .809 -.443 1.555 -1.158 1.948l-6.75 4.27a2.269 2.269 0 0 1 -2.184 0l-6.75 -4.27a2.225 2.225 0 0 1 -1.158 -1.948v-7.285c0 -.809 .443 -1.554 1.158 -1.947l6.75 -3.98a2.33 2.33 0 0 1 2.25 0l6.75 3.98h-.033" />
          <path d="M12 8v4" />
          <path d="M12 16h.01" />
        </svg>`;
    } else if (type === 'info') {
        icon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          class="icon icon-tabler icons-tabler-outline icon-tabler-info-circle">
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
          <path d="M12 9h.01" />
          <path d="M11 12h1v4h1" />
        </svg>`;
    } else if (type === 'warning') {
        icon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          class="icon icon-tabler icons-tabler-outline icon-tabler-alert-triangle">
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M12 9v4" />
          <path
            d="M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0" />
          <path d="M12 16h.01" />
        </svg>`;
    }

    toast.innerHTML = `
      <span>${icon}</span>
      <p class="toast-message">${message}</p>
      <span class="closeToast" title="Cerrar"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          class="icon icon-tabler icons-tabler-outline icon-tabler-x">
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M18 6l-12 12" />
          <path d="M6 6l12 12" />
        </svg></span>
    `;

    container.appendChild(toast);

    let isDismissed = false;
    let autoDismissTimer = null;

    // Función unificada para cerrar con fade-out
    const dismiss = () => {
        if (isDismissed) return;
        isDismissed = true;
        clearTimeout(autoDismissTimer);

        // Cambiar clases para activar animación fadeOut
        toast.classList.remove('show');
        toast.classList.add('hide');

        // Esperar a que finalice la animación CSS antes de removerlo del DOM
        toast.addEventListener('animationend', () => {
            toast.remove();
        }, { once: true });

        // Fallback de seguridad en caso de que animationend no se dispare
        setTimeout(() => {
            if (toast.parentElement) toast.remove();
        }, 400);
    };

    // Auto-eliminar después del tiempo configurado
    if (duration > 0) {
        autoDismissTimer = setTimeout(dismiss, duration);
    }

    // Botón manual de cierre
    const closeToast = toast.querySelector('.closeToast');
    if (closeToast) {
        closeToast.addEventListener('click', (e) => {
            e.stopPropagation();
            dismiss();
        });
    }

    // Pausar el temporizador si el usuario mantiene el mouse sobre el toast
    toast.addEventListener('mouseenter', () => {
        if (!isDismissed && autoDismissTimer) {
            clearTimeout(autoDismissTimer);
        }
    });

    toast.addEventListener('mouseleave', () => {
        if (!isDismissed && duration > 0) {
            autoDismissTimer = setTimeout(dismiss, 1200); // 1.2 segundos al quitar el cursor
        }
    });
}

if (typeof window !== 'undefined') {
    window.showToast = showToast;
}