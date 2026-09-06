import { useState, useCallback } from 'react';
import {
  obtenerProductosServicio,
  insertarProductoServicio,
  actualizarProductoServicio,
  eliminarProductoServicio
} from '../services/cestaservicio.js';

// se define el hook genérico para aislar las operaciones CRUD y el estado de la comunicación.
export const useDatos = () => {
  const [cargando, setCargando] = useState(false);
  const [errorComunicacion, setErrorComunicacion] = useState(null);

  // se gestiona la consulta de los registros hacia el servicio.
  const consultar = useCallback(async () => {
    setCargando(true);
    setErrorComunicacion(null);
    const respuesta = await obtenerProductosServicio();
    if (respuesta.error) {
      setErrorComunicacion(respuesta);
    }
    setCargando(false);
    return respuesta;
  }, []);

  // se gestiona la creación de un nuevo registro.
  const crear = useCallback(async (datosItem) => {
    setCargando(true);
    setErrorComunicacion(null);
    const respuesta = await insertarProductoServicio(datosItem);
    if (respuesta.error) {
      setErrorComunicacion(respuesta);
    }
    setCargando(false);
    return respuesta;
  }, []);

  // se gestiona la modificación de un registro existente.
  const modificar = useCallback(async (id, cambios) => {
    setCargando(true);
    setErrorComunicacion(null);
    const respuesta = await actualizarProductoServicio(id, cambios);
    if (respuesta.error) {
      setErrorComunicacion(respuesta);
    }
    setCargando(false);
    return respuesta;
  }, []);

  // se gestiona la eliminación de un registro.
  const remover = useCallback(async (id) => {
    setCargando(true);
    setErrorComunicacion(null);
    const respuesta = await eliminarProductoServicio(id);
    if (respuesta.error) {
      setErrorComunicacion(respuesta);
    }
    setCargando(false);
    return respuesta;
  }, []);

  return {
    cargando,
    errorComunicacion,
    consultar,
    crear,
    modificar,
    remover
  };
};

export default useDatos;
