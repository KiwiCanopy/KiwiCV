import type { Translations } from '@/locales/en';

export const v_005_002_001: Translations['changelog']['entries']['v_005_002_001'] = {
  chore_dependency_updates:
    'Como sempre, algumas pequenas atualizações de pacotes em segundo plano mantêm a tecnologia por trás do KiwiCV o mais atualizada possível.',
  fix_backup_failure_reported:
    'Quando «Guardar cópia» falha, a janela indica agora o que correu mal e pode ser fechada, e os leitores de ecrã anunciam-no.',
  fix_dashboard_header_narrow_phones:
    'Nos telemóveis mais estreitos, o cabeçalho do painel já cabe no ecrã, por isso o botão Exportar deixa de ficar cortado.',
  fix_drive_export_no_empty_folder:
    'Exportar apenas a cópia de segurança para o Google Drive já não cria uma pasta vazia, e um ficheiro anterior com o mesmo nome mantém-se intacto.',
  fix_drive_export_retry_same_folder:
    'Tentar novamente uma exportação para o Google Drive escreve agora na mesma pasta, em vez de deixar uma segunda.',
  fix_export_drive_renamed_folder:
    'Se o Google Drive já tiver uma pasta com o nome da tua exportação, o aviso depois da exportação e a linha do Google Drive na janela de exportação indicam agora a pasta onde estão os teus ficheiros, por exemplo MyCV_2.',
  fix_export_retry_keeps_finished:
    'Quando tentas novamente na janela de exportação, os destinos já concluídos continuam marcados como concluídos, e a mensagem conta-os.',
  ui_dark_mode_black:
    'O modo escuro é agora preto puro, com cartões contornados por uma linha verde fina e o verde kiwi como único destaque forte.',
};
