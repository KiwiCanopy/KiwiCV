import type { Translations } from '@/locales/en';

export const v_004_004_000: Translations['changelog']['entries']['v_004_004_000'] = {
  _highlights: {
    ai_cover_letters: {
      badge: 'IA',
      content:
        'KiwiCV ahora redacta tu carta de presentación. Pega la oferta de empleo y obtén una carta basada en el CV que ya tienes: define su longitud y tono, o proporciona una muestra de tus propios textos para que se adapte a tu estilo. La recibirás como una propuesta que puedes leer junto a tu borrador y aceptar párrafo por párrafo.',
      title: 'Cartas de presentación escritas para ti',
    },
  },
  chore_dependency_updates:
    'Como siempre, algunas actualizaciones menores de paquetes en segundo plano mantienen la tecnología de KiwiCV lo más actualizada posible.',
  feat_ai_cover_letters:
    'Tu carta de presentación ahora puede redactarse para ti a partir de una oferta de empleo y del CV que ya tienes. Elige la longitud y el tono, o aporta una muestra de tu propia redacción para que KiwiCV adopte ese mismo estilo. La carta se presenta como una propuesta que puedes consultar junto a tu borrador y aceptar párrafo por párrafo, tanto si la carta está vacía como si ya la habías empezado. Además, la sección se abre directamente en el cuerpo de la carta en lugar de mostrar primero cinco campos de dirección del destinatario para un texto que aún no habías escrito.',
  fix_ai_large_cv_wait:
    'Mejorar o traducir un CV extenso ya no se detiene con un error al cabo de un minuto: la espera crece ahora con el tamaño del CV.',
  fix_dates:
    'Las fechas vuelven a comportarse como es debido. Una fecha introducida podía retrasarse un día fuera de Europa, y un año por sí solo podía perderse por completo; el selector permitía que un clic involuntario cerca del borde de la cuadrícula saltara al mes o año contiguo sin previo aviso; y «Ordenar entradas cronológicamente» no podía interpretar fechas con el día al principio como 15.03.2019, por lo que esas entradas se iban al final como si no tuvieran fecha.',
  fix_keyboard_navigation:
    'Navegar con el teclado ya no te devuelve a la parte superior de la página. Al cerrar un diálogo, el foco vuelve al botón desde el que lo abriste, al eliminar una entrada o un CV guardado te sitúas en el siguiente elemento, y al responder a una sugerencia de IA te mantienes donde estabas trabajando. Ahora también puedes acceder a tu foto de perfil con el teclado: antes el recuadro solo respondía al ratón, por lo que «Editar», «Reemplazar» y «Eliminar» quedaban fuera de tu alcance.',
  fix_main_badge_overlaps_label:
    'La etiqueta «main» junto al nombre de un campo ya no se superpone al texto de la etiqueta. Se representaba dentro de una caja pensada para un icono, por lo que una insignia más ancha se desbordaba y tapaba las palabras contiguas.',
};
