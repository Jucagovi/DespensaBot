import { supabase } from '../config/supabase.js';

// nombre de la tabla en Supabase según el esquema de la base de datos.
const TABLA_CESTA = 'cesta_compra';

// se obtienen todos los productos almacenados en la base de datos.
export const obtenerProductosServicio = async () => {
  try {
    const { data, error } = await supabase
      .from(TABLA_CESTA)
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('error al consultar productos:', error.message);
      return { error: error.message, status: 400, datos: null };
    }

    return { error: null, status: 200, datos: data };
  } catch (errorCapturado) {
    console.error('excepción inesperada al consultar productos:', errorCapturado.message);
    return { error: errorCapturado.message, status: 500, datos: null };
  }
};

// se inserta un nuevo producto en la base de datos.
export const insertarProductoServicio = async (nuevoProducto) => {
  try {
    const { data, error } = await supabase
      .from(TABLA_CESTA)
      .insert([nuevoProducto])
      .select();

    if (error) {
      console.error('error al insertar producto:', error.message);
      return { error: error.message, status: 400, datos: null };
    }

    return { error: null, status: 201, datos: data ? data[0] : null };
  } catch (errorCapturado) {
    console.error('excepción inesperada al insertar producto:', errorCapturado.message);
    return { error: errorCapturado.message, status: 500, datos: null };
  }
};

// se actualiza un producto existente por su identificador.
export const actualizarProductoServicio = async (id, camposActualizados) => {
  try {
    const { data, error } = await supabase
      .from(TABLA_CESTA)
      .update(camposActualizados)
      .eq('id', id)
      .select();

    if (error) {
      console.error('error al actualizar producto:', error.message);
      return { error: error.message, status: 400, datos: null };
    }

    return { error: null, status: 200, datos: data ? data[0] : null };
  } catch (errorCapturado) {
    console.error('excepción inesperada al actualizar producto:', errorCapturado.message);
    return { error: errorCapturado.message, status: 500, datos: null };
  }
};

// se elimina permanentemente un producto de la base de datos.
export const eliminarProductoServicio = async (id) => {
  try {
    const { error } = await supabase
      .from(TABLA_CESTA)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('error al eliminar producto:', error.message);
      return { error: error.message, status: 400, datos: null };
    }

    return { error: null, status: 200, datos: true };
  } catch (errorCapturado) {
    console.error('excepción inesperada al eliminar producto:', errorCapturado.message);
    return { error: errorCapturado.message, status: 500, datos: null };
  }
};
