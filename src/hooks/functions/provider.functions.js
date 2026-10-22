const providerService = new ProviderService();

async function getProviders(q, limit, currentPage) {
    try {
        return await providerService.getProviders(q, limit, currentPage);
    } catch (error) {
        console.error("Error al listar los proveedores: " + error);
    }
}

async function getProviderById(provider_id) {
    try {
        return await providerService.getProvider(provider_id);
    } catch (error) {
        console.error("Error al listar los proveedores: " + error);
    }
}

async function createProvder() {
    try {
        const newProvider = {
            name: "Coca Cola",
            phone1: "987654321",
            phone2: "",
            email1: "cocacola@example.com",
            email2: "cocacola2@example.com",
        };

        await providerService.createProvider(newProvider);
        console.log("Proveedor registrado correctamente");
    } catch (error) {
        console.error("Error al registrar proveedor");
    }
}

async function updateProvider() {
    try {
        const updateProvider = {
            name: "Paper Mate",
            phone1: "978654321",
            phone2: "",
            email1: "papermate@example.com",
            email2: "papermate2@example.com",
        };

        await providerService.updateProvider(6, updateProvider);
        console.log("Proveedor actualizado correctamente");
    } catch (error) {
        console.error("Error al actualizar proveedor");
    }
}

async function deleteProvider(id) {
    try {
        await providerService.deleteProvider(id);
        console.log("Proveedor eliminado correctamente");
    } catch (error) {
        console.error("Error al eliminar proveedor");
    }
}