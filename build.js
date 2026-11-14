// Inlines src/* into one self-contained dist/index.html. Usage: node build.js
const fs = require('fs'), p = f => fs.readFileSync(__dirname + '/src/' + f, 'utf8');
let html = p('index.template.html');
const put = (tag, body) => { html = html.split(tag).join(body.replace(/<\/script>/g, '<\\/script>')); };
put('/*__CSS__*/', p('styles.css')); put('/*__SIM__*/', p('sim.js')); put('/*__CONTENT__*/', p('content.js')); put('/*__GAME__*/', p('game.js'));
fs.mkdirSync(__dirname + '/dist', { recursive: true });
fs.writeFileSync(__dirname + '/dist/index.html', html);
console.log('dist/index.html', (html.length / 1024).toFixed(1) + ' KB');
