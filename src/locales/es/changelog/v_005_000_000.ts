import type { Translations } from '@/locales/en';

export const v_005_000_000: Translations['changelog']['entries']['v_005_000_000'] = {
  _highlights: {
    one_day_pass: {
      badge: 'Pass de 1 día',
      content:
        '¿No estás seguro de que KiwiCV sea para ti? El nuevo Pass de 1 día desbloquea todas las funciones de IA para tu próxima candidatura, así lo descubres antes de comprometerte con un Pass más largo. Las tarjetas de precios ahora ofrecen 1, 7 y 30 días.',
      title: 'Pruébalo por un día',
    },
    open_source: {
      badge: 'Código abierto',
      content:
        'Cada línea de KiwiCV es ahora pública en GitHub bajo la AGPL. Mira exactamente cómo se trata tu CV, informa de un error o sugiere una función: el código que respalda las promesas de privacidad está ahí para que cualquiera lo compruebe.',
      title: 'KiwiCV es de código abierto',
    },
  },
  feat_ai_review_calmer:
    'Revisar las propuestas de la IA es más tranquilo. Habilidades e Idiomas ahora tienen el panel de revisión en cada entrada, los campos que una propuesta reescribió siguen en solo lectura hasta que elijas «Mantener el mío» o «Usar la propuesta», y Mejorar espera a que decidas, así que una segunda pasada no puede reemplazar una propuesta que aún no has visto. Los lectores de pantalla anuncian cada decisión.',
  feat_ai_tailoring_keeps_facts:
    'Adaptar tu CV a una oferta de empleo ahora respeta tus cargos, empresas, fechas y habilidades listadas. Una habilidad que tu CV nunca menciona se marca como «No está en tu CV — acepta solo si es cierto», para que decidas antes de que se añada.',
  feat_raw_data_extra_blocks:
    'La página JSON sin formato ahora lista los datos adicionales que trajo un archivo importado, como el bloque de ajustes de otra herramienta. Abre un bloque para leer su JSON o elimina los que ya no quieras en tus exportaciones.',
  fix_dates:
    'Las fechas con el día primero, como 05.06.19, ahora se leen como 5 de junio, no 6 de mayo. Una fecha que no existe, como 31.02.2019, se queda como la escribiste y recibe la marca roja de error.',
  fix_drive_reconnect:
    'Volver a conectar Google Drive ahora siempre termina, activa las copias de seguridad y empieza con una subida real.',
  fix_photos:
    'Las fotos de un CV importado pierden los metadatos de la cámara, incluida la ubicación GPS, y las fotos GIF, HEIC y AVIF pasan a JPEG. Las fotos con fondo transparente se quedan blancas tras recortarlas en lugar de volverse negras.',
  fix_preview_pdf_match:
    'Tu vista previa en directo y tu PDF ahora coinciden mejor en Soft, Misty, Skyline, Swiss Grid, Lunar y Elegant: mismas mayúsculas, cronologías, fuentes y enlaces. La vista previa ya no carga fuentes de un servidor de terceros, y el título y el autor de un PDF llevan solo tu nombre.',
  fix_privacy_controls:
    'Tú decides qué se queda en este dispositivo. Iniciar sesión con Google solo pide acceso duradero cuando conectas Google Drive. Las tarjetas de Google Drive y GitHub en Ajustes siempre ofrecen Desconectar, al cerrar sesión o eliminar tu cuenta se te ofrece quitar también la conexión con GitHub, y tu muestra de redacción se queda con la cuenta que la guardó.',
  fix_privacy_policy:
    'La política de privacidad está reescrita. Enumera qué conserva KiwiCV de tus solicitudes de IA (nunca tu texto), indica tu derecho de oposición y cómo retirar el consentimiento, y nombra cada servicio implicado y dónde funciona.',
  fix_small_things:
    'Girar una tableta con el menú lateral abierto ya no bloquea los toques, el botón flotante de Vista previa ya no tapa el menú del móvil, una pestaña que se quedó abierta durante una actualización se recarga con la nueva versión, y un CV demasiado largo para traducir se rechaza de entrada en lugar de fallar tras una larga espera.',
  ui_editor_polish:
    '¿Vuelves? La página de inicio ahora dice Continuar editando, y Crear tu CV se abre directamente en tus datos personales. En la carta de presentación, Asunto y Fecha están encima del texto de la carta y Destinatario se abre en cuanto introduces un nombre. Mejorar sigue visible en una sección vacía con un consejo sobre qué añadir primero, y los contadores de caracteres de la IA se ponen ámbar antes del límite.',
  ui_informal_address_more_languages:
    'El español, el neerlandés, el ruso, el ucraniano y el búlgaro ahora te tratan de tú en toda la app, como los demás idiomas.',
  ui_install_app:
    'Usa KiwiCV como una app: Ajustes → Interfaz ahora tiene un botón Instalar KiwiCV, y en iPhone y iPad KiwiCV recibe un icono propio cuando lo añades a tu pantalla de inicio.',
};
