const operationService = new OperationService();

async function getAllOperations(q = '', limit = 10, currentPage = 1) {
    try {
        return await operationService.getOperations(q, limit, currentPage);
    } catch (error) {
        console.error('Error al listar las operaciones')
    }
}

async function createOperation(data = {}) {
    try {
        return await operationService.createOperation(data);
    } catch (error) {
        console.error('Error al registrar la operación');
    }
}