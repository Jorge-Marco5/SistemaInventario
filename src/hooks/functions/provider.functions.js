const providerService = new ProviderService();

async function getProviders(q, limit, currentPage) {
    try {
        return await providerService.getProviders(q, limit, currentPage);
    } catch (error) {
        throw new Error("Error al listar los proveedores: " + error);
    }
}

async function getProviderById(provider_id) {
    try {
        if (!provider_id) {
            throw new Error("Ingresa el id del proveedor")
        }
        return await providerService.getProvider(provider_id);
    } catch (error) {
        throw new Error("Error al listar los proveedores: " + error);
    }
}

async function createProvider(data) {
    try {
        if (!data) {
            return;
        }
        if (!data.phone1 || !data.email1) {
            throw new Error("Numero de telefono y email no pueden quedar vacios")
        }
        data.phone1 = data.phone1.toString();
        data.phone2 ? data.phone2 = data.phone2.toString() : '';
        return await providerService.createProvider(data);
    } catch (error) {
        console.error(error)
        throw new Error("Error al registrar proveedor: " + error);
    }
}

async function updateProvider(id, data) {
    try {
        if (!data) {
            return;
        }
        if (!data.phone1 || !data.email1) {
            throw new Error("Numero de telefono y email no pueden quedar vacios")
        }
        data.phone1 = data.phone1.toString();
        data.phone2 ? data.phone2 = data.phone2.toString() : '';
        return await providerService.updateProvider(Number(id), data);
    } catch (error) {
        console.error(error)
        throw new Error("Error al actualizar proveedor: " + error);
    }
}

async function deleteProvider(id) {
    try {
        return await providerService.deleteProvider(id);
    } catch (error) {
        throw new Error("Error al eliminar proveedor");
    }
}