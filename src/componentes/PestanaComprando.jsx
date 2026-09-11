import { useState, useMemo } from "react";
import { Button } from "primereact/button";
import { useCarritoContexto } from "../contextos/CarritoContexto.jsx";
import FiltroTiendas from "./FiltroTiendas.jsx";
import TarjetaProductoCompra from "./TarjetaProductoCompra.jsx";
import DialogoConfirmarCompra from "./DialogoConfirmarCompra.jsx";

// se implementa la vista principal de la pestaña de compra orquestando filtros, listado y diálogo de confirmación.
const PestanaComprando = ({ toastRef }) => {
  const { productos, cambiarCompletado, cargando } = useCarritoContexto();
  const [tiendaFiltro, setTiendaFiltro] = useState(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [dialogoVisible, setDialogoVisible] = useState(false);

  // se filtran los productos activos en la lista de compra.
  const productosEnLista = useMemo(() => {
    return productos.filter((p) => p.listado === true);
  }, [productos]);

  // se aplica el filtro por tienda y se ordena el listado por orden alfabético.
  const productosFiltrados = useMemo(() => {
    const listaBase = tiendaFiltro
      ? productosEnLista.filter(
          (p) =>
            (p.supermercado || "").toLowerCase() === tiendaFiltro.toLowerCase(),
        )
      : productosEnLista;

    // se ordenan los productos alfabéticamente por nombre considerando el idioma español.
    return [...listaBase].sort((a, b) =>
      (a.nombre || "").localeCompare(b.nombre || "", "es", {
        sensitivity: "base",
      }),
    );
  }, [productosEnLista, tiendaFiltro]);

  // se prepara la solicitud de confirmación para retirar un producto de la lista.
  const solicitarRetirada = (producto) => {
    setProductoSeleccionado(producto);
    setDialogoVisible(true);
  };

  // se confirma la retirada cambiando el campo listado a false y limpiando el supermercado.
  const confirmarRetirada = async () => {
    if (!productoSeleccionado) return;

    const respuesta = await cambiarCompletado(productoSeleccionado.id, false);
    setDialogoVisible(false);

    if (respuesta.error) {
      toastRef.current?.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudo actualizar el producto en la base de datos.",
        life: 3000,
      });
    } else {
      toastRef.current?.show({
        severity: "success",
        summary: "Comprado",
        detail: `Has comprado "${productoSeleccionado.nombre}".`,
        life: 3000,
      });
    }

    setProductoSeleccionado(null);
  };

  return (
    <div className='p-3 flex flex-column gap-3'>
      {/* filtro superior con botones de supermercados */}
      <FiltroTiendas
        tiendaSeleccionada={tiendaFiltro}
        alSeleccionarTienda={(tienda) => setTiendaFiltro(tienda)}
        alLimpiarFiltro={() => setTiendaFiltro(null)}
      />

      {/* listado de productos activos o estados de carga y vacío */}
      <div className='flex flex-column gap-2'>
        {cargando && productosEnLista.length === 0 ? (
          <div className='text-center py-5 text-500'>
            <i className='pi pi-spin pi-spinner text-2xl mb-2' />
            <p className='text-sm m-0'>cargando lista de compra...</p>
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div className='surface-card p-5 border-round-xl text-center shadow-1'>
            <i className='pi pi-inbox text-4xl text-400 mb-2' />
            <h3 className='text-base font-semibold text-800 m-0'>
              Sin productos
            </h3>
            <p className='text-xs text-500 mt-1 mb-3'>
              {tiendaFiltro
                ? `no hay productos de ${tiendaFiltro} en la lista de compra.`
                : "no hay productos pendientes en esta selección."}
            </p>
            {tiendaFiltro && (
              <Button
                label='Mostrar todos los productos'
                icon='pi pi-filter-slash'
                outlined
                severity='primary'
                className='p-button-sm border-round-lg'
                onClick={() => setTiendaFiltro(null)}
              />
            )}
          </div>
        ) : (
          productosFiltrados.map((producto) => (
            <TarjetaProductoCompra
              key={producto.id}
              producto={producto}
              alPulsar={solicitarRetirada}
            />
          ))
        )}
      </div>

      {/* diálogo de confirmación de compra */}
      <DialogoConfirmarCompra
        visible={dialogoVisible}
        producto={productoSeleccionado}
        alConfirmar={confirmarRetirada}
        alCancelar={() => setDialogoVisible(false)}
      />
    </div>
  );
};

export default PestanaComprando;
