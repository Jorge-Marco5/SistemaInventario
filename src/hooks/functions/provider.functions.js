const providerService = new ProviderService();

async function getProviders(q, limit, currentPage) {
    try {
        return await providerService.getProviders(q, limit, currentPage);
    } catch (error) {
        throw new Error("Error al listar los proveedores: " + error);
    }
}

async function getProviderById(id) {
    try {
        if (!id) {
            throw new Error("Ingresa el id del proveedor")
        }
        return await providerService.getProvider(Number(id));
    } catch (error) {
        throw new Error("Error al listar los proveedores: " + error);
    }
}

async function createProvider(data) {
    try {
        //Datos no pueden estár vacios
        if (!data) {
            throw new Error("Datos de proveedor vacios");
        }
        //Datos obligatorios del proveedor
        if (!data.name || !data.phone1 || !data.email1) {
            throw new Error("Nombre, Numero de telefono y email no pueden quedar vacios")
        }

        //Conversion a tipos validos
        data.phone1 = data.phone1.toString();//String
        data.phone2 = data.phone2 ? data.phone2.toString() :  '';//String || ''

        data.email2 = data.email2 ? data.email2.toString : '';//String || ''

        return await providerService.createProvider(data);
    } catch (error) {
        console.error(error)
        throw new Error("Error al registrar proveedor: " + error);
    }
}

async function updateProvider(id, data) {
    try {
        //Datos no pueden estár vacios
        if (!data) throw new Error("Datos de proveedor vacios");
        
        //Datos obligatorios del proveedor
        if (!data.name || !data.phone1 || !data.email1) throw new Error("Nombre, Numero de telefono y email no pueden quedar vacios");

        //Conversion a tipos validos
        data.phone1 = data.phone1.toString();//String
        data.phone2 = data.phone2 ? data.phone2.toString() :  '';//String || ''

        data.email2 = data.email2 ? data.email2.toString : '';//String || ''

        return await providerService.updateProvider(Number(id), data);
    } catch (error) {
        console.error(error);
        throw new Error("Error al actualizar proveedor: " + error);
    }
}

async function deleteProvider(id) {
    try {
        //Verificar que siempre 
        if(!id) throw new Error("No se proporciono el proveedor a eliminar");
        return await providerService.deleteProvider(Number(id));
    } catch (error) {
        throw new Error("Error al eliminar proveedor");
    }
}