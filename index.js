require("dotenv").config();
const { Telegraf } = require("telegraf");
const http = require("http");
const handlers = require("./handlers"); // Importamos nuestras funciones

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

// 1. Enlazamos los comandos de texto con sus funciones
bot.command('help', handlers.mostrarAyuda);
bot.command('list', handlers.mostrarLista);
bot.command('add', handlers.añadirProducto);
bot.command('del', handlers.borrarProductoTexto);
bot.command('clear', handlers.confirmarLimpiar);
bot.hears('/niña', handlers.sorpresaNina);

// 2. Enlazamos los clics en los botones con sus funciones
// Paso 1: El usuario pulsa la X en la lista
bot.action(/preguntar_borrar_(.+)/, handlers.pedirConfirmacionIndividual);

// Paso 2: El usuario confirma que sí quiere borrar
bot.action(/ejecutar_borrado_(.+)/, handlers.ejecutarBorradoIndividual);

// Paso 3: El usuario cancela
bot.action('cancelar_borrado_indiv', handlers.cancelarBorradoIndividual);

// Acciones de limpieza total
bot.action('confirmar_limpiar', handlers.ejecutarLimpiar);
bot.action('cancelar_limpiar', handlers.cancelarLimpiar);

// 3. Iniciamos el bot
bot.launch();
console.log("🤖 Bot iniciado correctamente con código limpio y modular.");

// 4. Servidor web fantasma (Para mantener vivo el bot en Render/Cron-job)
http
  .createServer((req, res) => res.end("El bot está funcionando correctamente."))
  .listen(process.env.PORT || 3000);

// Código de seguridad para cerrar el bot adecuadamente
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
