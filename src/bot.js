const { Telegraf, Markup } = require('telegraf');

const bot = new Telegraf('8057893021:AAHg0SDhui0xvWjCSQtoL0a_v7HQrAT5aa0'); // Reemplaza con tu token

let userData = {}; // Para almacenar datos del usuario temporalmente
let reports = {}; // Para almacenar reportes

// Comando /start
bot.start((ctx) => {
    userData[ctx.chat.id] = {}; // Inicializa el almacenamiento de datos del usuario
    ctx.reply('¡Hola! Bienvenido al sistema de reportes. Elige una opción:', Markup.keyboard([
        ['Crear Reporte', 'Ver Reportes'],
        ['Buscar Reporte', 'Ayuda'],
        ['Cancelar']
    ]).oneTime().resize());
});

// Manejar el menú de botones
bot.hears('Crear Reporte', (ctx) => {
    ctx.reply('¿Cuál es el título del reporte?');
    userData[ctx.chat.id] = {}; // Reinicia los datos del usuario para un nuevo reporte
});

// Comando para ver reportes
bot.hears('Ver Reportes', (ctx) => {
    const reportTitles = Object.keys(reports);
    if (reportTitles.length === 0) {
        ctx.reply('No hay reportes guardados.');
    } else {
        const buttons = reportTitles.map(title => Markup.button.callback(title, `view_report_${title}`));
        ctx.reply('Reportes guardados:', Markup.inlineKeyboard(buttons));
    }
});

// Comando para buscar reportes
bot.hears('Buscar Reporte', (ctx) => {
    ctx.reply('Escribe el título del reporte que quieres buscar.');
});

// Comando para ayuda
bot.hears('Ayuda', (ctx) => {
    ctx.reply('Comandos disponibles:\n/start - Iniciar el bot\nCrear Reporte - Comenzar un nuevo reporte\nVer Reportes - Ver reportes guardados\nBuscar Reporte - Buscar un reporte por su título\nCancelar - Cancelar la creación del reporte.');
});

// Comando para cancelar
bot.hears('Cancelar', (ctx) => {
    delete userData[ctx.chat.id]; // Limpia los datos del usuario
    ctx.reply('Creación de reporte cancelada. Puedes elegir otra opción.');
});

// Manejar la búsqueda de reportes
// Manejar la búsqueda de reportes
bot.on('text', (ctx) => {
    const title = ctx.message.text.trim();

    // Intentar buscar el reporte directamente con el título proporcionado
    if (reports[title]) {
        const report = reports[title];
        const reportDetails = `
*Reporte Encontrado:*
*Título:* ${title}
*Fecha:* ${report.date}
*Ubicación:* ${report.location}
*Descripción:* ${report.description}
*Responsable:* ${report.responsible}
        `;
        ctx.reply(reportDetails, { parse_mode: 'Markdown' });
        return; // Evitar crear un nuevo reporte
    }

    // Manejar el título si no se está buscando
    if (!userData[ctx.chat.id]) {
        userData[ctx.chat.id] = {}; // Inicializa si no existe
    }

    // Comenzar el proceso de creación de un nuevo reporte
    if (!userData[ctx.chat.id].title) {
        userData[ctx.chat.id].title = title;
        ctx.reply('¿Cuál es la fecha del reporte? (Formato: DD/MM/AAAA)');
    } else if (!userData[ctx.chat.id].date) {
        userData[ctx.chat.id].date = title;
        ctx.reply('¿Cuál es la ubicación del evento?');
    } else if (!userData[ctx.chat.id].location) {
        userData[ctx.chat.id].location = title;
        ctx.reply('Describe brevemente el evento:');
    } else if (!userData[ctx.chat.id].description) {
        userData[ctx.chat.id].description = title;
        userData[ctx.chat.id].photos = []; // Inicializa el array de fotos
        ctx.reply('Puedes enviar fotos relacionadas al evento. Envía una foto o escribe "finalizar" para completar el reporte.');
    } else if (title.toLowerCase() === 'finalizar') {
        finalizeReport(ctx);
    } else {
        ctx.reply('No se encontró ningún reporte con ese título.');
    }
});


// Manejar fotos
bot.on('photo', (ctx) => {
    if (!userData[ctx.chat.id].photos) {
        ctx.reply('Primero debes completar la descripción del evento.');
        return;
    }
    
    const photoId = ctx.message.photo[ctx.message.photo.length - 1].file_id; // Obtener el ID de la foto
    userData[ctx.chat.id].photos.push(photoId); // Agrega la foto al array

    ctx.reply('Foto añadida. Envía otra foto o escribe "finalizar" para completar el reporte.');
});

// Finalizar el reporte
async function finalizeReport(ctx) {
    const responsible = ctx.from.first_name; // Obtener el nombre del usuario
    const reportText = `
*Reporte Finalizado:*
*Título:* ${userData[ctx.chat.id].title}
*Fecha:* ${userData[ctx.chat.id].date}
*Ubicación:* ${userData[ctx.chat.id].location}
*Descripción:* ${userData[ctx.chat.id].description}
*Responsable:* ${responsible}
    `;
    
    const photos = userData[ctx.chat.id].photos;
    if (photos.length > 0) {
        const media = photos.map(photoId => ({ type: 'photo', media: photoId }));
        
        await ctx.replyWithPhoto(media[0].media, { caption: reportText, parse_mode: 'Markdown' });
        if (media.length > 1) {
            await ctx.replyWithMediaGroup(media.slice(1)); // Envía el resto de las fotos
        }
    } else {
        ctx.reply(reportText + '\n(No se enviaron fotos.)');
    }

    reports[userData[ctx.chat.id].title] = {
        date: userData[ctx.chat.id].date,
        location: userData[ctx.chat.id].location,
        description: userData[ctx.chat.id].description,
        responsible: responsible,
        photos: photos
    };

    delete userData[ctx.chat.id];
    ctx.reply('Reporte creado con éxito.');
}

// Manejar la selección de reportes
bot.action(/view_report_(.+)/, (ctx) => {
    const title = ctx.match[1];
    const report = reports[title];
    const reportDetails = `
*Reporte:*
*Título:* ${title}
*Fecha:* ${report.date}
*Ubicación:* ${report.location}
*Descripción:* ${report.description}
*Responsable:* ${report.responsible}
    `;
    ctx.reply(reportDetails, { parse_mode: 'Markdown' });
});

// Iniciar el bot
bot.launch();