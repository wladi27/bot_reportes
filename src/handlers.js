const reports = {};

const handleText = (ctx) => {
    const state = ctx.session.state;

    if (state === 'TITLE') {
        ctx.session.title = ctx.message.text;
        ctx.session.state = 'DESCRIPTION';
        ctx.reply('Título recibido. Ahora, por favor proporciona una descripción.');
    } else if (state === 'DESCRIPTION') {
        ctx.session.description = ctx.message.text;
        ctx.session.state = 'LOCATION';
        ctx.reply('Descripción recibida. Ahora, por favor proporciona la ubicación.');
    } else if (state === 'LOCATION') {
        ctx.session.location = ctx.message.text;
        ctx.session.state = 'DATE';
        ctx.reply('Ubicación recibida. Ahora, por favor proporciona la fecha.');
    } else if (state === 'DATE') {
        ctx.session.date = ctx.message.text;
        ctx.session.state = 'CONFIRMATION';
        ctx.reply(`Reporte creado:\nTítulo: ${ctx.session.title}\nDescripción: ${ctx.session.description}\nUbicación: ${ctx.session.location}\nFecha: ${ctx.session.date}\n¿Deseas guardar este reporte? (sí/no)`);
    } else if (state === 'CONFIRMATION') {
        if (ctx.message.text.toLowerCase() === 'sí') {
            const reportId = Date.now();
            reports[reportId] = {
                title: ctx.session.title,
                description: ctx.session.description,
                location: ctx.session.location,
                date: ctx.session.date,
            };
            ctx.reply(`Reporte guardado con ID: ${reportId}`);
            ctx.session.state = null; // Reinicia el estado
        } else {
            ctx.reply('Reporte no guardado. Puedes empezar de nuevo con /start.');
            ctx.session.state = null; // Reinicia el estado
        }
    }
};

// Manejo del comando /cancel
const cancelHandler = (ctx) => {
    ctx.reply('Operación cancelada. Puedes empezar de nuevo con /start.');
    ctx.session.state = null; // Reinicia el estado
};

// Manejo del comando /editar
const editHandler = (ctx) => {
    ctx.reply('Funcionalidad de edición no implementada todavía.');
};

// Manejo del comando /versiones
const versionsHandler = (ctx) => {
    ctx.reply('Funcionalidad de versiones no implementada todavía.');
};

module.exports = {
    handleText,
    cancelHandler,
    editHandler,
    versionsHandler,
};
