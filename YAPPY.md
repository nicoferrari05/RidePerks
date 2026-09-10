# Membresía Yappy — $15.00 por mes

Base de trabajo: d767fc3. Conserva los códigos cortos de seis caracteres, la migración QR, las pestañas de ahorro y las mejoras visuales y de seguridad aportadas por el usuario.

## Credenciales

Esta integración usa el **Botón de Pago**, no la API de consultas del swagger.yml y manual proporcionados. Nunca usar las credenciales de Integraciones en el botón.

Variables privadas del servidor: YAPPY_MERCHANT_ID, YAPPY_SECRET_KEY, YAPPY_DOMAIN=https://www.rideperks.app, YAPPY_ENABLED=true. Valores reales únicamente en .env.local / Vercel Production; nunca NEXT_PUBLIC_ ni Git. El dominio www fue aceptado por la validación real de Yappy.

## Activación

1. Aplicar supabase/migrations/202609100001_yappy_memberships.sql después de las tres migraciones existentes.
2. Configurar las cuatro variables en el proyecto **ride-perks** de Vercel y desplegar el código.
3. Comprobar /driver/membership con una cuenta verificada y las credenciales cargadas.
4. Activar pago cambiando rp_settings.free_access a false. La migración no lo modifica.
5. Un conductor debe confirmar un pago real desde Yappy para validar todo el circuito bancario. No se han ejecutado cargos automáticos.

La ruta de aviso a configurar en la creación de cada orden es https://www.rideperks.app/api/payments/yappy/ipn. La aplicación la envía automáticamente.

## Reglas

- Registro gratuito. Pago permitido únicamente a conductores verificados.
- Total final de la orden: USD 15.00, fijado en servidor y base de datos.
- El conductor acepta y confirma cada renovación; no existe débito recurrente automático.
- Un mes calendario desde confirmación; renovaciones suman un mes desde el vencimiento si sigue vigente. Solo se permite renovar en los últimos siete días.
- El evento visual de éxito NO acredita acceso. Solo un IPN firmado válido actualiza la orden y la membresía en una transacción.
- Los avisos repetidos son idempotentes; estados fallidos no anulan un pago confirmado.
- Órdenes pendientes bloquean nuevas solicitudes diez minutos para evitar duplicados ante errores de conexión. Un aviso exitoso tardío sigue siendo registrado.
- Pago no cambia la verificación ni reactiva cuentas suspendidas. Vigencia se valida al emitir y canjear QR.
- Los pagos se ven en /admin/payments. No se implementaron devoluciones ni suplantación de confirmaciones.
- Desactivar YAPPY_ENABLED detiene nuevas órdenes, pero conserva la recepción de avisos de órdenes existentes. Mantener la clave para procesar esas notificaciones.
- Volver free_access a true permite acceso gratuito sin borrar pagos o vigencias.

## Validación

npm test incluye firmas manipuladas, dominio incorrecto, permisos, duplicados, estados fallidos, vigencia y renovación. Las pruebas no ejecutan pagos reales. La prueba bancaria final necesita un pago aprobado por el titular en su aplicación Yappy.

Fuente oficial consultada:
https://www.yappy.com.pa/comercial/desarrolladores/boton-de-pago-yappy-nueva-integracion/

## Prueba de interfaz sin cobros

`node scripts/check-yappy-ui.mjs` usa por defecto el dominio de producción, crea una cuenta QA temporal y sustituye las solicitudes de pago por respuestas simuladas en el navegador. Comprueba el tema naranja oficial, aceptación de condiciones, recuperación tras error, estado pendiente y rechazo de notificaciones falsas. No llama al servicio bancario para generar pagos y elimina la cuenta QA al terminar. Requiere membresías activadas. Para local usar TEST_BASE_URL=http://localhost:3100.
