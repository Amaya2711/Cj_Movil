// Script para copiar fuentes de MaterialCommunityIcons a la carpeta public/fonts
const fs = require('fs');
const path = require('path');

const fontsToCopy = [
  'MaterialCommunityIcons.ttf',
  // Puedes agregar más fuentes aquí si las necesitas
];

const srcDir = path.join(__dirname, '../node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts');
const destDir = path.join(__dirname, '../public/fonts');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

fontsToCopy.forEach(font => {
  const src = path.join(srcDir, font);
  const dest = path.join(destDir, font);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`Copiado: ${font}`);
  } else {
    console.warn(`No encontrado: ${font}`);
  }
});
