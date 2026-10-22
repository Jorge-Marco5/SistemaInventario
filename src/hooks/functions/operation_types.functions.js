const operationTypeService = new OperationTypeService();

async function getOperationTypes() {
    try {
        return await operationTypeService.getOperationTypes();
    } catch (error) {
        console.error(error || "Error al obtener el tipo de operación");
    }
}

async function getOperationType(id_operation_type) {
    try {
        return await operationTypeService.getOperationType(id_operation_type);
    } catch (error) {
        console.error(error || "Error al obtener el tipo de operación");
    }
}