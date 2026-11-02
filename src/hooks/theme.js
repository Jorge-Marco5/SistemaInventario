let storedColor = localStorage.getItem("theme_color");
function initThemeColor() {
    if (storedColor || storedColor === "") {
        const defaultColor = " #611232";
        localStorage.setItem("theme_color", defaultColor);
        storedColor = defaultColor;
    }
    document.documentElement.style.setProperty('--primary', storedColor);
}

initThemeColor();

document.addEventListener("DOMContentLoaded", () => {
    const toggle = document.getElementById("theme-toggle");
    const body = document.body;
    const themePreference = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
        const storedTheme = 'light';//localStorage.getItem("theme");
        const isDark = storedTheme
            ? storedTheme === "dark"
            : themePreference.matches;

        body.classList.toggle("dark-mode", isDark);
        if (toggle) toggle.checked = isDark;
    };

    applyTheme();

    if (toggle) {
        toggle.addEventListener("change", () => {
            const isDark = toggle.checked;
            toggle.style.transform = "translateX(32px)"
            body.classList.toggle("dark-mode", isDark);
            localStorage.setItem("theme", isDark ? "dark" : "light");
        });
    }

    themePreference.addEventListener("change", () => {
        if (!localStorage.getItem("theme")) {
            applyTheme();
        }
    });
});