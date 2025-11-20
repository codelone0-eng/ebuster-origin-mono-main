import { promises as fs } from 'fs';
import path from 'path';

const distDir = path.resolve(process.cwd(), 'dist');
const indexPath = path.join(distDir, 'index.html');
const assetsDir = path.join(distDir, 'assets');

async function main() {
  try {
    // Проверяем существование директорий
    try {
      await fs.access(distDir);
    } catch {
      console.error(`❌ Directory ${distDir} does not exist`);
      process.exitCode = 1;
      return;
    }

    try {
      await fs.access(assetsDir);
    } catch {
      console.error(`❌ Directory ${assetsDir} does not exist`);
      process.exitCode = 1;
      return;
    }

    const [originalHtml, assetEntries] = await Promise.all([
      fs.readFile(indexPath, 'utf8'),
      fs.readdir(assetsDir),
    ]);

    console.log(`📦 Found ${assetEntries.length} assets in dist/assets`);

    const jsFiles = assetEntries.filter((file) => file.endsWith('.js'));
    const cssFiles = assetEntries.filter((file) => file.endsWith('.css'));

    console.log(`📄 JS files: ${jsFiles.length}, CSS files: ${cssFiles.length}`);

    // Ищем главный JS файл
    const mainJs = jsFiles.find((file) => file.startsWith('index-')) ?? jsFiles[0];

    if (!mainJs) {
      console.error('❌ Unable to locate built index JS bundle in dist/assets');
      console.error(`Available JS files: ${jsFiles.join(', ')}`);
      process.exitCode = 1;
      return;
    }

    console.log(`✅ Found main JS: ${mainJs}`);

    // Ищем CSS файлы - Vite может генерировать разные имена
    const mainCss = cssFiles.find((file) => file.startsWith('index-')) ?? cssFiles[0];

    if (!mainCss) {
      console.warn('⚠️  No CSS file found! This might cause styling issues.');
      console.log(`Available files: ${assetEntries.join(', ')}`);
    } else {
      console.log(`✅ Found main CSS: ${mainCss}`);
    }

    const cssTag = mainCss ? `    <link rel="stylesheet" href="/assets/${mainCss}" />` : '';
    const scriptTag = `    <script type="module" crossorigin src="/assets/${mainJs}"></script>`;

    let html = originalHtml;

    // Remove any legacy script tags pointing to /src/main.tsx
    html = html.replace(/\s*<script[^>]+src="\/src\/main\.tsx"[^>]*><\/script>\s*/g, '\n');

    // Remove previously injected index-*.js tags (avoid duplicates on rebuild)
    html = html.replace(/\s*<script[^>]+src="\/assets\/index-[^"]+\.js"[^>]*><\/script>\s*/g, '\n');

    // Remove duplicate CSS links, но сохраняем те, что уже есть от Vite
    // Удаляем только если они указывают на неправильный путь
    html = html.replace(/\s*<link[^>]+href="\/assets\/[^"]+\.css"[^>]*>\s*/g, '\n');

    // Добавляем CSS в head, если он есть
    if (cssTag) {
      if (/<\/head>/i.test(html)) {
        html = html.replace(/<\/head>/i, `\n${cssTag}\n  </head>`);
      } else {
        html = html.replace(/<body([^>]*)>/i, `<body$1>\n${cssTag}`);
      }
    }

    // Добавляем JS в body
    if (scriptTag) {
      if (/<\/body>/i.test(html)) {
        html = html.replace(/<\/body>/i, `\n${scriptTag}\n  </body>`);
      } else {
        html += `\n${scriptTag}\n`;
      }
    }

    await fs.writeFile(indexPath, html, 'utf8');
    console.log('✅ Patched dist/index.html with hashed asset references');
  } catch (error) {
    console.error('❌ Failed to patch dist/index.html', error);
    process.exitCode = 1;
  }
}

main();
