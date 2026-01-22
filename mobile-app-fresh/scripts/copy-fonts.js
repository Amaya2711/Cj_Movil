// Script para copiar fuentes de MaterialCommunityIcons a la carpeta public/fonts
const fs = require('fs');
const path = require('path');


// Fuente original y nombre con hash que busca el build

// Hash que busca el frontend (ajusta si cambia en el futuro)
const hash = '6e435534bd35da5fef04168860a9b8fa';

const fontsToCopy = [
  // Copia la fuente original renombrada con hash a la ruta exacta que Expo export busca en producción
  {
    src: 'MaterialCommunityIcons.ttf',
    dest: `../public/assets/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialCommunityIcons.${hash}.ttf`,
  },
  // Opcional: copia la fuente original a public/fonts por compatibilidad
  {
    src: 'MaterialCommunityIcons.ttf',
    dest: '../public/fonts/MaterialCommunityIcons.ttf',
  },
];

const srcDir = path.join(__dirname, '../node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts');

fontsToCopy.forEach(fontObj => {
  const src = path.join(srcDir, fontObj.src);
  const dest = path.join(__dirname, fontObj.dest);
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`Copiado: ${fontObj.src} como ${dest}`);
  } else {
    console.warn(`No encontrado: ${fontObj.src}`);
  }
});
