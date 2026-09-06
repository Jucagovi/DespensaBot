import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../config/supabase.js';
import { useDatos } from './useDatos.js';

// se define el hook principal del carrito con sincronización en tiempo real.
export const useCarrito = () => {
  const [productos, setProductos] = useState([]);
  const [estadoConexion, setEstadoConexion] = useState('conectando');
  const { cargando, errorComunicacion, consultar, crear, modificar, remover } = useDatos();

  // se cargan inicialmente los productos desde la base de datos.
  const cargarProductosIniciales = useCallback(async () => {
    const respuesta = await consultar();
    if (!respuesta.error && respuesta.datos) {
      setProductos(respuesta.datos);
    }
  }, [consultar]);

  // se gestiona la suscripción en tiempo real a los cambios de la tabla cesta_compra.
  useEffect(() => {
    cargarProductosIniciales();

    const canalCesta = supabase
      .channel('cesta-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'cesta_compra' },
        (payload) => {
          // se gestiona la inserción en tiempo real.
          if (payload.eventType === 'INSERT') {
            setProductos((prev) => {
              const existe = prev.some((item) => item.id === payload.new.id);
              if (existe) {
                return prev.map((item) => (item.id === payload.new.id ? payload.new : item));
              }
              return [...prev, payload.new];
            });
          }

          // se gestiona la actualización en tiempo real.
          if (payload.eventType === 'UPDATE') {
            setProductos((prev) =>
              prev.map((item) => (item.id === payload.new.id ? payload.new : item))
            );
          }

          // se gestiona el borrado en tiempo real.
          if (payload.eventType === 'DELETE') {
            setProductos((prev) => prev.filter((item) => item.id !== payload.old.id));
          }
        }
      )
      .subscribe((status) => {
        // se actualiza el indicador de conexión según el estado recibido.
        if (status === 'SUBSCRIBED') {
          setEstadoConexion('conectado');
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setEstadoConexion('desconectado');
        } else {
          setEstadoConexion('conectando');
        }
      });

    return () => {
      // se desuscribe el canal al desmontar el hook.
      supabase.removeChannel(canalCesta);
    };
  }, [cargarProductosIniciales]);

  // se añade un nuevo producto verificando la existencia previa en la lista.
  const agregarProducto = useCallback(
    async ({ nombre, cantidad = 1, supermercado = null, listado = false }) => {
      const nombreLimpio = nombre.trim();
      const respuesta = await crear({
        nombre: nombreLimpio,
        cantidad: Number(cantidad) || 1,
        supermercado: supermercado,
        listado: listado
      });
      return respuesta;
    },
    [crear]
  );

  // se elimina permanentemente un producto de la base de datos.
  const eliminarProducto = useCallback(
    async (id) => {
      const respuesta = await remover(id);
      return respuesta;
    },
    [remover]
  );

  // se conmuta o actualiza el estado de inclusión en la lista de compra.
  const cambiarCompletado = useCallback(
    async (id, nuevoEstadoListado, nuevaCantidad = null, nuevoSupermercado = null) => {
      const campos = { listado: nuevoEstadoListado };
      if (nuevaCantidad !== null) {
        campos.cantidad = Number(nuevaCantidad);
      }
      if (nuevoEstadoListado === false) {
        // se borra el valor de supermercado al retirarlo de la lista activa.
        campos.supermercado = null;
      } else if (nuevoSupermercado !== null) {
        campos.supermercado = nuevoSupermercado;
      }
      const respuesta = await modificar(id, campos);
      return respuesta;
    },
    [modificar]
  );

  // se modifica el nombre asignado a un producto.
  const cambiarNombreProducto = useCallback(
    async (id, nuevoNombre) => {
      const nombreLimpio = nuevoNombre.trim();
      const respuesta = await modificar(id, { nombre: nombreLimpio });
      return respuesta;
    },
    [modificar]
  );

  return {
    productos,
    cargando,
    errorComunicacion,
    estadoConexion,
    agregarProducto,
    eliminarProducto,
    cambiarCompletado,
    cambiarNombreProducto,
    recargarProductos: cargarProductosIniciales
  };
};

export default useCarrito;
