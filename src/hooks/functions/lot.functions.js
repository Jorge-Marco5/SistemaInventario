const lotService = new LotService();

async function createLot(data = {}) {
    try {
        return await lotService.createLot(data)
    } catch (error) {
        throw new Error(error || 'Error al registrar el lote')
    }
}

async function updateLot(id, data = {}) {
    try {
        return await lotService.updateLot(id, data)
    } catch (error) {
        throw new Error('Error al actualizar los datos del lote: ' + error)
    }
}