import { promises as fs } from 'fs';
import path from 'path';

const distDir = path.resolve(process.cwd(), 'dist');
const indexPath = path.join(distDir, 'index.html');
const assetsDir = path.join(distDir, 'assets');

async function main() {
  try {
    const [html, assetEntries] = await Promise.all([
      fs.readFile(indexPath, 'utf8'),
      fs.readdir(assetsDir),
    ]);

    if (!html.includes('/src/main.tsx')) {
      console.log('index.html already contains built asset references. Skipping patch.');
      return;
    }

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

    const replacement = [cssTags, scriptTag].filter(Boolean).join('\n') + '\n';

    const nextHtml = html.replace(
      /\s*<script type="module"\s+src="\/src\/main\.tsx"><\/script>\s*/,
      `\n${replacement}`,
    );

    await fs.writeFile(indexPath, nextHtml, 'utf8');
    console.log('✅ Patched dist/index.html with hashed asset references');
  } catch (error) {
    console.error('Failed to patch dist/index.html', error);
    process.exitCode = 1;
  }
}

main();
