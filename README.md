# Sistema de inventario **Diconsa**

Sistema para la gestión y control de inventario, productos, lotes y operaciones comerciales. Construido con [Tauri v2](https://tauri.app/), Rust y tecnologías web estándar.

---

## 📚 Documentación Técnica del Proyecto

La documentación completa de arquitectura, base de datos, flujos de funcionamiento y referencia de comandos se encuentra en la carpeta [`docs/`](./docs/):

1. [**Visión General y Arquitectura (`docs/ANALISIS_PROYECTO.md`)**](./docs/ANALISIS_PROYECTO.md): Stack tecnológico, diagrama general del sistema, módulos y estructura del repositorio.
2. [**Esquema de Base de Datos (`docs/ESQUEMA_BASE_DATOS.md`)**](./docs/ESQUEMA_BASE_DATOS.md): Configuración de SQLite (modo WAL), diagrama Entidad-Relación, diccionario de tablas, manejo de centavos y migraciones.
3. [**Flujo Backend y Base de Datos (`docs/FLUJO_BACKEND_SISTEMA.md`)**](./docs/FLUJO_BACKEND_SISTEMA.md): Comunicación Cliente ↔ Backend ↔ SQLite, arranque de la app, búsquedas paginadas, entradas/ajustes de lotes y salidas FEFO.
4. [**Funcionamiento del Frontend (`docs/FLUJO_FRONTEND_SISTEMA.md`)**](./docs/FLUJO_FRONTEND_SISTEMA.md): Enrutador SPA por `<template>`, ciclo de vida de pestañas (`mount`/`unmount`) y catálogo de componentes UI reutilizables.
5. [**Referencia de Comandos IPC (`docs/REFERENCIA_COMANDOS_IPC.md`)**](./docs/REFERENCIA_COMANDOS_IPC.md): Catálogo completo de comandos Tauri (`invoke`), estructuras de entrada/salida y utilidades del backend.

---

## 🚀 Requisitos Previos

### En Linux (Debian, Ubuntu, Arch, CachyOS, etc.)

Asegúrate de tener instaladas las dependencias del sistema requeridas por WebKit y Tauri:

- **Arch Linux / CachyOS / Manjaro:**
  ```bash
  sudo pacman -S --needed base-devel webkit2gtk-4.1 gtk3 librsvg
  ```

- **Ubuntu / Debian / Linux Mint:**
  ```bash
  sudo apt update
  sudo apt install -y build-essential libwebkit2gtk-4.1-dev libgtk-3-dev librsvg2-dev patchelf libssl-dev
  ```

- **Rust y Node.js:**
  - [Rust](https://rustup.rs/): `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
  - Node.js (v18+) y `pnpm`: `npm install -g pnpm`

---

### En Windows

1. **Node.js y pnpm:**
   - Instala [Node.js](https://nodejs.org/) y luego ejecuta:
     ```powershell
     npm install -g pnpm
     ```

2. **Herramientas de C++:**
   - Descarga e instala los **Visual Studio C++ Build Tools** desde [Visual Studio](https://visualstudio.microsoft.com/visual-cpp-build-tools/) seleccionando la carga de trabajo *"Desarrollo para el escritorio con C++"*.

3. **Rust:**
   - Descarga e instala [Rustup](https://rustup.rs/) (seleccionando el target `x86_64-pc-windows-msvc`).

4. **WebView2:**
   - Preinstalado en Windows 10 y 11. En caso necesario, se puede descargar el [WebView2 Runtime](https://developer.microsoft.com/en-us/microsoft-edge/webview2/).

---

## 📦 Instalación de Dependencias

Ejecuta en la raíz del proyecto:

```bash
pnpm install
```

---

## 🛠️ Modo Desarrollo

Para iniciar la aplicación en modo desarrollo con recarga rápida:

```bash
pnpm dev
# o alternativamente:
pnpm tauri dev
```

---

## 🏗️ Construcción para Producción

### 🐧 Compilar en Linux

Para generar los instaladores nativos en Linux:

```bash
# Compilar los paquetes disponibles (ej. .deb, .rpm):
pnpm run tauri build

# O generar únicamente el paquete .deb:
pnpm run tauri build --bundles deb
```

Los paquetes resultantes se encontrarán en:
- **Debian / Ubuntu (.deb):** `src-tauri/target/release/bundle/deb/`
- **RPM:** `src-tauri/target/release/bundle/rpm/`

---

### 🪟 Compilar en Windows

Ejecuta en PowerShell o CMD dentro del entorno Windows:

```powershell
pnpm run tauri build
```

El instalador resultante se generará en:
- **Instalador ejecutable (.exe NSIS):** `src-tauri\target\release\bundle\nsis\sistemainventario_0.1.0_x64-setup.exe`

> **Nota:** El instalador NSIS está configurado en modo `currentUser`, por lo que los usuarios finales pueden instalarlo sin requerir permisos de administrador.

---

## 🤖 Compilación Multiplataforma Automatizada (CI/CD)

El proyecto incluye un flujo de trabajo configurado en [`.github/workflows/build.yml`](.github/workflows/build.yml).

Al subir el código a GitHub y crear una etiqueta (`git tag v0.1.0` y `git push --tags`) o hacer push a `main`, GitHub Actions compilará automáticamente en paralelo las versiones de **Linux** y **Windows**, generando los binarios e instaladores en la sección de *Releases* del repositorio.
