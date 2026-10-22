class OperationTypeService {
  /**
   * Obtiene la lista de categorias registradas en el sistema
   * @returns
   */
  async getOperationTypes() {
    return await invoke("get_operation_types");
  }

  async getOperationType(id_operation_type) {
    return await invoke("get_operation_type", {
      idOperationType: id_operation_type,
    });
  }
}
