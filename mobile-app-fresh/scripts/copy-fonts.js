// Script para copiar fuentes de MaterialCommunityIcons a la carpeta public/fonts
const fs = require('fs');
const path = require('path');


// Fuente original y nombre con hash que busca el build
const fontsToCopy = [
  {
    src: 'MaterialCommunityIcons.ttf',
    dest: 'MaterialCommunityIcons.ttf',
  },
  {
    src: 'MaterialCommunityIcons.ttf',
    dest: 'MaterialCommunityIcons.4168860a9b8fa.ttf',
  },
  {
    src: 'MaterialCommunityIcons.6e435534bd35da5fef04168860a9b8fa.ttf',
    dest: 'MaterialCommunityIcons.6e435534bd35da5fef04168860a9b8fa.ttf',
  },
  // Puedes agregar más fuentes aquí si las necesitas
];

const srcDir = path.join(__dirname, '../node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts');
const destDir = path.join(__dirname, '../public/fonts');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

fontsToCopy.forEach(fontObj => {
  const src = path.join(srcDir, fontObj.src);
  const dest = path.join(destDir, fontObj.dest);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`Copiado: ${fontObj.src} como ${fontObj.dest}`);
  } else {
    console.warn(`No encontrado: ${fontObj.src}`);
  }
});
