import { useState, useMemo } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import { Dialog } from 'primereact/dialog';
import { useCarritoContexto } from '../contextos/carritocontexto.jsx';
import { LISTA_TIENDAS } from '../config/tiendas.js';

// se implementa la vista para gestionar el catálogo, editar nombres y añadir productos ordenados alfabéticamente.
const PestanaHaciendoLista = ({ toastRef }) => {
  const {
    productos,
    agregarProducto,
    eliminarProducto,
    cambiarCompletado,
    cambiarNombreProducto,
    cargando
  } = useCarritoContexto();

  // estados para el formulario de nuevo producto.
  const [nuevoNombre, setNuevoNombre] = useState('');

  // estados para el modal de añadir a la lista de compra.
  const [productoParaAnadir, setProductoParaAnadir] = useState(null);
  const [cantidadSeleccionada, setCantidadSeleccionada] = useState(1);
  const [tiendaSeleccionada, setTiendaSeleccionada] = useState(null);
  const [dialogoCantidadVisible, setDialogoCantidadVisible] = useState(false);

  // estados para el modal de edición de nombre del producto.
  const [productoParaEditar, setProductoParaEditar] = useState(null);
  const [nombreEditado, setNombreEditado] = useState('');
  const [dialogoEditarVisible, setDialogoEditarVisible] = useState(false);

  // estados para el modal de confirmación de eliminación definitiva.
  const [productoParaBorrar, setProductoParaBorrar] = useState(null);
  const [dialogoBorrarVisible, setDialogoBorrarVisible] = useState(false);

  // se filtran y ordenan alfabéticamente los productos del catálogo fuera de la lista.
  const productosFueraDeLista = useMemo(() => {
    return [...productos]
      .filter((p) => p.listado === false)
      .sort((a, b) =>
        (a.nombre || '').localeCompare(b.nombre || '', 'es', { sensitivity: 'base' })
      );
  }, [productos]);

  // se procesa el alta de un nuevo producto verificando duplicados.
  const manejarCrearProducto = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    const nombreLimpio = nuevoNombre.trim();
    if (!nombreLimpio) {
      toastRef.current?.show({
        severity: 'warn',
        summary: 'Atención',
        detail: 'debe escribir el nombre del producto.',
        life: 3000
      });
      return;
    }

    // se comprueba si el nombre ya existe en el listado de productos.
    const yaExiste = productos.some(
      (p) => p.nombre.trim().toLowerCase() === nombreLimpio.toLowerCase()
    );

    if (yaExiste) {
      toastRef.current?.show({
        severity: 'warn',
        summary: 'Producto duplicado',
        detail: 'el producto ya existe en el listado.',
        life: 3000
      });
      return;
    }

    const respuesta = await agregarProducto({
      nombre: nombreLimpio,
      cantidad: 1,
      supermercado: null,
      listado: false
    });

    if (respuesta.error) {
      toastRef.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'no se pudo guardar el producto en la base de datos.',
        life: 3000
      });
    } else {
      setNuevoNombre('');
      // se abre automáticamente el popup para asignar tienda y cantidad al nuevo producto.
      const productoRecienCreado = respuesta.datos || {
        id: Date.now(),
        nombre: nombreLimpio,
        cantidad: 1,
        supermercado: null,
        listado: false
      };
      abrirDialogoAnadir(productoRecienCreado);
    }
  };

  // se abre el popup de añadir a la lista inicializando cantidad y tienda.
  const abrirDialogoAnadir = (producto) => {
    setProductoParaAnadir(producto);
    setCantidadSeleccionada(1);
    setTiendaSeleccionada(null);
    setDialogoCantidadVisible(true);
  };

  // se confirma la inclusión en la cesta verificando que se haya elegido una tienda.
  const confirmarAnadirALista = async () => {
    if (!productoParaAnadir) return;

    // se valida obligatoriamente la elección de una tienda antes de meter el producto.
    if (!tiendaSeleccionada) {
      toastRef.current?.show({
        severity: 'warn',
        summary: 'Selecciona una tienda',
        detail: 'debes elegir una tienda antes de meter el producto en la cesta.',
        life: 3000
      });
      return;
    }

    const respuesta = await cambiarCompletado(
      productoParaAnadir.id,
      true,
      cantidadSeleccionada,
      tiendaSeleccionada
    );

    setDialogoCantidadVisible(false);

    if (respuesta.error) {
      toastRef.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'no se pudo añadir el producto a la lista.',
        life: 3000
      });
    } else {
      toastRef.current?.show({
        severity: 'success',
        summary: 'Añadido',
        detail: `se añadió "${productoParaAnadir.nombre}" (${cantidadSeleccionada}) a la lista para comprar en ${tiendaSeleccionada}.`,
        life: 3000
      });
    }

    setProductoParaAnadir(null);
    setTiendaSeleccionada(null);
  };

  // se abre el diálogo modal para cambiar el nombre al producto.
  const abrirDialogoEditarNombre = (e, producto) => {
    e.stopPropagation();
    setProductoParaEditar(producto);
    setNombreEditado(producto.nombre);
    setDialogoEditarVisible(true);
  };

  // se confirma la modificación del nombre verificando que no esté duplicado.
  const confirmarEditarNombre = async () => {
    if (!productoParaEditar) return;

    const nombreLimpio = nombreEditado.trim();
    if (!nombreLimpio) {
      toastRef.current?.show({
        severity: 'warn',
        summary: 'Nombre requerido',
        detail: 'el nombre no puede estar vacío.',
        life: 3000
      });
      return;
    }

    // se verifica que no exista otro producto con ese mismo nombre en el catálogo.
    const existeOtro = productos.some(
      (p) =>
        p.id !== productoParaEditar.id &&
        p.nombre.trim().toLowerCase() === nombreLimpio.toLowerCase()
    );

    if (existeOtro) {
      toastRef.current?.show({
        severity: 'warn',
        summary: 'Nombre duplicado',
        detail: 'ya existe otro producto en el catálogo con ese nombre.',
        life: 3000
      });
      return;
    }

    const respuesta = await cambiarNombreProducto(productoParaEditar.id, nombreLimpio);
    setDialogoEditarVisible(false);

    if (respuesta.error) {
      toastRef.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'no se pudo cambiar el nombre del producto.',
        life: 3000
      });
    } else {
      toastRef.current?.show({
        severity: 'success',
        summary: 'Nombre actualizado',
        detail: `se cambió el nombre a "${nombreLimpio}".`,
        life: 3000
      });
    }

    setProductoParaEditar(null);
  };

  // se abre el diálogo de confirmación para eliminar definitivamente el producto.
  const solicitarBorradoDefinitivo = (e, producto) => {
    e.stopPropagation();
    setProductoParaBorrar(producto);
    setDialogoBorrarVisible(true);
  };

  // se ejecuta el borrado permanente en la base de datos.
  const confirmarBorradoDefinitivo = async () => {
    if (!productoParaBorrar) return;

    const respuesta = await eliminarProducto(productoParaBorrar.id);
    setDialogoBorrarVisible(false);

    if (respuesta.error) {
      toastRef.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'no se pudo borrar el producto.',
        life: 3000
      });
    } else {
      toastRef.current?.show({
        severity: 'info',
        summary: 'Eliminado',
        detail: `se eliminó "${productoParaBorrar.nombre}" definitivamente.`,
        life: 3000
      });
    }

    setProductoParaBorrar(null);
  };

  return (
    <div className="p-3 flex flex-column gap-3">
      {/* formulario para introducir nuevos productos con bordes redondeados */}
      <div className="surface-card p-3 border-round-xl shadow-1">
        <h2 className="text-sm font-semibold text-900 m-0 mb-3 flex align-items-center gap-2">
          <i className="pi pi-plus-circle text-primary" />
          Introducir producto a la lista
        </h2>
        <form onSubmit={manejarCrearProducto} className="flex gap-2">
          <div className="p-inputgroup flex-1">
            <span className="p-inputgroup-addon border-round-left-lg">
              <i className="pi pi-box" />
            </span>
            <InputText
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
              placeholder="Nombre del producto (ej: Leche)"
              className="text-sm w-full border-round-right-lg"
              disabled={cargando}
            />
          </div>
          <Button
            type="submit"
            label="Añadir"
            icon="pi pi-plus"
            loading={cargando}
            className="p-button-primary p-button-sm flex-shrink-0 border-round-lg"
          />
        </form>
      </div>

      {/* listado de productos en despensa ordenados alfabéticamente */}
      <div className="flex flex-column gap-2">
        <div className="flex align-items-center justify-content-between px-1">
          <h2 className="text-xs font-bold text-600 uppercase m-0">
            Productos en despensa ({productosFueraDeLista.length})
          </h2>
          <span className="text-xs text-500">orden alfabético</span>
        </div>

        {productosFueraDeLista.length === 0 ? (
          <div className="surface-card p-4 border-round-xl text-center shadow-1">
            <i className="pi pi-inbox text-3xl text-400 mb-2" />
            <p className="text-sm text-600 m-0">no hay productos en la despensa.</p>
            <p className="text-xs text-400 mt-1 mb-0">
              todos los productos están en la lista o el catálogo se encuentra vacío.
            </p>
          </div>
        ) : (
          productosFueraDeLista.map((producto) => (
            <div
              key={producto.id}
              onClick={() => abrirDialogoAnadir(producto)}
              className="tarjeta-producto surface-card p-2 px-3 shadow-1 flex align-items-center justify-content-between cursor-pointer border-left-3 border-300"
              role="button"
              tabIndex={0}
              style={{ minHeight: '48px' }}
            >
              <span className="font-semibold text-800 text-sm white-space-nowrap overflow-hidden text-overflow-ellipsis flex-1 pr-2">
                {producto.nombre}
              </span>

              {/* acciones del producto en despensa: cambiar nombre, añadir a cesta y borrar */}
              <div className="flex align-items-center gap-1 flex-shrink-0">
                <Button
                  icon="pi pi-pencil"
                  rounded
                  text
                  severity="secondary"
                  aria-label="Cambiar nombre"
                  className="p-button-sm"
                  onClick={(e) => abrirDialogoEditarNombre(e, producto)}
                  tooltip="Cambiar nombre"
                  tooltipOptions={{ position: 'left' }}
                />
                <Button
                  icon="pi pi-shopping-cart"
                  rounded
                  text
                  severity="info"
                  aria-label="Añadir a lista"
                  className="p-button-sm"
                  tooltip="Añadir a lista"
                  tooltipOptions={{ position: 'left' }}
                />
                <Button
                  icon="pi pi-trash"
                  rounded
                  text
                  severity="danger"
                  aria-label="Borrar producto"
                  className="p-button-sm"
                  onClick={(e) => solicitarBorradoDefinitivo(e, producto)}
                  tooltip="Borrar permanentemente"
                  tooltipOptions={{ position: 'left' }}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* popup para cambiar el nombre del producto */}
      <Dialog
        header="Cambiar nombre del producto"
        visible={dialogoEditarVisible}
        onHide={() => setDialogoEditarVisible(false)}
        className="w-11 max-w-24rem border-round-2xl"
        footer={
          <div className="flex justify-content-end gap-2">
            <Button
              label="Cancelar"
              icon="pi pi-times"
              text
              onClick={() => setDialogoEditarVisible(false)}
              className="p-button-sm border-round-lg"
            />
            <Button
              label="Guardar"
              icon="pi pi-check"
              severity="primary"
              onClick={confirmarEditarNombre}
              autoFocus
              className="p-button-sm border-round-lg"
            />
          </div>
        }
      >
        <div className="flex flex-column gap-2 pt-2">
          <label htmlFor="nombre-editado-input" className="text-xs font-semibold text-600">
            Nuevo nombre:
          </label>
          <InputText
            id="nombre-editado-input"
            value={nombreEditado}
            onChange={(e) => setNombreEditado(e.target.value)}
            placeholder="Nombre del producto"
            className="w-full text-sm border-round-lg"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                confirmarEditarNombre();
              }
            }}
          />
        </div>
      </Dialog>

      {/* popup añadir a la lista de compra */}
      <Dialog
        header="Añadir a la lista de compra"
        visible={dialogoCantidadVisible}
        onHide={() => {
          setDialogoCantidadVisible(false);
          setTiendaSeleccionada(null);
        }}
        className="w-11 max-w-26rem border-round-2xl"
        footer={
          <div className="flex justify-content-end gap-2">
            <Button
              label="Cancelar"
              icon="pi pi-times"
              text
              onClick={() => {
                setDialogoCantidadVisible(false);
                setTiendaSeleccionada(null);
              }}
              className="p-button-sm border-round-lg"
            />
            <Button
              label="Añadir a lista"
              icon="pi pi-shopping-cart"
              severity="primary"
              onClick={confirmarAnadirALista}
              autoFocus
              className="p-button-sm border-round-lg"
            />
          </div>
        }
      >
        <div className="flex flex-column gap-3 pt-1">
          <div className="text-center">
            <span className="text-base font-bold text-900 block">{productoParaAnadir?.nombre}</span>
          </div>

          {/* selector de cantidad */}
          <div>
            <InputNumber
              id="cantidad-input"
              value={cantidadSeleccionada}
              onValueChange={(e) => setCantidadSeleccionada(e.value || 1)}
              showButtons
              buttonLayout="horizontal"
              step={1}
              min={1}
              max={99}
              incrementButtonIcon="pi pi-plus"
              decrementButtonIcon="pi pi-minus"
              className="w-full"
              inputClassName="text-center font-bold text-base"
            />
          </div>

          {/* selector de tienda en una sola fila con logotipos y esquinas redondeadas */}
          <div className="flex flex-column gap-1">
            {tiendaSeleccionada && (
              <div className="text-center">
                <span className="text-primary font-semibold text-xs">{tiendaSeleccionada}</span>
              </div>
            )}

            <div
              className="flex align-items-center justify-content-between gap-1 w-full"
              style={{ overflowX: 'hidden' }}
            >
              {LISTA_TIENDAS.map((tienda) => {
                const estaSeleccionada = tiendaSeleccionada === tienda.clave;
                return (
                  <button
                    key={tienda.clave}
                    type="button"
                    onClick={() => setTiendaSeleccionada(tienda.clave)}
                    title={tienda.nombre}
                    aria-label={tienda.nombre}
                    className={`boton-tienda cursor-pointer transition-all transition-duration-150 flex align-items-center justify-content-center p-1 ${
                      estaSeleccionada
                        ? 'boton-tienda-activo border-2 border-primary shadow-2'
                        : 'boton-tienda-inactivo border-1 surface-border hover:surface-100'
                    }`}
                    style={{
                      flex: '1 1 0',
                      minWidth: 0,
                      height: '46px',
                      outline: 'none'
                    }}
                  >
                    <img
                      src={tienda.logo}
                      alt={tienda.nombre}
                      style={{
                        maxHeight: '26px',
                        maxWidth: '100%',
                        objectFit: 'contain'
                      }}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Dialog>

      {/* diálogo para confirmar la eliminación definitiva */}
      <Dialog
        header="¿Eliminar definitivamente?"
        visible={dialogoBorrarVisible}
        onHide={() => setDialogoBorrarVisible(false)}
        className="w-11 max-w-24rem border-round-2xl"
        footer={
          <div className="flex justify-content-end gap-2">
            <Button
              label="Cancelar"
              icon="pi pi-times"
              text
              onClick={() => setDialogoBorrarVisible(false)}
              className="p-button-sm border-round-lg"
            />
            <Button
              label="Eliminar"
              icon="pi pi-trash"
              severity="danger"
              onClick={confirmarBorradoDefinitivo}
              autoFocus
              className="p-button-sm border-round-lg"
            />
          </div>
        }
      >
        <p className="m-0 text-sm text-700">
          ¿Seguro que deseas eliminar <strong>{productoParaBorrar?.nombre}</strong> de forma
          definitiva? Esta acción no se puede deshacer.
        </p>
      </Dialog>
    </div>
  );
};

export default PestanaHaciendoLista;
