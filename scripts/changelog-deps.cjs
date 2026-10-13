const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const LOCALES = require('./languages.cjs');
const { formatVersionId, readEntryObject, writeEntryFile } = require('./changelog-file.cjs');
const { regenerateChangelogIndexes } = require('./changelog-index.cjs');
const PACKAGE_JSON_PATH = path.join(__dirname, '..', 'package.json');
const BASE_PATH = path.join(__dirname, '..', 'src', 'locales');

const DEPS_TRANSLATIONS = {
  en: 'As always, a few minor package updates in the background keep the technology behind KiwiCV as up-to-date as possible.',
  de: 'Wie immer sorgen einige kleinere Paket-Updates im Hintergrund dafür, dass die Technologie hinter KiwiCV so aktuell wie möglich bleibt.',
  es: 'Como siempre, algunas actualizaciones menores de paquetes en segundo plano mantienen la tecnología de KiwiCV lo más actualizada posible.',
  fr: 'Comme toujours, quelques mises à jour mineures de packages en arrière-plan permettent de garder la technologie derrière KiwiCV aussi à jour que possible.',
  it: 'Come sempre, alcuni aggiornamenti minori dei pacchetti in background mantengono la tecnologia alla base di KiwiCV il più aggiornata possibile.',
  pt: 'Como sempre, algumas pequenas atualizações de pacotes em segundo plano mantêm a tecnologia por trás do KiwiCV o mais atualizada possível.',
  nl: 'Zoals altijd zorgen een paar kleine pakketupdates op de achtergrond ervoor dat de technologie achter KiwiCV zo up-to-date mogelijk blijft.',
  pl: 'Jak zawsze, kilka drobnych aktualizacji pakietów w tle dba o to, aby technologia stojąca za KiwiCV była jak najbardziej aktualna.',
  ru: 'Как всегда, несколько небольших обновлений пакетов в фоновом режиме поддерживают технологии KiwiCV в максимально актуальном состоянии.',
  zh: '与往常一样，后台的一些微小包更新使 KiwiCV 背后的技术尽可能保持最新。',
  ja: 'いつも通り、バックグラウンドでのいくつかのマイナーなパッケージアップデートにより、KiwiCVの背後にあるテクノロジーを可能な限り最新の状態に保ちます。',
  bg: 'Както винаги, няколко малки актуализации на пакети във фонов режим поддържат технологията зад KiwiCV възможно най-актуална.',
  tr: "Her zaman olduğu gibi, arka plandaki birkaç küçük paket güncellemesi KiwiCV'ın arkasındaki teknolojiyi olabildiğince güncel tutar.",
  sv: 'Som alltid håller några mindre paketuppdateringar i bakgrunden tekniken bakom KiwiCV så uppdaterad som möjligt.',
  uk: 'Як завжди, кілька невеликих оновлень пакетів у фоновому режимі підтримують технології KiwiCV у максимально актуальному стані.',
};

function main() {
  console.log('📦 Injecting background dependency updates changelog entry...');

  // 1. Get current version ID
  const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf8'));
  const versionId = formatVersionId(pkg.version);

  let updatedLocales = 0;
  let createdLocales = 0;

  // 2. Add translation to all locales
  LOCALES.forEach((locale) => {
    const targetFile = path.join(BASE_PATH, locale, 'changelog', `${versionId}.ts`);

    // A release whose only content is dependency updates has an empty
    // `CHANGELOG_UPDATES`, so `changelog:sync` creates no version file and this
    // script used to warn fifteen times and write nothing — leaving
    // `src/data/changelog.ts` advertising an id that resolves to no content.
    // Bootstrapping the file here is what makes a dependency-only release
    // possible without a hand-written entry existing purely to create it.
    if (!fs.existsSync(targetFile)) {
      const dir = path.dirname(targetFile);
      if (!fs.existsSync(dir)) {
        console.warn(`⚠️ Warning: no changelog directory for locale [${locale}]: ${dir}`);
        return;
      }
      writeEntryFile(
        targetFile,
        versionId,
        { chore_dependency_updates: DEPS_TRANSLATIONS[locale] },
        locale,
      );
      createdLocales++;
      updatedLocales++;
      return;
    }

    // `|| {}` here would inject the dependency line into an empty object and
    // write that back, silently deleting every entry the release had already
    // folded in. A file that cannot be read is skipped, not rewritten.
    const obj = readEntryObject(targetFile);
    if (!obj) {
      console.warn(`⚠️ Warning: Could not parse object in ${targetFile} — skipping this locale.`);
      return;
    }

    // Only inject if not already present
    if (!obj.chore_dependency_updates) {
      obj.chore_dependency_updates = DEPS_TRANSLATIONS[locale];
      writeEntryFile(targetFile, versionId, obj, locale);
      updatedLocales++;
    }
  });

  if (updatedLocales > 0) {
    console.log(`✅ Injected chore_dependency_updates into ${updatedLocales} locales.`);

    // A file no index imports is invisible to the app, so a bootstrapped
    // version has to be registered before it counts as shipped.
    if (createdLocales > 0) {
      console.log(`🆕 Created ${versionId}.ts for ${createdLocales} locales — rebuilding indexes.`);
      regenerateChangelogIndexes(BASE_PATH, LOCALES);
    }

    // Run Prettier
    try {
      execSync(
        `npx prettier --config .prettierrc --write "src/locales/*/changelog/${versionId}.ts"`,
        { stdio: 'ignore' },
      );
    } catch (e) {
      // Ignored
    }
  } else {
    console.log('ℹ️ chore_dependency_updates was already present in all locales.');
  }
}

main();
