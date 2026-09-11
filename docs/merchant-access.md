# Comercios y acceso de conductores

## Operación

- Comercios: /business. El responsable actual conserva su acceso como administrador principal. Puede editar información, proponer beneficios, pausar/reactivar versiones aprobadas y crear invitaciones de personal.
- Invitaciones: enlace de un solo uso válido durante 48 horas. El empleado usa su propia cuenta de comercio. Los enlaces se almacenan como hashes; retirar un empleado desactiva su vinculación.
- Personal: solo consulta un QR y confirma su uso. Cada confirmación guarda redeemed_by. La confirmación vuelve a verificar acceso, vigencia, comercio, cuota y permiso; consultar no consume el código.
- Propuestas: /admin/reviews. Las versiones pendientes no modifican el beneficio publicado. Una aprobación de cambios conserva el estado pausado/activo actual; las nuevas ofertas aprobadas se activan según sus fechas.
- Accesos: /admin/platform → Cuentas → Administrar membresía y acceso. /admin/access permite vincular una identidad personal autenticada mientras existe la sesión administrativa compartida. Las operaciones nuevas requieren ambas y registran el actor.
- Lifetime no necesita pagos; prueba y cortesía tienen vencimiento; las extensiones añaden días/meses al vencimiento efectivo. Suspender o cancelar bloquea el acceso hasta retirarlo expresamente, sin borrar pagos ni detener fechas. Una cortesía o una confirmación tardía de Yappy no retiran ese bloqueo.
- Yappy conserva precio, renovación manual, firmas e idempotencia. La renovación extiende la vigencia efectiva, incluso cuando contiene tiempo de cortesía.
- Estadísticas: agregaciones sobre todos los canjes del comercio en el período, horario de Panamá. Ahorro registrado distingue usos con importe conocido. No se calcula facturación porque no se registra consumo.

## Despliegue

Aplicar en orden 202609110001_merchant_roles.sql y 202609110002_access_and_review.sql antes del código. El archivo artifacts/ACTUALIZAR_COMERCIOS_Y_ACCESOS.sql combina ambos. No contiene credenciales. Las migraciones conservan beneficios y pagos existentes y rellenan los propietarios en la nueva relación de miembros.

## Validación

npm test verifica SQL, permisos, invitaciones, revisión, acceso manual y Yappy. npm run test:e2e comprueba rutas públicas. npm run test:e2e:live usa registros temporales y comprueba registro, revisión de conductores y gestión de comercios. Ejecutar con TEST_BASE_URL apuntando al servidor bajo prueba; las pruebas administrativas usan ADMIN_PASSWORD de .env.local.

No están implementados Merchant Score, nuevos límites diarios/semanales, horarios, exclusividad, exportaciones ni un visor general de auditoría. Son propuestas pendientes de definición.
