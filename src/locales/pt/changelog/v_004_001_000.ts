import type { Translations } from '@/locales/en';

export const v_004_001_000: Translations['changelog']['entries']['v_004_001_000'] = {
  _highlights: {
    'matching-cover-letters': {
      badge: 'Carta de apresentação',
      content:
        'As cartas de apresentação chegam ao KiwiCV. Escreve uma carta com o design exato do teu currículo e exporta ambos juntos como um pacote de candidatura elegante — sem mais documentos desalinhados.',
      title: 'Cartas de apresentação, perfeitamente combinadas',
    },
  },
  chore_ai_model_upgrade:
    'A IA do KiwiCV funciona agora na mais recente geração Gemini da Google (Gemini 3.1) para sugestões notavelmente melhores. A privacidade mantém-se inalterada: o processamento permanece exclusivamente na UE, em conformidade com o RGPD, e os teus dados nunca são utilizados para treinar modelos de IA.',
  chore_dependency_updates:
    'Como sempre, algumas pequenas atualizações de pacotes em segundo plano mantêm a tecnologia por trás do KiwiCV o mais atualizada possível.',
  feat_matching_cover_letters:
    'Cria uma carta de apresentação que combina com o design do teu currículo e exporta ambos num único pacote de candidatura. Formata o texto com negrito, itálico e hiperligações, escolhe entre o estilo clássico DIN 5008 ou alinhado ao tema, e mostra ou oculta os blocos de remetente, destinatário e assinatura conforme cada oportunidade.',
  fix_design_settings_reset:
    'As tuas definições de Design mantêm-se agora fixas enquanto editas. A opção de cabeçalho em negrito para Experiência Laboral e Educação, a estrutura personalizada de morada e o caminho de destino do GitHub voltavam aos valores predefinidos assim que adicionavas, reordenavas ou editavas um item em qualquer secção de lista, sem aviso nem opção de desfazer. Os cabeçalhos de secção personalizados num CV importado também mantêm as tuas alterações.',
  fix_elegant_page_breaks:
    'As quebras de página manuais já funcionam no tema Elegant. Ativar uma quebra não produzia qualquer efeito no PDF exportado; agora inicia uma nova página exatamente onde pediste, tal como nos restantes temas.',
  fix_empty_custom_address_layout:
    'Uma estrutura personalizada de morada sem campos úteis já não apaga a tua morada. Remover todos os campos da estrutura personalizada em Design eliminava por completo a morada do teu CV e do teu PDF sem qualquer explicação no ecrã. O KiwiCV utiliza agora a estrutura padrão do teu país como alternativa.',
  fix_footer_date_round_trip:
    'Desativar a data no rodapé do CV é agora mantido após exportar e reimportar, e uma data introduzida manualmente é guardada exatamente como a escreveste em vez de ser apagada.',
  fix_import_list_warnings:
    'Os avisos de importação cobrem agora as listas. Quando o KiwiCV precisa de ignorar um item ilegível nos destaques de um emprego, nas disciplinas de um curso ou nas palavras-chave de uma competência, identifica o item e o campo no resumo de importação em vez de encurtar a lista silenciosamente.',
  fix_import_warning_headings:
    'Os avisos de importação identificam agora a secção do teu CV de onde provêm, incluindo os teus dados pessoais, em vez de mostrarem um código interno.',
  fix_imported_list_fields:
    'Um ficheiro de CV cujas listas de tópicos contenham erros já não bloqueia a tua pré-visualização. Se um JSON importado guardou os destaques de um emprego, as disciplinas de um curso ou as palavras-chave de uma competência numa única linha de texto em vez de uma lista, a pré-visualização e o PDF deixavam de ser gerados. O KiwiCV lê agora os dados válidos e ignora o resto.',
  fix_imported_text_fields:
    'Dados de contacto no formato incorreto já não danificam o teu CV. Se um ficheiro importado guardou o teu nome, site, telefone ou cidade noutro formato que não texto simples, a pré-visualização ou o PDF podiam deixar de funcionar. O KiwiCV lê agora o que é possível e limpa espaços desnecessários à volta do teu nome e endereço, evitando que os temas com nome em duas linhas apresentem uma primeira linha em branco.',
  fix_imported_theme_name:
    'Um CV importado com um nome de design desconhecido apresenta agora todas as suas secções em vez de surgir quase em branco.',
  fix_missing_sections_single_column:
    'As secções que preencheste após reorganizar a estrutura da tua página já não desaparecem nos temas de coluna única: cada secção com conteúdo surge na pré-visualização e no PDF exportado.',
  fix_pdf_special_characters:
    'Os carateres especiais e as hiperligações do teu currículo são agora exportados com total fiabilidade no PDF de qualquer tema.',
  fix_preview_pdf_parity:
    'O que vês agora corresponde ao que exportas. Os títulos de secção renomeados, os detalhes específicos de cada tema, os ícones ao lado deles e as secções de projeto em vários temas de duas colunas podiam diferir entre a pré-visualização no ecrã e o PDF exportado – os dois são agora renderizados de forma idêntica.',
  fix_reload_repairs_cv:
    'Recarregar o editor agora repara automaticamente ficheiros de CV corrompidos ou antigos em tempo real, evitando potenciais falhas na pré-visualização e exportação.',
  fix_signature_footer:
    'O rodapé da assinatura foi corrigido: deixa agora espaço para assinar, já não empurra uma página final vazia em CVs mais longos e aparece nos temas Elegant, Plain e Plain 2 onde faltava.',
  fix_stackoverflow_page_breaks:
    'As quebras de página manuais voltam a funcionar no tema Stack Overflow. Definir uma quebra impedia por completo a geração do PDF; a pré-visualização e a exportação mudam agora de página exatamente no local escolhido.',
  fix_theme_fonts:
    'Elegant, Timeless e JavaScript são agora apresentados na pré-visualização com as tipografias com que foram concebidos. A pré-visualização recorria anteriormente a uma fonte genérica do sistema e o PDF do Timeless era exportado com outra fonte; os três temas têm agora exatamente a mesma imagem no ecrã e no documento final.',
  fix_two_column_stray_breaks:
    'Nos temas Lunar, Misty e Swiss Grid, uma secção cujos itens tenhas ocultado na totalidade já não arrasta a sua quebra de página manual para o PDF exportado, evitando deixar uma coluna vazia onde a secção existia.',
  other_discord_community:
    'O KiwiCV tem agora uma comunidade no Discord — um espaço para partilhar feedback, pedir modelos e entreajudar-se na procura de emprego. O link está disponível no rodapé e na página inicial.',
  other_export_no_google_fonts:
    'Abrir um CV em HTML exportado já não estabelece ligação com o Google para carregar fontes. São utilizados os mesmos ficheiros de fonte já disponibilizados pelo KiwiCV, garantindo uma apresentação idêntica sem revelar a ninguém que o abriste.',
  other_import_clear_warning:
    'O resumo da importação agora avisa-te claramente quando valores que não são de texto são limpos de campos exclusivos de texto, em vez de os deixar em branco silenciosamente.',
  other_kiwicanopy_family:
    'Conhece o resto da família KiwiCanopy — o KiwiCV inclui agora ligações para o KiwiCanopy e o KiwiDesk a partir da página Sobre.',
};
