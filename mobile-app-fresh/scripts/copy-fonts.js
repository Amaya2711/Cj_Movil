// Script para copiar fuentes de MaterialCommunityIcons a la carpeta public/fonts
const fs = require('fs');
const path = require('path');


// Fuente original y nombre con hash que busca el build


// Copia todos los archivos MaterialCommunityIcons.*.ttf generados por Expo export
const glob = require('glob');
const distFontsDir = path.join(__dirname, '../dist/assets/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts');
const publicFontsDir = path.join(__dirname, '../public/assets/fonts');

if (!fs.existsSync(publicFontsDir)) {
  fs.mkdirSync(publicFontsDir, { recursive: true });
}

const files = glob.sync('MaterialCommunityIcons.*.ttf', { cwd: distFontsDir });
if (files.length === 0) {
  console.warn('No se encontraron archivos MaterialCommunityIcons.*.ttf en dist.');
} else {
  files.forEach(file => {
    const src = path.join(distFontsDir, file);
    const dest = path.join(publicFontsDir, file);
    fs.copyFileSync(src, dest);
    console.log(`Copiado: ${file} a ${dest}`);
  });
}
