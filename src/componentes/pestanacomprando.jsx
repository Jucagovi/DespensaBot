import { useState, useMemo } from 'react';
import { Tag } from 'primereact/tag';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { useCarritoContexto } from '../contextos/carritocontexto.jsx';
import { LISTA_TIENDAS, FILAS_TIENDAS } from '../config/tiendas.js';

// se implementa la vista de la pestaña de compra ordenada alfabéticamente y con esquinas redondeadas.
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
          (p) => (p.supermercado || '').toLowerCase() === tiendaFiltro.toLowerCase()
        )
      : productosEnLista;

    // se ordenan los productos alfabéticamente por nombre considerando el idioma español.
    return [...listaBase].sort((a, b) =>
      (a.nombre || '').localeCompare(b.nombre || '', 'es', { sensitivity: 'base' })
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
        severity: 'error',
        summary: 'Error',
        detail: 'no se pudo actualizar el producto en la base de datos.',
        life: 3000
      });
    } else {
      toastRef.current?.show({
        severity: 'success',
        summary: 'Comprado',
        detail: `se retiró "${productoSeleccionado.nombre}" de la lista y se restableció su tienda.`,
        life: 3000
      });
    }

    setProductoSeleccionado(null);
  };

  // se obtiene el logotipo correspondiente al supermercado del producto.
  const obtenerLogoTienda = (nombreTienda) => {
    const logoPorDefecto = `${import.meta.env.BASE_URL}tiendas/otro.svg`;
    if (!nombreTienda) return logoPorDefecto;
    const encontrado = LISTA_TIENDAS.find(
      (t) => t.clave.toLowerCase() === nombreTienda.toLowerCase()
    );
    return encontrado ? encontrado.logo : logoPorDefecto;
  };

  return (
    <div className="p-3 flex flex-column gap-3">
      {/* filtro superior con botones de tiendas en dos filas y botón para quitar filtros aplicado */}
      <div className="surface-card p-2 border-round-xl shadow-1 flex flex-column gap-2">
        <div className="flex flex-column gap-2 w-full">
          {FILAS_TIENDAS.map((fila, indexFila) => (
            <div
              key={indexFila}
              className="flex align-items-center justify-content-between gap-1 w-full"
              style={{ overflowX: 'hidden' }}
            >
              {fila.map((tienda) => {
                const estaActivo = tiendaFiltro === tienda.clave;
                return (
                  <button
                    key={tienda.clave}
                    type="button"
                    onClick={() => setTiendaFiltro(estaActivo ? null : tienda.clave)}
                    title={tienda.nombre}
                    aria-label={tienda.nombre}
                    className={`boton-tienda cursor-pointer transition-all transition-duration-150 flex align-items-center justify-content-center p-1 ${
                      estaActivo
                        ? 'boton-tienda-activo border-2 border-primary shadow-2'
                        : 'boton-tienda-inactivo border-1 surface-border hover:surface-100'
                    }`}
                    style={{
                      flex: '1 1 0',
                      minWidth: 0,
                      height: '56px',
                      outline: 'none'
                    }}
                  >
                    <img
                      src={tienda.logo}
                      alt={tienda.nombre}
                      className="border-round"
                      style={{
                        maxHeight: '35px',
                        maxWidth: '100%',
                        objectFit: 'contain'
                      }}
                    />
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* botón para quitar los filtros cuando se ha aplicado uno */}
        {tiendaFiltro && (
          <div className="flex align-items-center justify-content-between pt-1 px-1 border-top-1 surface-border">
            <span className="text-xs text-600">
              Viendo: <strong className="text-primary">{tiendaFiltro}</strong>
            </span>
            <Button
              label="Quitar filtro"
              icon="pi pi-filter-slash"
              text
              severity="secondary"
              className="p-button-sm text-xs py-1 px-2 border-round-lg"
              onClick={() => setTiendaFiltro(null)}
            />
          </div>
        )}
      </div>

      {/* listado de productos activos ordenados alfabéticamente con esquinas redondeadas */}
      <div className="flex flex-column gap-2">
        {cargando && productosEnLista.length === 0 ? (
          <div className="text-center py-5 text-500">
            <i className="pi pi-spin pi-spinner text-2xl mb-2" />
            <p className="text-sm m-0">cargando lista de compra...</p>
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div className="surface-card p-5 border-round-xl text-center shadow-1">
            <i className="pi pi-inbox text-4xl text-400 mb-2" />
            <h3 className="text-base font-semibold text-800 m-0">Sin productos</h3>
            <p className="text-xs text-500 mt-1 mb-3">
              {tiendaFiltro
                ? `no hay productos de ${tiendaFiltro} en la lista de compra.`
                : 'no hay productos pendientes en esta selección.'}
            </p>
            {tiendaFiltro && (
              <Button
                label="Mostrar todos los productos"
                icon="pi pi-filter-slash"
                outlined
                severity="primary"
                className="p-button-sm border-round-lg"
                onClick={() => setTiendaFiltro(null)}
              />
            )}
          </div>
        ) : (
          productosFiltrados.map((producto) => {
            const logoTienda = obtenerLogoTienda(producto.supermercado);
            return (
              <div
                key={producto.id}
                onClick={() => solicitarRetirada(producto)}
                className="tarjeta-producto surface-card p-3 px-3 shadow-1 flex align-items-center justify-content-between gap-3 cursor-pointer border-left-3 border-primary"
                role="button"
                tabIndex={0}
                style={{ minHeight: '64px' }}
              >
                {/* imagen de la tienda a la izquierda sin texto y nombre del producto */}
                <div className="flex align-items-center gap-3 flex-1 min-w-0">
                  <img
                    src={logoTienda}
                    alt={producto.supermercado || 'Tienda'}
                    className="border-round flex-shrink-0"
                    style={{
                      width: '38px',
                      height: '38px',
                      objectFit: 'contain',
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      padding: '2px'
                    }}
                  />
                  <span
                    className="font-semibold text-800 white-space-nowrap overflow-hidden text-overflow-ellipsis flex-1 min-w-0"
                    style={{ fontSize: '1.15rem' }}
                    title={producto.nombre}
                  >
                    {producto.nombre}
                  </span>
                </div>

                {/* cantidad en una sola línea (se quita el botón de check verde) */}
                <div className="flex align-items-center flex-shrink-0">
                  <Tag
                    value={`x${producto.cantidad || 1}`}
                    severity="info"
                    className="font-bold border-round-lg text-sm px-3 py-2"
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* diálogo de confirmación para retirar de la lista */}
      <Dialog
        header="¿Eliminar de la lista?"
        visible={dialogoVisible}
        onHide={() => setDialogoVisible(false)}
        className="w-11 max-w-26rem border-round-2xl"
        footer={
          <div className="flex justify-content-end gap-2">
            <Button
              label="Cancelar"
              icon="pi pi-times"
              text
              onClick={() => setDialogoVisible(false)}
              className="p-button-sm border-round-lg"
            />
            <Button
              label="Sí, comprado"
              icon="pi pi-check"
              severity="success"
              onClick={confirmarRetirada}
              autoFocus
              className="p-button-sm border-round-lg"
            />
          </div>
        }
      >
        <p className="m-0 text-sm text-700">
          ¿Deseas retirar <strong>{productoSeleccionado?.nombre}</strong> de la lista de compra?
          Pasará al catálogo y se borrará la tienda para que se vuelva a seleccionar la próxima vez.
        </p>
      </Dialog>
    </div>
  );
};

export default PestanaComprando;
