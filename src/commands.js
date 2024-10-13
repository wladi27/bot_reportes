const startCommand = (ctx) => {
    ctx.reply('¡Hola! Vamos a crear un reporte. ¿Cuál es el título?');
    ctx.session.state = 'TITLE';
};

const helpCommand = (ctx) => {
    ctx.reply('Comandos disponibles: /start, /help, /editar, /versiones, /cancel, /foto');
};

const sendPhotoCommand = (ctx) => {
    ctx.replyWithPhoto({ url: 'https://example.com/image.jpg' }, { caption: 'Aquí está la foto.' });
};

module.exports = { startCommand, helpCommand, sendPhotoCommand };

