import type { Translations } from '@/locales/en';

export const v_001_001_000: Translations['changelog']['entries']['v_001_001_000'] = {
  feat_ats_friendly: 'Formato compatible con ATS asegurado para los archivos PDF generados',
  feat_github_backup:
    'Al subir a GitHub (desde la pestaña de vista previa), tu configuración también se actualizará de acuerdo con el estado actual',
  feat_mock_data_preview:
    'Si no se proporcionan datos, se utilizarán datos ficticios para completar las plantillas de vista previa, lo que te permitirá ver una vista previa de inmediato',
  feat_onboarding_flow:
    'Experiencia de incorporación mejorada con un flujo de bienvenida optimizado',
  fix_link_references: 'varias referencias de enlaces optimizadas en los temas PDF y HTML',
  fix_lunar_sidebar_header:
    'Se solucionó un problema por el cual los encabezados de la barra lateral no se mostraban en el tema Lunar',
  fix_netlify_routing:
    'Se solucionó un problema por el cual la actualización de las subpáginas en Netlify resultaba en un error 404',
  fix_welcome_modal_scroll:
    'Se solucionó un problema por el cual el modal de bienvenida no se podía desplazar en pantallas más pequeñas',
};
