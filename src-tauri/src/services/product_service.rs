use sqlx::SqlitePool;

use crate::{
    models::{
        operation::{CreateOperation, ReturnResOperation},
        product::{
            CreateProduct, PaginatedProducts, PaginatedProductsFull, Product, ProductFull,
            ProductQueryParams, UpdateProduct,
        },
    },
    repositories::{
        category_repository::CategoryRepository, lot_repository::LotRepository,
        operation_repository::OperationRepository, product_repository::ProductRepository,
        providers_repository::ProviderRepository,
    },
};

pub struct ProductService;

impl ProductService {
    pub async fn find_all(
        pool: &SqlitePool,
        params: ProductQueryParams,
    ) -> Result<PaginatedProductsFull, String> {
        let limit = params.limit.unwrap_or(10).clamp(1, 100);
        let current_page = params.current_page.unwrap_or(1).max(1);
        let q = params.q.unwrap_or_default().trim().to_string();

        ProductRepository::find_all(pool, &q, limit, current_page)
            .await
            .map_err(|error| error.to_string())
    }

    pub async fn find_one(pool: &SqlitePool, id: i64) -> Result<ProductFull, sqlx::Error> {
        ProductRepository::find_one(pool, id).await
    }

    pub async fn find_by_category(
        pool: &SqlitePool,
        category_id: i64,
        params: ProductQueryParams,
    ) -> Result<PaginatedProducts, String> {
        let limit = params.limit.unwrap_or(10).clamp(1, 100);
        let current_page = params.current_page.unwrap_or(1).max(1);
        let q = params.q.unwrap_or_default().trim().to_string();

        // 1. Validar que la categoría exista
        CategoryRepository::find_one(pool, category_id)
            .await
            .map_err(|error| match error {
                sqlx::Error::RowNotFound => {
                    format!("La categoría con ID {} no existe", category_id)
                }
                _ => format!("Error al verificar la categoría: {}", error),
            })?;

        ProductRepository::find_by_category(pool, category_id, &q, limit, current_page)
            .await
            .map_err(|error| error.to_string())
    }

    pub async fn find_by_provider(
        pool: &SqlitePool,
        provider_id: i64,
        params: ProductQueryParams,
    ) -> Result<PaginatedProducts, String> {
        let limit = params.limit.unwrap_or(10).clamp(1, 100);
        let current_page = params.current_page.unwrap_or(1).max(1);
        let q = params.q.unwrap_or_default().trim().to_string();

        // 1. Validar que el proveedor exista
        ProviderRepository::find_one(pool, provider_id)
            .await
            .map_err(|error| match error {
                sqlx::Error::RowNotFound => {
                    format!("El proveedor con ID {} no existe", provider_id)
                }
                _ => format!("Error al verificar el proveedor: {}", error),
            })?;

        ProductRepository::find_by_provider(pool, provider_id, &q, limit, current_page)
            .await
            .map_err(|error| error.to_string())
    }

    pub async fn create(pool: &SqlitePool, data: CreateProduct) -> Result<Product, String> {
        // 1. Validar que la categoría exista
        CategoryRepository::find_one(pool, data.category_id)
            .await
            .map_err(|error| match error {
                sqlx::Error::RowNotFound => {
                    format!("La categoría con ID {} no existe", data.category_id)
                }
                _ => format!("Error al verificar la categoría: {}", error),
            })?;

        // 2. Validar que el proveedor exista
        ProviderRepository::find_one(pool, data.provider_id)
            .await
            .map_err(|error| match error {
                sqlx::Error::RowNotFound => {
                    format!("El proveedor con ID {} no existe", data.provider_id)
                }
                _ => format!("Error al verificar el proveedor: {}", error),
            })?;

        // 3. Verificar que no exista otro producto activo con el mismo código de barras
        match ProductRepository::find_by_barcode(pool, data.barcode.clone()).await {
            Ok(_) => {
                return Err(
                    "Ya existe un producto con el mismo codigo de barras".to_string(),
                );
            }
            Err(sqlx::Error::RowNotFound) => {}
            Err(error) => {
                return Err(format!("Error al verificar existencias: {}", error));
            }
        }

        // 4. Crear el producto
        ProductRepository::create(pool, data)
            .await
            .map_err(|error| error.to_string())
    }

    pub async fn update(
        pool: &SqlitePool,
        id: i64,
        data: UpdateProduct,
    ) -> Result<Product, String> {
        // 1. Validar que la categoría exista
        CategoryRepository::find_one(pool, data.category_id)
            .await
            .map_err(|error| match error {
                sqlx::Error::RowNotFound => {
                    format!("La categoría con ID {} no existe", data.category_id)
                }
                _ => format!("Error al verificar la categoría: {}", error),
            })?;

        // 2. Validar que el proveedor exista
        ProviderRepository::find_one(pool, data.provider_id)
            .await
            .map_err(|error| match error {
                sqlx::Error::RowNotFound => {
                    format!("El proveedor con ID {} no existe", data.provider_id)
                }
                _ => format!("Error al verificar el proveedor: {}", error),
            })?;

        // 3. Validar que el código de barras no pertenezca a otro producto distinto
        match ProductRepository::find_by_barcode(pool, data.barcode.clone()).await {
            Ok(existing) if existing.id != id => {
                return Err(
                    "Ya existe otro producto con el mismo codigo de barras".to_string(),
                );
            }
            Ok(_) | Err(sqlx::Error::RowNotFound) => {}
            Err(error) => {
                return Err(format!("Error al verificar código de barras: {}", error));
            }
        }

        ProductRepository::update(pool, id, data)
            .await
            .map_err(|error| error.to_string())
    }

