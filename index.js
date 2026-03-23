require("dotenv").config();
const { Telegraf, Markup } = require("telegraf"); // Añadimos Markup para crear botones
const { createClient } = require("@supabase/supabase-js");

// 1. Conectar con Supabase y Telegram
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
);
const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

// 2. Comando de Ayuda (/ayuda)
bot.command("ayuda", (ctx) => {
  const mensajeAyuda = `
🤖 *Guía de uso de tu Lista de la Compra:*

Aquí tienes lo que puedo hacer por ti:
🔸 */lista* - Muestra todos los productos que hay guardados.
🔸 */add [producto]* - Añade un nuevo producto. (Ej: /add Leche)
🔸 */del [producto]* - Borra un producto de la lista. (Ej: /del Leche)
🔸 */limpiar* - Vacía TODA la lista de la compra.
🔸 */ayuda* - Muestra este mensaje.

¡Pruébalo!
    `;
  ctx.reply(mensajeAyuda, { parse_mode: "Markdown" });
});

// Comando SECRETO (/niña) esquivando la limitación de la 'ñ'
bot.hears("/niña", (ctx) => {
  ctx.reply("😘😘😘");
});

// 3. Comando para ver la lista (/lista)
 bot.command("lista", async (ctx) => {
  const { data, error } = await supabase.from("shopping_list").select("*");

  if (error) return ctx.reply("❌ Error al consultar la base de datos.");
  if (data.length === 0)
    return ctx.reply("🛒 La lista de la compra está vacía.");

  let mensaje = "📝 *Tu lista de la compra:*\n\n";
  data.forEach((item, index) => {
    mensaje += `${index + 1}. ${item.item_name}\n`;
  });

  ctx.reply(mensaje, { parse_mode: "Markdown" });
}); 

// 4. Comando para añadir productos (/add)
bot.command("add", async (ctx) => {
  const producto = ctx.message.text.split(" ").slice(1).join(" ");

  if (!producto)
    return ctx.reply("⚠️ Dime qué quieres añadir. Ejemplo: /add manzanas");

  const { error } = await supabase
    .from("shopping_list")
    .insert([{ item_name: producto, added_by: ctx.from.first_name }]);

  if (error) return ctx.reply("❌ Hubo un error al guardar el producto.");
  ctx.reply(`✅ *${producto}* añadido a la lista.`, { parse_mode: "Markdown" });
});

// 5. Comando para borrar productos individuales (/del)
bot.command("del", async (ctx) => {
  const producto = ctx.message.text.split(" ").slice(1).join(" ");

  if (!producto)
    return ctx.reply("⚠️ Dime qué quieres borrar. Ejemplo: /del manzanas");

  const { data, error } = await supabase
    .from("shopping_list")
    .delete()
    .ilike("item_name", producto)
    .select();

  if (error)
    return ctx.reply(
      "❌ Hubo un error de conexión al intentar borrar el producto.",
    );

  if (data && data.length > 0) {
    ctx.reply(`🗑️ *${data[0].item_name}* eliminado de la lista.`, {
      parse_mode: "Markdown",
    });
  } else {
    ctx.reply(`🤷‍♂️ No he encontrado "*${producto}*" en la lista.`, {
      parse_mode: "Markdown",
    });
  }
});

// 6. Comando para LIMPIAR toda la lista (/limpiar)
bot.command("limpiar", (ctx) => {
  ctx.reply(
    "⚠️ ¿Estás totalmente seguro de que quieres vaciar la lista de la compra?",
    Markup.inlineKeyboard([
      Markup.button.callback("✅ Sí, vaciar lista", "confirmar_limpiar"),
      Markup.button.callback("❌ Cancelar", "cancelar_limpiar"),
    ]),
  );
});

// 6.1 Acción al pulsar el botón de "Sí, vaciar lista"
bot.action("confirmar_limpiar", async (ctx) => {
  // Supabase exige una condición para hacer un borrado múltiple.
  // Usamos .gt('id', 0) para decirle "borra todo lo que tenga un ID mayor a 0" (es decir, todo).
  const { error } = await supabase.from("shopping_list").delete().gt("id", 0);

  if (error) {
    return ctx.editMessageText("❌ Hubo un error al intentar vaciar la lista.");
  }

  // editMessageText reemplaza el mensaje de los botones por el texto final
  ctx.editMessageText("🧹 La lista de la compra ha sido vaciada por completo.");
});

// 6.2 Acción al pulsar el botón de "Cancelar"
bot.action("cancelar_limpiar", (ctx) => {
  ctx.editMessageText("👍 Acción cancelada. Tu lista sigue intacta.");
});

// 7. Iniciar el bot
bot.launch();
console.log(
  "🤖 Bot iniciado. Botones de confirmación y comando secreto activados.",
);

// Código de seguridad para detener el bot
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

// Servidor web fantasma para mantener vivo el bot en el hosting
const http = require("http");
http
  .createServer((req, res) => res.end("El bot está funcionando correctamente."))
  .listen(process.env.PORT || 3000);
