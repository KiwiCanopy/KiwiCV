import type { Translations } from '@/locales/en';

export const legal: Translations['legal'] = {
  contact: {
    button: 'Envíenos un correo',
    message:
      'El feedback es el motor de KiwiCV. Ya sea que haya encontrado un error, tenga una idea brillante para una función o simplemente quiera saludar, KiwiCV está a su disposición.',
    prompt: 'Las respuestas suelen llegar en un plazo de 24 horas.',
    support_label: 'Dirección de contacto oficial',
    title: '¡Construyamos juntos el futuro de los currículums!',
  },
  licenses: {
    description:
      'El siguiente software de código abierto se utiliza en KiwiCV. Agradecemos a los desarrolladores y a la comunidad por sus valiosas contribuciones.',
    tabLabel: 'Licencias',
    title: 'Licencias de Código Abierto',
  },
  nav_label: 'Privacidad y términos',
  notice: {
    sections: {
      details: {
        content:
          '**{{name}}**\n**{{title}}**\n{{address}}\n\n**Contacto:**\nE-Mail: {{email}}\n\n*Como pequeño empresario en el sentido del § 19 ap. 1 de la UStG, no se cobra el IVA.*',
        title: 'Información según el § 5 DDG:',
      },
      dispute: {
        content:
          '**Resolución de litigios en materia de consumo:**\nKiwiCV no está dispuesto ni obligado a participar en procedimientos de resolución de litigios ante una junta arbitral de consumo.',
        title: 'Resolución de litigios:',
      },
    },
    title: 'Aviso Legal',
  },
  privacy: {
    sections: {
      '1': {
        general: {
          content:
            'La siguiente información ofrece un resumen sencillo de lo que ocurre con sus datos personales cuando visita este sitio web. Los datos personales son cualquier dato que pueda utilizarse para identificarle personalmente. KiwiCV no vende ni comparte su información personal.',
          title: 'Información general',
        },
        how: {
          content:
            'Sus datos se recopilan, por un lado, al proporcionárnoslos (por ejemplo, introduciendo los datos del currículum en la aplicación). Sin embargo, estas entradas se procesan principalmente de forma local en su navegador. Otros datos se recopilan automáticamente por nuestros sistemas informáticos al visitar el sitio web. Se trata principalmente de datos técnicos (por ejemplo, navegador de Internet, sistema operativo o hora de visualización de la página).',
          title: '¿Cómo recopila KiwiCV sus datos?',
        },
        responsible: {
          content:
            'El procesamiento de datos en este sitio web es realizado por el operador del sitio web. Puede encontrar sus datos de contacto en la sección "Información sobre el responsable" de esta política de privacidad.',
          title: '¿Quién es responsable de la recopilación de datos en este sitio web?',
        },
        title: '1. Protección de datos de un vistazo',
      },
      '2': {
        responsible: {
          content:
            'El organismo responsable del tratamiento de datos en este sitio web es:\n\n{{name}}\n{{title}}\n{{address}}\nE-Mail: {{email}}',
          title: 'Información sobre el responsable',
        },
        rights: {
          content:
            'En el marco de las disposiciones legales aplicables, tiene derecho en todo momento a recibir información gratuita sobre sus datos personales almacenados, su origen y destinatarios, y la finalidad del tratamiento de datos (art. 15 RGPD) y, si procede, el derecho a la rectificación (art. 16 RGPD) o supresión (art. 17 RGPD) de estos datos, a la limitación de su tratamiento (art. 18 RGPD) y a recibir los datos que haya facilitado en un formato estructurado, de uso común y lectura mecánica, o a que se transmitan a otro responsable del tratamiento (derecho a la portabilidad de los datos, art. 20 RGPD). Para ello, así como para otras preguntas sobre el tema de los datos personales, se puede poner en contacto conmigo en cualquier momento.\n\n**Derecho de oposición (art. 21 RGPD):** Cuando trato sus datos personales sobre la base de intereses legítimos (art. 6, apdo. 1, letra f del RGPD), tiene derecho a oponerse en cualquier momento a este tratamiento por motivos relacionados con su situación particular. Esto se aplica a todo tratamiento para el que esta política de privacidad indica como base jurídica el art. 6, apdo. 1, letra f del RGPD. En ese caso dejaré de tratar los datos afectados, salvo que acredite motivos legítimos imperiosos para el tratamiento que prevalezcan sobre sus intereses, derechos y libertades, o que el tratamiento sirva para la formulación, el ejercicio o la defensa de reclamaciones.\n\nCuando un tratamiento se base en su consentimiento (art. 6, apdo. 1, letra a del RGPD), puede retirarlo en cualquier momento con efectos para el futuro (art. 7, apdo. 3 del RGPD); la retirada no afecta a la licitud del tratamiento basado en el consentimiento previo a su retirada.\n\nAdemás, tiene derecho a presentar una reclamación ante la autoridad de control competente.',
          title: 'Sus derechos',
        },
        title: '2. Información general e información obligatoria',
      },
      '3': {
        netlify: {
          content:
            'Este sitio web es alojado por un proveedor de servicios externo (hoster). KiwiCV utiliza al proveedor **Netlify, Inc., 512 2nd Street, Suite 200, San Francisco, CA 94107** para el alojamiento.\n\nEl uso de Netlify tiene como finalidad ofrecer el servicio en línea de forma segura, rápida y eficiente por parte de un proveedor profesional (Art. 6 apdo. 1 letra f del RGPD). Netlify utiliza una red de entrega de contenido (CDN) mundial, mediante la cual los datos (como su dirección IP) se pueden enrutar a través de servidores en todo el mundo para minimizar los tiempos de carga del sitio web. Los archivos de registro del servidor (datos de acceso) resultantes suelen ser almacenados por Netlify durante 90 días (y hasta 1 año sin conexión) por razones de seguridad y luego se eliminan.\n\nNetlify también ejecuta las funciones del servidor de KiwiCV, que se encuentran en los EE. UU. Cada solicitud a las funciones de IA de la sección 8 pasa por ellas en su camino hacia Google, junto con su contenido (por ejemplo, el texto de su currículum, una oferta de empleo o un archivo de currículum subido). Lo mismo se aplica a la sincronización con Google Drive (sección 4), los pagos (sección 6) y la eliminación de su cuenta (sección 7). Para las funciones de IA y la sincronización con Google Drive, la base jurídica es la indicada en su sección; los pagos se tramitan para ejecutar el contrato celebrado con usted (art. 6, apdo. 1, letra b del RGPD), y su cuenta se elimina para cumplir la obligación legal de suprimir sus datos (art. 6, apdo. 1, letra c del RGPD en relación con el art. 17 del RGPD).\n\nLa transferencia de datos a los EE. UU. se basa en las cláusulas contractuales estándar de la Comisión de la UE, así como en el Marco de Privacidad de Datos UE-EE. UU. (DPF), bajo el cual Netlify está certificado.\n\n**Encargo de tratamiento:** He suscrito un contrato de encargo de tratamiento (AVV) para el uso del servicio mencionado anteriormente, que garantiza que Netlify procese los datos personales de los visitantes de nuestro sitio web solo de acuerdo con mis instrucciones y cumpliendo con el RGPD.',
          title: 'Hosting externo (Netlify)',
        },
        sanity: {
          content:
            'Los artículos del blog de KiwiCV y sus imágenes, así como los testimonios de la página de inicio y sus fotos, se gestionan con la plataforma de contenidos Sanity (Sanity AS, Trondheimsveien 2K, 0560 Oslo, Noruega, y Sanity US Inc., 351 California Street, Suite 650, San Francisco, CA 94104, EE. UU.). Cuando abre el blog o un artículo, o se desplaza hacia un testimonio en la página de inicio, su navegador carga este contenido directamente desde los servidores de Sanity (sanity.io). En ese proceso, Sanity recibe su dirección IP y los datos técnicos que acompañan a toda solicitud (por ejemplo, el tipo de navegador y la hora de la solicitud).\n\nEl uso de Sanity se basa en nuestro interés legítimo en ofrecer el blog y el contenido del sitio web de forma eficiente (art. 6, apdo. 1, letra f del RGPD). En ese proceso pueden transferirse datos a los EE. UU.; el acuerdo de tratamiento de datos de Sanity basa estas transferencias en las cláusulas contractuales estándar de la Comisión de la UE.',
          title: 'Contenido del blog y del sitio web (Sanity)',
        },
        title: '3. Hosting y Redes de Entrega de Contenido (CDN)',
      },
      '4': {
        drive: {
          content:
            'KiwiCV ofrece una sincronización opcional de los datos de su CV con su Google Drive personal. Si activa esta función, los archivos de su CV se transfieren a su cuenta de Google Drive (Google LLC, 1600 Amphitheatre Parkway, Mountain View, CA 94043, EE. UU.) y se almacenan allí en una carpeta creada por KiwiCV.\n\nTécnicamente, esta sincronización se enruta a través de las funciones de nuestro servidor: el contenido de su CV y las credenciales de acceso necesarias para la transferencia (refresh token) se procesan allí de forma transitoria durante la solicitud y no se almacenan de forma permanente en nuestros servidores. El refresh token se almacena, por lo demás, exclusivamente de forma local en su navegador. KiwiCV solo recibe acceso a los archivos que él mismo ha creado (ámbito Google "drive.file") y en ningún momento al resto de su Drive.\n\nLa transferencia de datos se realiza exclusivamente sobre la base de su consentimiento activo (Art. 6, ap. 1, letra a del RGPD) al conectar voluntariamente su cuenta de Google. Puede revocarlo en cualquier momento con "Desconectar Google Drive" en el apartado "Sincronización y almacenamiento" de los ajustes y "Desconectar y eliminar acceso", lo que también revoca la autorización concedida a KiwiCV en Google. También puede eliminar KiwiCV en el acceso de terceros de su cuenta de Google (myaccount.google.com/connections). Tenga en cuenta que Google, como empresa estadounidense, transfiere datos a los EE. UU.; esta transferencia se basa en el Marco de Privacidad de Datos UE-EE. UU. (DPF), bajo el cual Google está certificado, así como en las cláusulas contractuales tipo de la Comisión Europea.',
          title: 'Sincronización con Google Drive (Opcional)',
        },
        github: {
          content:
            'Esta aplicación ofrece la posibilidad de interactuar directamente con su cuenta de GitHub a través de un Personal Access Token (PAT) proporcionado voluntariamente por usted (por ejemplo, para guardar o sincronizar los datos de su currículum).\n\nSi utiliza esta función, su navegador establece una conexión directa con los servidores de GitHub (GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, USA). En este proceso, su dirección IP y los datos introducidos en la aplicación se transmiten directamente a GitHub y se procesan allí.\n\nLo que llega a GitHub depende del repositorio que elija. Un repositorio privado que no esté publicado con GitHub Pages recibe los datos completos de su currículum, incluidas las entradas que haya ocultado, su carta de presentación y los datos que KiwiCV conserva de un archivo importado. Un repositorio que cualquiera puede leer (uno público o uno publicado con GitHub Pages) recibe su currículum sin las entradas y secciones que haya ocultado, sin su carta de presentación y sin los datos conservados de archivos importados. Sí incluye sus ajustes de diseño, su foto de perfil si no la oculta, los nombres y los datos de contacto de las referencias que haya indicado, y los nombres de archivo y de carpeta que elija al exportar, que también aparecen en los mensajes de commit y pueden indicar la empresa y el puesto al que opta. Si más adelante hace público un repositorio o lo publica con GitHub Pages, lo que ya contiene, incluido su historial, también puede pasar a ser público.\n\nSu GitHub PAT nunca se envía a los servidores de KiwiCV. Se almacena únicamente en su navegador, en este dispositivo, y solo se utiliza para autorizar las solicitudes que su navegador envía a GitHub en su nombre: durante la sesión actual del navegador o, si elige "Almacenar el token en este navegador", hasta que lo elimine. Dado que el token pertenece a este dispositivo y no a su cuenta de KiwiCV, cerrar sesión lo conserva, a menos que elija "Eliminar GitHub y cerrar sesión"; al eliminar su cuenta, se elimina si deja marcada la casilla "Eliminar también la conexión con GitHub de este dispositivo".\n\nLa transferencia de datos a GitHub se realiza exclusivamente sobre la base de su consentimiento activo (Art. 6 apdo. 1 letra a del RGPD), al utilizar voluntariamente la función e introducir su token. Puede retirar este consentimiento en cualquier momento con "Desconectar GitHub" en el apartado "Sincronización y almacenamiento" de los ajustes y "Desconectar y eliminar token", lo que elimina su token y los ajustes del repositorio de este dispositivo y no envía nada a GitHub. Los datos que ya estén en su repositorio permanecen allí hasta que los elimine en GitHub. Tenga en cuenta que GitHub, como empresa estadounidense, trasfiere datos a los EE. UU. Puede encontrar más información sobre la protección de datos en GitHub aquí:',
          link: {
            text: 'Declaración de privacidad de GitHub',
            url: 'https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement',
          },
          title: 'Interacción con GitHub a través de Personal Access Token (PAT)',
        },
        storage: {
          content:
            'Para proporcionar y hacer funcionar el generador de currículums, KiwiCV utiliza la técnica de almacenamiento web (almacenamiento local). En este proceso, sus datos introducidos (como los datos de texto para el currículum o las fotos de perfil procesadas localmente en formato Base64) se almacenan en caché localmente en el navegador de su dispositivo terminal. Esto evita que sus datos se pierdan en caso de una recarga accidental de la página.\n\nSi importa un archivo de currículum que contiene secciones de nivel superior que KiwiCV no utiliza (por ejemplo, las escritas por otra aplicación), KiwiCV las conserva junto con su currículum, hasta un límite de tamaño, para que se mantengan sin cambios al exportar el archivo. Se almacenan, se exportan y se incluyen en las copias de seguridad junto con su currículum (en Google Drive o en un repositorio privado de GitHub que no esté publicado con GitHub Pages) y aparecen en la vista JSON sin formato, pero nunca se muestran en su currículum ni en el editor ni se envían a las funciones de IA.\n\nSi utiliza «Adaptar a mi estilo de redacción» para una carta de presentación, la muestra de redacción que introduzca (hasta 5000 caracteres) también se guarda en el almacenamiento local, separada de su currículum, para que esté lista para su próxima carta. Se transmite a las funciones de IA de la sección 8 cada vez que se redacta una carta de presentación con su estilo; no forma parte de sus copias de seguridad en Google Drive o GitHub. Permanece en su dispositivo terminal hasta que la borre en la ventana de la carta de presentación, cierre la sesión, inicie sesión con otra cuenta o borre el almacenamiento de su navegador; la eliminación de su cuenta también la elimina del dispositivo en el que elimina la cuenta, ya que con ello se cierra la sesión.\n\nEstos datos se procesan localmente en su dispositivo terminal y no se transmiten a ningún servidor a menos que utilice activamente una de las funciones opcionales descritas en esta política (por ejemplo, la copia de seguridad en Google Drive de esta sección o las funciones de IA de la sección 8). No tengo acceso a estos datos almacenados localmente en ningún momento.\n\nSi inicia sesión, su navegador almacena además su sesión, que acompaña a sus solicitudes a nuestros servidores (véase la sección 5), una copia de su perfil y el identificador de su cuenta, que indica a qué cuenta pertenecen las credenciales de acceso almacenadas localmente y la muestra de redacción. Su almacenamiento es estrictamente necesario para el inicio de sesión que ha solicitado (§ 25 apdo. 2 n.º 2 de la TDDDG); los tres se eliminan cuando cierra la sesión.\n\nEl almacenamiento de estos datos es técnicamente estrictamente necesario para la función principal de la aplicación. La base jurídica para almacenar y leer los datos en su dispositivo terminal es el § 25 apdo. 2 n.º 2 de la TDDDG. El tratamiento posterior se basa en mi interés legítimo en ofrecer una prestación del servicio fácil de usar de conformidad con el Art. 6, apdo. 1, letra f del RGPD. Salvo que se indique otra cosa más arriba, los datos permanecen en su dispositivo terminal hasta que limpie manualmente el almacenamiento (caché/almacenamiento local) de su navegador.',
          title: 'Uso de Web Storage (Local Storage)',
        },
        title: '4. Recopilación de datos en nuestra aplicación',
      },
      '5': {
        account: {
          content:
            'Cuando crea una cuenta de usuario (a través de Google OAuth), almacenamos su dirección de correo electrónico, su nombre y su foto de perfil de Google para administrar su acceso y datos personalizados. Tenga en cuenta que las funciones premium solo están disponibles para usuarios registrados. También almacenamos información sobre su Pro Pass activo y metadatos sobre sus solicitudes de IA, que la sección 8 describe. No almacenamos de forma permanente ninguna entrada (instrucciones) o salida (resultados) de la optimización de IA en nuestros servidores; el almacenamiento temporal en caché durante el procesamiento se describe en la sección 8.\n\n**Proveedor de base de datos:** Estos datos de cuenta se almacenan con nuestro encargado del tratamiento **Supabase, Inc.** en un proyecto alojado en la Unión Europea. Existe un acuerdo de procesamiento de datos de conformidad con el art. 28 del RGPD con Supabase.',
          title: 'Información de la cuenta y del perfil',
        },
        title: '5. Datos de la cuenta y del usuario',
      },
      '6': {
        stripe: {
          content:
            'Utilizamos Stripe Payments Europe, Limited (Irlanda) para el procesamiento de pagos. Durante el proceso de pago, Stripe recopila directamente su información de pago. No almacenamos datos de pago sensibles (como números de tarjetas de crédito) en nuestros propios servidores; solo recibimos información de estado sobre la transacción de Stripe. La base jurídica es la ejecución de su compra (Art. 6, ap. 1, letra b del RGPD) y, para los justificantes de facturación que deben conservarse, una obligación legal (Art. 6, ap. 1, letra c del RGPD, véase la sección 7). Stripe también trata datos en los EE. UU. (Stripe, LLC); esta transferencia se basa en el Marco de Privacidad de Datos UE-EE. UU. (DPF), bajo el cual Stripe está certificado, así como en las cláusulas contractuales tipo de la Comisión Europea.',
          title: 'Gestión de transacciones a través de Stripe',
        },
        title: '6. Procesamiento de pagos',
      },
      '7': {
        deletion_scope: {
          content:
            'Al eliminar su cuenta de usuario, su perfil y todos los metadatos vinculados (por ejemplo, el estado de su Pro Pass, los registros de pagos y los registros de uso) se eliminarán de forma inmediata y permanente de nuestra base de datos operada por Supabase (consulte la sección 5). Tenga en cuenta que los datos del currículum se almacenan en el almacenamiento local de su navegador y, si utiliza la copia de seguridad de Google Drive o la sincronización con GitHub, en su Google Drive personal o en su repositorio de GitHub; ninguno de ellos se ve afectado por la eliminación de la cuenta en el servidor. Un token de GitHub almacenado en este dispositivo también se elimina si deja marcada la casilla "Eliminar también la conexión con GitHub de este dispositivo" (véase la sección 4).',
          title: 'Alcance de la eliminación',
        },
        retention_legal: {
          content:
            'Tenga en cuenta que estamos legalmente obligados a conservar los datos de facturación relacionados con las transacciones (específicamente registros de compras realizadas a través de Stripe) durante un período de 10 años. Esto se hace en base a los requisitos de la ley fiscal y comercial (por ejemplo, según la AO y el HGB alemanes). La base legal para esto es el Art. 6 apdo. 1 letra c del RGPD.',
          title: 'Obligaciones legales de retención',
        },
        stripe_retention: {
          content:
            'Estos datos específicos permanecen almacenados con nuestro proveedor de servicios de pago, Stripe, durante la duración de los períodos legales para garantizar la documentación adecuada para las autoridades fiscales.',
          title: 'Almacenamiento a través de Stripe',
        },
        title: '7. Eliminación y retención de datos',
      },
      '8': {
        logging_metrics: {
          content:
            'Por cada solicitud de IA completada, KiwiCV registra metadatos vinculados a su cuenta en nuestra base de datos operada por Supabase (consulte la sección 5). Este registro nunca contiene el contenido de sus prompts ni de los resultados; cómo se conservan estos brevemente mientras se ejecuta una solicitud se describe más abajo en "Almacenamiento Temporal". Se almacena lo siguiente:\n\n**Tipo de solicitud:** de qué tipo fue la solicitud (por ejemplo, "Optimización de currículum", "Carta de presentación", "Análisis de currículum por IA"), el modo de IA que eligió y a qué se refería (el currículum completo o un tipo de sección como "Experiencia Laboral"), nunca el texto en sí.\n\n**Datos de uso:** la hora de la solicitud, la cantidad de tokens utilizados y si la cubrió un Pro Pass; en las solicitudes realizadas mientras KiwiCV aún ofrecía un período de prueba gratuito, si la cubrió ese período de prueba.\n\n**Datos técnicos:** cuánto tardó la solicitud, el modelo de IA, la región del servidor, la versión de nuestras instrucciones a la IA, cómo terminó la solicitud, si el resultado cambió algo y si fue una ejecución de prueba.\n\n**Clasificación de seguridad:** para las optimizaciones de currículum y las cartas de presentación, las puntuaciones que los sistemas de seguridad automatizados de Google asignan a la respuesta de la IA cuando Google las proporciona, por ejemplo, qué probabilidad tiene de contener acoso o contenido peligroso. Se derivan del texto, pero no contienen nada de él.\n\nUtilizamos estos datos para contabilizar sus solicitudes frente a su cuota diaria, para hacer cumplir nuestra Política de Uso Justo (evitar el uso abusivo y automatizado) y para el diagnóstico de errores. Para mejorar las funciones de IA, los evaluamos únicamente de forma agregada y nunca los usamos para elaborar un perfil suyo. Contabilizar sus solicitudes es necesario para prestar el servicio (Art. 6 apdo. 1 letra b del RGPD); los demás fines se basan en nuestro interés legítimo en evitar abusos, corregir errores y mejorar las funciones de IA (Art. 6 apdo. 1 letra f del RGPD). Los datos se conservan mientras exista su cuenta y se eliminan junto con ella (consulte la sección 7).',
          title: 'Registro y métricas de uso',
        },
        privacy_training: {
          content:
            'La protección de sus datos es nuestra máxima prioridad. Al utilizar la API de Google Cloud (Vertex AI), se aplican las siguientes garantías de seguridad:\n\n**Sin entrenamiento de modelos:** Google excluye explícitamente el uso de sus datos introducidos (prompts) para entrenar sus modelos de IA globales. Sus datos permanecen en nuestro entorno aislado de Google Cloud.\n\n**Ubicación de los datos:** Google trata sus solicitudes en servidores dentro de la Unión Europea (multirregión UE de Google Cloud "eu", restringida a los estados miembros de la UE) para garantizar un nivel adecuado de protección de datos de acuerdo con el RGPD. Antes de llegar a Google, pasan por las funciones de nuestro servidor en los EE. UU. (véase la sección 3).\n\n**Sin almacenamiento permanente con el proveedor:** Google procesa los datos para atender la solicitud y no los almacena de forma permanente. Google puede almacenar en caché las entradas y los resultados durante un máximo de 24 horas. Si los sistemas de seguridad automatizados de Google marcan una solicitud, Google puede conservar el prompt hasta 30 días para comprobar si hay abuso; no se utiliza para entrenar modelos.',
          title: 'Protección de datos y exclusión de entrenamiento',
        },
        processing_scope: {
          content:
            'Para ofrecerle funciones de optimización inteligente y creación de currículums y cartas de presentación, utilizamos la plataforma Vertex AI de Google Cloud. En este proceso, los textos que introduce se transmiten a los servidores de Google y se procesan en ellos; en el camino, pasan por las funciones de nuestro servidor en Netlify, en los EE. UU. (véase la sección 3). Las funciones de IA solo se ejecutan cuando las activa activamente; la base jurídica de este tratamiento es el Art. 6, ap. 1, letra b del RGPD (prestación del servicio solicitado).',
          title: 'Tipo y alcance del tratamiento',
        },
        temporary_storage: {
          content:
            'Para garantizar un procesamiento estable de las solicitudes de IA, KiwiCV utiliza procesos asíncronos en segundo plano. Los documentos de entrada cargados (como los archivos de currículum), así como los resultados generados por la IA, se almacenan temporalmente en nuestra base de datos operada por Supabase (consulte la sección 5) durante un breve período (normalmente no más de unos minutos, y nunca más de 24 horas) hasta que su navegador los recupere con éxito. Transcurrido este período, o una vez recuperados, estos resultados temporales y los datos de entrada cargados se eliminan de forma automática y completa. KiwiCV utiliza estas entradas y resultados temporales únicamente para entregar el resultado que solicitó, y nunca para la elaboración de perfiles ni para entrenar modelos de IA.',
          title: 'Almacenamiento Temporal',
        },
        title: '8. Uso de servicios de IA (Google Cloud Vertex AI)',
      },
      '9': {
        posthog: {
          content:
            'Para comprender mejor cómo interactúan los usuarios con KiwiCV y mejorar nuestros servicios, utilizamos la herramienta de análisis PostHog (PostHog, Inc., 2261 Market Street #4008, San Francisco, CA 94114, EE. UU.). Para proteger su privacidad, hemos configurado PostHog de manera estrictamente anónima y sin cookies.\n\n**Seguimiento anónimo:** No utilizamos cookies de seguimiento y no almacenamos ninguna identificación personal en su navegador. PostHog está configurado para usar persistencia solo en memoria (memory-only), lo que significa que todos los datos de la sesión se pierden tan pronto como cierra o recarga la página.\n\n**Residencia de datos (UE):** Todos los datos se envían y almacenan en los servidores europeos de PostHog (Región: Frankfurt, Alemania - https://eu.i.posthog.com) para garantizar el cumplimiento de los estándares europeos de protección de datos.\n\n**Reconocimiento de sesión:** Para el reconocimiento de sesión anónimo, se genera un valor hash a corto plazo en el servidor, que se elimina automáticamente después de 24 horas. Esto nos permite ver patrones de interacción (por ejemplo, qué temas son populares o cuántos currículos se exportan) sin poder identificarlo individualmente.\n\nEl uso de PostHog se basa en nuestro interés legítimo en el diseño orientado a la demanda y la optimización continua de nuestro sitio web (Art. 6 apdo. 1 letra f RGPD).',
          title: 'Analítica Web Anónima (PostHog)',
        },
        title: '9. Analítica Web',
      },
      '10': {
        email: {
          content:
            'Si nos escribe por correo electrónico (por ejemplo a {{email}} o a otra dirección indicada en este sitio web), almacenamos sus datos, incluidos sus datos de contacto, para tramitar su consulta y posibles preguntas posteriores.\n\n**Reenvío de correo (Cloudflare):** Los correos enviados a direcciones de kiwicanopy.com los recibe **Cloudflare, Inc., 101 Townsend St, San Francisco, CA 94107, USA** mediante su servicio Email Routing y los reenvía a nuestro buzón. El contenido no se almacena; Cloudflare registra remitente, destinatario, asunto, hora y estado de entrega. Existe un contrato de encargo de tratamiento con Cloudflare (Cloudflare Customer DPA).\n\n**Buzón (Google):** El buzón está alojado en Google (Gmail); el proveedor es Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Ireland. Cualquier transferencia a EE. UU. (a Cloudflare o Google LLC) se basa en el EU-US Data Privacy Framework y, subsidiariamente, en las cláusulas contractuales tipo de la Comisión Europea.\n\nLa base jurídica es el art. 6.1.b RGPD cuando su consulta tiene por objeto un contrato y, en los demás casos, nuestro interés legítimo en responderla (art. 6.1.f RGPD). Los datos se eliminan en cuanto dejan de ser necesarios para esta finalidad y no existe ninguna obligación legal de conservación.',
          title: 'Reenvío de correo y buzón',
        },
        title: '10. Contacto por correo electrónico',
      },
    },
    tabLabel: 'Privacidad',
    title: 'Política de Privacidad',
  },
  terms: {
    sections: {
      '1': {
        async_processing: {
          content:
            'Las solicitudes de procesamiento de IA se realizan de forma asíncrona. El usuario es responsable de recuperar los resultados a tiempo. Por razones de seguridad y optimización de recursos, los resultados almacenados temporalmente en caché se eliminan de forma irrevocable a más tardar después de 24 horas. No existe derecho al almacenamiento permanente de estos datos temporales.',
          title: 'Procesamiento Asíncrono y Provisión de Datos',
        },
        daily_limit: {
          content:
            'Para evitar abusos y garantizar la disponibilidad para todos los usuarios, el número de solicitudes de IA por cuenta Pro está limitado a {{limit}} solicitudes en un plazo de 24 horas. Esta cuota se restablece diariamente a medianoche (hora alemana, CET/CEST).',
          title: 'Cuota de uso',
        },
        purpose: {
          content:
            'Las funciones de IA de KiwiCV solo pueden utilizarse para crear y mejorar documentos de solicitud dentro de la plataforma. No se permite el uso para fines ajenos al sistema.',
          title: 'Finalidad prevista',
        },
        technical_limits: {
          content:
            'Nos reservamos el derecho de limitar el número máximo de tokens por solicitud a un nivel razonable para la optimización del currículum. Se prohíbe el uso automatizado o la obtención masiva de respuestas de IA.',
          title: 'Restricciones técnicas',
        },
        title: '1. Política de uso justo',
      },
      '2': {
        ai_usage: {
          content:
            'Los titulares de un Pro Pass reciben acceso a funciones de optimización impulsadas por IA sin facturación individual por solicitud. Este acceso está destinado al uso privado en el contexto de la búsqueda de empleo.',
          title: 'Acceso AI (Titulares del Pro Pass)',
        },
        one_time_payment: {
          content:
            'La compra de un Pro Pass representa un pago único completado para un servicio específico. No es una suscripción; no hay renovación automática.',
          title: 'Pago único',
        },
        refunds: {
          content:
            'Como consumidor, tiene un derecho legal de desistimiento de 14 días a partir de la celebración del contrato. Las condiciones, el plazo y el procedimiento se detallan en nuestra Información sobre el desistimiento, que también incluye el formulario de desistimiento modelo.\n\nSi desiste dentro de ese plazo, le reembolsaremos el precio total abonado. Aparte del derecho legal de desistimiento, no ofrecemos reembolsos. Un Pro Pass no es transferible entre cuentas de usuario.',
          title: 'Derecho de desistimiento, reembolsos y transferibilidad',
        },
        stacking: {
          content:
            'Al adquirir varios Pro Pass de duración limitada, los periodos de validez se suman («stacking»). El periodo del nuevo pase comienza únicamente tras la expiración del periodo activo actual.',
          title: 'Acumulación de Pro Pass (Stacking)',
        },
        title: '2. Uso Premium (Pase)',
        validity_timezone: {
          content:
            'Los períodos de acceso y los límites de uso diario se calculan según la hora de Europa Central (CET/CEST). Los pases de duración limitada caducan a las 23:59:59 del último día del periodo de acceso total acumulado.',
          title: 'Política de zona horaria',
        },
      },
      '3': {
        termination: {
          content:
            'Puede eliminar su cuenta de usuario en cualquier momento sin dar ninguna razón. Con la eliminación de la cuenta, la relación contractual termina con efecto inmediato.',
          title: 'Eliminación de cuenta',
        },
        title: '3. Terminación y eliminación de cuenta',
      },
    },
    tabLabel: 'T&C',
    title: 'Términos y Condiciones',
  },
  translation_note:
    'Esta es una traducción automática de la versión original en alemán para su comodidad. En caso de discrepancia, prevalecerá la versión en alemán.',
  update: {
    button: 'Aceptar y Continuar',
    changes_desc:
      'La sección 2 menciona ahora también sus derechos a la limitación del tratamiento y a la portabilidad de los datos, expone por separado su derecho a oponerse a un tratamiento basado en intereses legítimos e indica que puede retirar un consentimiento en cualquier momento. La sección 3 explica ahora que las funciones del servidor de KiwiCV se ejecutan en Netlify, en los EE. UU., y que las solicitudes de IA, incluido su contenido, pasan por ellas en su camino hacia los servidores de Google en la UE; también nombra a Sanity, desde donde su navegador carga el blog y los testimonios de la página de inicio. La sección 4 explica ahora cómo retirar su consentimiento a Google Drive y a la sincronización con GitHub con los botones de desconexión, que el token de GitHub permanece en el dispositivo y cuándo se elimina, nombra los datos de inicio de sesión que almacena su navegador e indica que la muestra de redacción para cartas de presentación también se elimina cuando cierra la sesión o cuando inicia sesión otra cuenta, así como en el dispositivo en el que elimina su cuenta. La sección 5 ya no menciona el período de prueba gratuito, que ha finalizado; la sección 8 solo lo menciona para las solicitudes realizadas mientras se ofrecía. La sección 6 nombra ahora a Stripe Payments Europe como proveedor de pagos, la base jurídica de los pagos y las garantías del tratamiento de datos por parte de Stripe en los EE. UU. La sección 7 nombra ahora sus datos de pago entre los datos que se eliminan con su cuenta. La sección 8 detalla ahora todo lo que guarda el registro de uso de la IA, con qué fin, con qué base jurídica y durante cuánto tiempo, e indica que los documentos subidos y los resultados de la IA se almacenan temporalmente, por lo general, no más de unos minutos.',
    changes_title: '¿Qué ha cambiado?',
    checkbox: 'Acepto las Condiciones de servicio y la Política de privacidad actualizadas.',
    intro:
      'La política de privacidad de KiwiCV se ha actualizado: ahora también menciona su derecho de oposición y cómo retirar un consentimiento, explica que las solicitudes pasan por las funciones de nuestro servidor en los EE. UU., nombra a Sanity para el blog y los testimonios de la página de inicio y detalla todo lo que guarda el registro de uso de la IA.',
    link_privacy: 'Política de privacidad',
    link_terms: 'Condiciones de servicio',
    links_desc: 'Puede leer los documentos completos aquí:',
    success: '¡Gracias por aceptar los términos actualizados!',
    title: 'Actualización de Términos y Privacidad',
  },
  withdrawal: {
    sections: {
      '1': {
        right: {
          content:
            'Tiene usted derecho a desistir del presente contrato en un plazo de 14 días sin necesidad de justificación. El plazo de desistimiento expirará a los 14 días del día de la celebración del contrato.\n\nPara ejercer el derecho de desistimiento, deberá usted notificarnos:\n\n{{name}}\n{{address}}\n{{email}}\n\nsu decisión de desistir del contrato a través de una declaración inequívoca (por ejemplo, una carta enviada por correo postal o correo electrónico). Podrá utilizar el modelo de formulario de desistimiento que figura a continuación, aunque su uso no es obligatorio.\n\nPara cumplir el plazo de desistimiento, basta con que la comunicación relativa al ejercicio por su parte de este derecho sea enviada antes de que venza el plazo correspondiente.',
          title: 'Su derecho de desistimiento',
        },
        title: '1. Derecho de desistimiento',
      },
      '2': {
        email_note: {
          content:
            'Para ayudarnos a localizar su pedido, por favor indique también la dirección de correo electrónico que utilizó en la compra. Esto no es necesario para que su desistimiento sea efectivo.',
          title: 'Identificación de su pedido',
        },
        form: {
          content:
            '_A la atención de {{name}}, {{address}}, {{email}}:_\n\nPor la presente le comunico/comunicamos (*) que desisto de mi/desistimos de nuestro (*) contrato de prestación del siguiente servicio:\n\n— Pedido el (*) / recibido el (*):\n\n— Nombre del consumidor y usuario o de los consumidores y usuarios:\n\n— Domicilio del consumidor y usuario o de los consumidores y usuarios:\n\n— Firma del consumidor y usuario o de los consumidores y usuarios (solo si el presente formulario se presenta en papel):\n\n— Fecha:\n\n_(*) Táchese lo que no proceda._',
          title:
            'Sólo debe cumplimentar y enviar el presente formulario si desea desistir del contrato',
        },
        title: '2. Modelo de formulario de desistimiento',
      },
      '3': {
        refund: {
          content:
            'En caso de desistimiento por su parte, le devolveremos todos los pagos recibidos de usted sin ninguna demora indebida y, en todo caso, a más tardar 14 días a partir de la fecha en la que se nos informe de su decisión de desistir del presente contrato.\n\nProcederemos a efectuar dicho reembolso utilizando el mismo medio de pago empleado por usted para la transacción inicial, a no ser que haya usted dispuesto expresamente lo contrario; en todo caso, no incurrirá en ningún gasto como consecuencia del reembolso.',
          title: 'Reembolso',
        },
        title: '3. Consecuencias del desistimiento',
      },
    },
    tabLabel: 'Desistimiento',
    title: 'Derecho de desistimiento',
  },
};