    pub async fn delete(pool: &SqlitePool, id: i64) -> Result<(), String> {
        if id <= 0 {
            return Err("El ID del producto no es válido".to_string());
        }

        let deleted = ProductRepository::delete(pool, id)
            .await
            .map_err(|error| error.to_string())?;

        if !deleted {
            return Err("Producto no encontrado".to_string());
        }

        Ok(())
    }

    /// Realiza una salida de stock aplicando criterio FEFO dentro de una transacción atómica.
    pub async fn out_stock_by_product(
        pool: &SqlitePool,
        product_id: i64,
        quantity: i64,
    ) -> Result<ReturnResOperation, String> {
        if product_id <= 0 {
            return Err("El ID del producto no es válido".to_string());
        }

        if quantity <= 0 {
            return Err("La cantidad solicitada debe ser mayor a cero".to_string());
        }

        // 1. Validar que el producto exista y obtener sus datos (precio de venta)
        let product = ProductRepository::find_one(pool, product_id)
            .await
            .map_err(|error| match error {
                sqlx::Error::RowNotFound => format!("El producto con ID {} no existe", product_id),
                _ => format!("Error al verificar el producto: {}", error),
            })?;

        if product.is_active == 0 {
            return Err(
                "El producto está inactivo, no se puede realizar ninguna operación".to_string(),
            );
        }

        // 2. Consultar el total de stock disponible en bodega entre todos los lotes
        let total_stock = LotRepository::count_stock_by_product(pool, product_id)
            .await
            .map_err(|error| format!("Error al consultar el stock del producto: {}", error))?;

        // 3. Si no hay stock disponible en absoluto
        if total_stock == 0 {
            return Ok(ReturnResOperation {
                success: false,
                status: "NO_STOCK".to_string(),
                stock: 0,
                message: "No hay stock disponible para este producto".to_string(),
            });
        }

        // 4. Si el stock en bodega es insuficiente para cubrir la cantidad solicitada
        if total_stock < quantity {
            return Ok(ReturnResOperation {
                success: false,
                status: "INSUFFICIENT_STOCK".to_string(),
                stock: total_stock,
                message: format!(
                    "Stock insuficiente. Hay {} unidades disponibles en bodega",
                    total_stock
                ),
            });
        }

        // 5. Hay stock suficiente: obtener los lotes ordenados por próximo a caducar (FEFO)
        let lots = LotRepository::find_lots_by_product(pool, product_id)
            .await
            .map_err(|error| format!("Error al obtener los lotes del producto: {}", error))?;

        // Iniciar transacción para garantizar atomicidad entre descuento de lotes y registro de operación
        let mut tx = pool
            .begin()
            .await
            .map_err(|error| format!("Error al iniciar transacción: {}", error))?;

        let mut remaining = quantity;
        let mut lots_details = Vec::new();

        for lot in lots {
            if remaining <= 0 {
                break;
            }

            if lot.stock <= remaining {
                // Se agota el stock de este lote
                let deducted = lot.stock;
                lots_details.push(format!(
                    "Lote '{}' (ID: {}, -{} uds)",
                    lot.lot_num, lot.id, deducted
                ));
                remaining -= lot.stock;
                LotRepository::update_lot_stock(&mut *tx, lot.id, 0).await?;
            } else {
                // Este lote cubre el resto de la cantidad solicitada
                let deducted = remaining;
                let new_stock = lot.stock - remaining;
                lots_details.push(format!(
                    "Lote '{}' (ID: {}, -{} uds)",
                    lot.lot_num, lot.id, deducted
                ));
                remaining = 0;
                LotRepository::update_lot_stock(&mut *tx, lot.id, new_stock).await?;
            }
        }

        let description = format!(
            "Salida de stock del producto ID {}. Lotes afectados: {}",
            product_id,
            lots_details.join(", ")
        );

        // 6. Registrar la operación de salida en la base de datos (operation_type_id: 2 = 'salida')
        let operation_data = CreateOperation {
            product_id,
            q: quantity,
            price: product.price_shop,
            operation_type_id: 2, // Tipo salida
            sell_id: None,
            description: Some(description),
        };

        OperationRepository::create(&mut *tx, operation_data)
            .await
            .map_err(|error| format!("Error al registrar la operación de salida: {}", error))?;

        tx.commit()
            .await
            .map_err(|error| format!("Error al confirmar la transacción de salida: {}", error))?;

        let final_stock = total_stock - quantity;

        Ok(ReturnResOperation {
            success: true,
            status: "SUCCESS".to_string(),
            stock: final_stock,
            message: format!(
                "Salida de stock registrada correctamente ({} unidades descontadas)",
                quantity
            ),
        })
    }
}
