import { promises as fs } from 'fs';
import path from 'path';

const distDir = path.resolve(process.cwd(), 'dist');
const indexPath = path.join(distDir, 'index.html');
const assetsDir = path.join(distDir, 'assets');

async function main() {
  try {
    const [originalHtml, assetEntries] = await Promise.all([
      fs.readFile(indexPath, 'utf8'),
      fs.readdir(assetsDir),
    ]);

    const jsFiles = assetEntries.filter((file) => file.endsWith('.js'));
    const cssFiles = assetEntries.filter((file) => file.endsWith('.css'));

    const mainJs = jsFiles.find((file) => file.startsWith('index-')) ?? jsFiles[0];

    if (!mainJs) {
      throw new Error('Unable to locate built index JS bundle in dist/assets');
    }

    const cssTags = cssFiles
      .filter((file) => file.startsWith('index-'))
      .map((file) => `    <link rel="stylesheet" href="/assets/${file}" />`)
      .join('\n');

    const scriptTag = `    <script type="module" crossorigin src="/assets/${mainJs}"></script>`;

    let html = originalHtml;

    // Remove any legacy script tags pointing to /src/main.tsx
    html = html.replace(/\s*<script[^>]+src="\/src\/main\.tsx"[^>]*><\/script>\s*/g, '\n');

    // Remove previously injected index-*.js tags (avoid duplicates on rebuild)
    html = html.replace(/\s*<script[^>]+src="\/assets\/index-[^"]+\.js"[^>]*><\/script>\s*/g, '\n');

    // Remove duplicate index-*.css links
    html = html.replace(/\s*<link[^>]+href="\/assets\/index-[^"]+\.css"[^>]*>\s*/g, '\n');

    if (cssTags) {
      if (/<\/head>/i.test(html)) {
        html = html.replace(/<\/head>/i, `\n${cssTags}\n  </head>`);
      } else {
        html = html.replace(/<body([^>]*)>/i, `<body$1>\n${cssTags}`);
      }
    }

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
    console.error('Failed to patch dist/index.html', error);
    process.exitCode = 1;
  }
}

main();
