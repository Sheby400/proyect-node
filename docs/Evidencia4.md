# Evidencia 4 - Módulo de productos

## Trabajo realizado el lunes 31

Se continuó con el desarrollo del backend de la tienda. Se creó el módulo de
productos con operaciones para crear, consultar, actualizar y eliminar
productos.

## Validación de productos

Se utilizó Zod para validar los datos de los productos, como el nombre, precio,
stock, categoría y estado.

```javascript
const productBodySchema = z.object({
    name: z.string().trim().min(3).max(120),
    price: z.number().finite().nonnegative(),
    stock: z.number().int().nonnegative(),
    active: z.boolean().default(true)
})
```

## Conexión con Firebase

Se configuró Firebase Admin y Firestore para guardar los productos en la
colección `products`.

```javascript
const productsCollection = db.collection('products')
```

## Servicios y respuestas

Se agregaron servicios para consultar, crear, actualizar y eliminar productos.
También se validó que no existan productos repetidos con el mismo SKU y se
devuelve un error cuando un producto no existe.

```javascript
if (existingProduct) {
    throw new AppError({
        statusCode: 409,
        code: 'Producto_con_sku_existente',
        message: 'Producto con sku existente'
    })
}
```

## Resultado

El backend cuenta con la base del CRUD de productos, validación de datos,
conexión con Firestore y manejo de errores.
