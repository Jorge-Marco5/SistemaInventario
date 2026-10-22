# Sistema de inventario **Diconsa**

Sistema para la gestión y control de inventario, productos, lotes y operaciones comerciales. Construido con [Tauri v2](https://tauri.app/), Rust y tecnologías web estándar.

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
