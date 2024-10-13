const TelegramBot = require('node-telegram-bot-api');
const { v4: uuidv4 } = require('uuid');

// Reemplaza con tu token de bot
const token = '8057893021:AAHg0SDhui0xvWjCSQtoL0a_v7HQrAT5aa0';
const bot = new TelegramBot(token, { polling: true });

const conversations = {};

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    conversations[chatId] = {};
    bot.sendMessage(chatId, "¡Hola! Vamos a crear un reporte. ¿Cuál es el título?");
});

bot.on('message', (msg) => {
    const chatId = msg.chat.id;

    if (!conversations[chatId]) return;

    const currentState = Object.keys(conversations[chatId]).length > 0 ? Object.keys(conversations[chatId])[0] : null;

    if (!currentState) {
        conversations[chatId].title = msg.text;
        bot.sendMessage(chatId, "¿Cuál es la fecha del reporte? (Formato: DD/MM/AAAA)");
        conversations[chatId]['date'] = true;
    } else if (conversations[chatId].date) {
        conversations[chatId].date = msg.text;
        bot.sendMessage(chatId, "¿Cuál es la ubicación del evento?");
        conversations[chatId]['location'] = true;
    } else if (conversations[chatId].location) {
        conversations[chatId].location = msg.text;
        bot.sendMessage(chatId, "Describe brevemente el evento:");
        conversations[chatId]['description'] = true;
    } else if (conversations[chatId].description) {
        conversations[chatId].description = msg.text;
        bot.sendMessage(chatId, "Puedes enviar fotos relacionadas al evento.");
        conversations[chatId]['photos'] = [];
    } else if (msg.photo) {
        conversations[chatId].photos.push(msg.photo[msg.photo.length - 1].file_id);
        bot.sendMessage(chatId, "Foto recibida. ¿Quieres enviar más fotos? (sí/no)");
    } else if (msg.text.toLowerCase() === 'no') {
        finalizeReport(chatId);
    }
});

function finalizeReport(chatId) {
    const report = {
        title: conversations[chatId].title,
        date: conversations[chatId].date,
        location: conversations[chatId].location,
        description: conversations[chatId].description,
        photos: conversations[chatId].photos
    };

    const reportText = `
        Título: ${report.title}
        Fecha: ${report.date}
        Lugar: ${report.location}
        Descripción: ${report.description}
    `;

    bot.sendMessage(chatId, reportText);

    if (report.photos && report.photos.length > 0) {
        report.photos.forEach(photo => {
            bot.sendPhoto(chatId, photo, { caption: reportText });
        });
    }

    // Guardar versiones si es necesario
    if (!conversations[chatId].versions) {
        conversations[chatId].versions = [];
    }
    conversations[chatId].versions.push(report);

    bot.sendMessage(chatId, "Reporte finalizado. Puedes editarlo o ver versiones.");
    delete conversations[chatId]; // Limpiar la conversación
}