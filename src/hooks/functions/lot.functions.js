const lotService = new LotService();

async function createLot(data = {}) {
    try {
        return await lotService.createLot(data)
    } catch (error) {
        console.error('Error al registrar el lote: ' + error)
    }
}

async function updateLot(id, data = {}) {
    try {
        return await lotService.updateLot(id, data)
    } catch (error) {
        console.error('Error al actualizar los datos del lote: ' + error)
    }
}