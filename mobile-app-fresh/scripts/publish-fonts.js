const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const message = process.env.npm_config_message || "Incluyo fuentes de iconos para producción";

// Rutas origen y destino de las fuentes
const sourceDir = path.join(__dirname, '../node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts');
const destDirs = [
  path.join(__dirname, '../public/assets/Fonts'),
  path.join(__dirname, '../dist/assets/Fonts'),
];

// Copiar fuentes si existen
if (fs.existsSync(sourceDir)) {
  destDirs.forEach(destDir => {
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.readdirSync(sourceDir).forEach(file => {
      if (file.endsWith('.ttf')) {
        fs.copyFileSync(path.join(sourceDir, file), path.join(destDir, file));
      }
    });
    console.log(`Fuentes copiadas a ${destDir}`);
  });
} else {
  console.warn('No se encontró la carpeta de fuentes en node_modules. ¿Ejecutaste npm install?');
}

try {
  execSync('npm run export', { stdio: 'inherit' });
  // Agrega archivos de fuente y también el propio script si cambió
  execSync('git add -f public/assets/Fonts/*.ttf', { stdio: 'inherit' });
  execSync('git add scripts/publish-fonts.js', { stdio: 'inherit' });
  // Intenta hacer commit solo si hay cambios
  execSync(`git commit -m "${message}"`, { stdio: 'inherit' });
  execSync('git push', { stdio: 'inherit' });
  console.log('¡Fuentes publicadas y commit realizado!');
} catch (err) {
  if (err.status === 1 && err.message && err.message.includes('nothing to commit')) {
    console.log('No hay cambios nuevos en las fuentes para commitear. Se hará un commit vacío para forzar el deploy.');
    execSync(`git commit --allow-empty -m "${message}"`, { stdio: 'inherit' });
    execSync('git push', { stdio: 'inherit' });
  } else {
    throw err;
  }
}
