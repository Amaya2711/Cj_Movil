const { execSync } = require('child_process');

const message = process.env.npm_config_message || "Incluyo fuentes de iconos para producción";

try {
  execSync('npm run export', { stdio: 'inherit' });
  // Agrega archivos de fuente y también el propio script si cambió
  execSync('git add -f public/assets/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/*.ttf', { stdio: 'inherit' });
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
