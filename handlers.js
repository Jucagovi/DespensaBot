const { Markup } = require("telegraf");
const supabase = require("./db"); // Importamos la conexión que creamos en db.js

// --- COMANDOS BÁSICOS ---

const mostrarAyuda = (ctx) => {
  const mensajeAyuda = `
🤖 *Guía de uso de tu Lista de la Compra:*

🔸 */list* - Muestra todos los productos.
🔸 */add [producto]* - Añade un producto.
🔸 */del [producto]* - Borra un producto (nombre).
🔸 */clear* - Vacía TODA la lista de la compra.
🔸 */help* - Muestra este mensaje.

En Echo se debe decir "dile a DespensaBot que...":
🔸 *añadir* -  necesitamos [producto]
🔸 *listar* - qué falta / qué hay
    `;
  ctx.reply(mensajeAyuda, { parse_mode: "Markdown" });
};

const sorpresaNina = (ctx) => {
  ctx.reply("😘😘😘");
};

const borrarProductoTexto = async (ctx) => {
  const producto = ctx.message.text.split(" ").slice(1).join(" ");
  if (!producto)
    return ctx.reply("⚠️ Dime qué quieres borrar. Ejemplo: /del manzanas");

  const { data, error } = await supabase
    .from("shopping_list")
    .delete()
    .ilike("item_name", producto)
    .select();

  if (error) return ctx.reply("❌ Hubo un error al borrar el producto.");

  if (data && data.length > 0) {
    ctx.reply(`🗑️ *${data[0].item_name}* eliminado.`, {
      parse_mode: "Markdown",
    });
  } else {
    ctx.reply(`🤷‍♂️ No he encontrado "*${producto}*".`, {
      parse_mode: "Markdown",
    });
  }
};

// --- COMANDO DE LISTA Y BOTONES DE BORRADO INDIVIDUAL ---

const mostrarLista = async (ctx) => {
  try {
    const { data, error } = await supabase
      .from("shopping_list")
      .select("*")
      .order("id", { ascending: true });

    if (error) return ctx.reply("❌ Error al consultar la base de datos.");
    if (!data || data.length === 0)
      return ctx.reply("🛒 La lista de la compra está vacía.");

    // IMPORTANTE: Ahora el callback es 'preguntar_borrar_'
    const botones = data.map((item, index) => [
      Markup.button.callback(
        `${index + 1}. ${item.item_name}`,
        //`❌ ${item.item_name}`,
        `preguntar_borrar_${item.id}`,
      ),
    ]);

    await ctx.reply("📝 *La lista de la compra:*", {
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard(botones),
    });
  } catch (e) {
    console.error(e);
    ctx.reply("⚠️ Error interno al crear la lista.");
  }
};

// Nueva función: Muestra los botones de SI/NO para un producto específico
const pedirConfirmacionIndividual = async (ctx) => {
  const itemId = ctx.match[1];

  // Consultamos el nombre para que la pregunta sea clara
  const { data } = await supabase
    .from("shopping_list")
    .select("item_name")
    .eq("id", itemId)
    .single();

  if (!data) return ctx.answerCbQuery("⚠️ El producto ya no existe.");

  ctx.editMessageText(`❓ ¿Seguro que quieres borrar *${data.item_name}*?`, {
    parse_mode: "Markdown",
    ...Markup.inlineKeyboard([
      [
        Markup.button.callback("✅ Sí, borrar", `ejecutar_borrado_${itemId}`),
        Markup.button.callback("❌ No, mantener", "cancelar_borrado_indiv"),
      ],
    ]),
  });
};

// Función que finalmente borra el producto
const ejecutarBorradoIndividual = async (ctx) => {
  const itemId = ctx.match[1];

  const { data, error } = await supabase
    .from("shopping_list")
    .delete()
    .eq("id", itemId)
    .select();

  if (error) return ctx.answerCbQuery("❌ Error al borrar.");

  ctx.answerCbQuery("🗑️ Producto eliminado.");

  // Tras borrar, volvemos a mostrar la lista actualizada automáticamente
  return mostrarLista(ctx);
};

// Si el usuario cancela, simplemente volvemos a mostrar la lista
const cancelarBorradoIndividual = (ctx) => {
  ctx.answerCbQuery("Acción cancelada");
  return mostrarLista(ctx);
};

const borrarConBoton = async (ctx) => {
  const itemId = ctx.match[1];
  const { data: deletedData, error: deleteError } = await supabase
    .from("shopping_list")
    .delete()
    .eq("id", itemId)
    .select();

  if (deleteError)
    return ctx.answerCbQuery("❌ Error al borrar el producto.", {
      show_alert: true,
    });

  if (deletedData && deletedData.length > 0) {
    ctx.answerCbQuery(`🗑️ ${deletedData[0].item_name} eliminado.`);
  } else {
    ctx.answerCbQuery("⚠️ El producto ya no existe.");
  }

  const { data: newList, error: fetchError } = await supabase
    .from("shopping_list")
    .select("*")
    .order("id", { ascending: true });
  if (fetchError) return;

  if (newList.length === 0)
    return ctx.editMessageText("🛒 La lista de la compra ha quedado vacía.");

  const nuevosBotones = newList.map((item) => [
    Markup.button.callback(`❌ ${item.item_name}`, `borrar_${item.id}`),
  ]);

  ctx.editMessageText(
    "📝 *Tu lista de la compra:*\n(Pulsa un producto para eliminarlo)",
    {
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard(nuevosBotones),
    },
  );
};

const añadirProducto = async (ctx) => {
  const producto = ctx.message.text.split(" ").slice(1).join(" ");
  if (!producto)
    return ctx.reply("⚠️ Dime qué quieres añadir. Ejemplo: /add manzanas");

  const { error } = await supabase
    .from("shopping_list")
    .insert([{ item_name: producto, added_by: ctx.from.first_name }]);

  if (error) return ctx.reply("❌ Hubo un error al guardar el producto.");

  // 1. Enviamos un pequeño mensaje de confirmación
  await ctx.reply(`✅ *${producto}* añadido.`, { parse_mode: "Markdown" });

  // 2. Llamamos a la función mostrarLista para que imprima la botonera actualizada
  return mostrarLista(ctx);
};

// --- LIMPIEZA MASIVA DE LA LISTA ---

const confirmarLimpiar = (ctx) => {
  ctx.reply(
    "⚠️ ¿Estás totalmente seguro de que quieres vaciar la lista?",
    Markup.inlineKeyboard([
      Markup.button.callback("✅ Sí, vaciar lista", "confirmar_limpiar"),
      Markup.button.callback("❌ Cancelar", "cancelar_limpiar"),
    ]),
  );
};

const ejecutarLimpiar = async (ctx) => {
  const { error } = await supabase.from("shopping_list").delete().gt("id", 0);
  if (error)
    return ctx.editMessageText("❌ Hubo un error al intentar vaciar la lista.");
  ctx.editMessageText("🧹 La lista de la compra ha sido vaciada por completo.");
};

const cancelarLimpiar = (ctx) => {
  ctx.editMessageText("👍 Acción cancelada. Tu lista sigue intacta.");
};

// Exportamos todas las funciones para poder usarlas en el index.js
module.exports = {
  mostrarAyuda,
  sorpresaNina,
  mostrarLista,
  añadirProducto,
  borrarProductoTexto,
  borrarConBoton,
  confirmarLimpiar,
  ejecutarLimpiar,
  cancelarLimpiar,
  pedirConfirmacionIndividual,
  ejecutarBorradoIndividual,
  cancelarBorradoIndividual,
};
