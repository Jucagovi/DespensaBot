import { useState, useMemo } from 'react';
import { Button } from 'primereact/button';
import { useCarritoContexto } from '../contextos/CarritoContexto.jsx';
import FormularioCrearProducto from './FormularioCrearProducto.jsx';
import BuscadorProductos from './BuscadorProductos.jsx';
import TarjetaProductoDespensa from './TarjetaProductoDespensa.jsx';
import DialogoEditarNombre from './DialogoEditarNombre.jsx';
import DialogoAnadirALista from './DialogoAnadirALista.jsx';
import DialogoBorrarProducto from './DialogoBorrarProducto.jsx';

// se implementa la vista principal para gestionar el catálogo orquestando formulario, búsqueda, tarjetas y modales.
const PestanaHaciendoLista = ({ toastRef }) => {
  const {
    productos,
    agregarProducto,
    eliminarProducto,
    cambiarCompletado,
    cambiarNombreProducto,
    cargando
  } = useCarritoContexto();

  // estado para el filtro de búsqueda de productos en despensa.
  const [filtroTexto, setFiltroTexto] = useState('');

  // estados para el modal de añadir a la lista de compra.
  const [productoParaAnadir, setProductoParaAnadir] = useState(null);
  const [dialogoCantidadVisible, setDialogoCantidadVisible] = useState(false);

  // estados para el modal de edición de nombre del producto.
  const [productoParaEditar, setProductoParaEditar] = useState(null);
  const [dialogoEditarVisible, setDialogoEditarVisible] = useState(false);

  // estados para el modal de confirmación de eliminación definitiva.
  const [productoParaBorrar, setProductoParaBorrar] = useState(null);
  const [dialogoBorrarVisible, setDialogoBorrarVisible] = useState(false);

  // se filtran por inicio de palabra y se ordenan alfabéticamente los productos del catálogo fuera de la lista.
  const productosFueraDeLista = useMemo(() => {
    const textoLimpio = filtroTexto.trim().toLowerCase();
    const textoNormalizado = textoLimpio.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    return [...productos]
      .filter((p) => {
        if (p.listado !== false) return false;
        if (!textoNormalizado) return true;

        const nombreNormalizado = (p.nombre || '')
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .trim();

        // se comprueba si el nombre del producto empieza directamente por el término buscado.
        if (nombreNormalizado.startsWith(textoNormalizado)) {
          return true;
        }

        // se verifica si cada término del filtro coincide con el inicio de alguna de las palabras del producto.
        const terminos = textoNormalizado.split(/\s+/).filter(Boolean);
        const palabras = nombreNormalizado.split(/\s+/).filter(Boolean);

        return terminos.every((termino) =>
          palabras.some((palabra) => palabra.startsWith(termino))
        );
      })
      .sort((a, b) =>
        (a.nombre || '').localeCompare(b.nombre || '', 'es', { sensitivity: 'base' })
      );
  }, [productos, filtroTexto]);

  // se procesa el alta de un nuevo producto verificando duplicados.
  const manejarCrearProducto = async (nombreLimpio) => {
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

  // se abre el popup de añadir a la lista.
  const abrirDialogoAnadir = (producto) => {
    setProductoParaAnadir(producto);
    setDialogoCantidadVisible(true);
  };

  // se confirma la inclusión en la cesta verificando que se haya elegido una tienda.
  const confirmarAnadirALista = async ({ cantidad, tienda }) => {
    if (!productoParaAnadir) return;

    if (!tienda) {
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
      cantidad,
      tienda
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
        detail: `se añadió "${productoParaAnadir.nombre}" (${cantidad}) a la lista para comprar en ${tienda}.`,
        life: 3000
      });
    }

    setProductoParaAnadir(null);
  };

  // se abre el diálogo modal para cambiar el nombre al producto.
  const abrirDialogoEditarNombre = (producto) => {
    setProductoParaEditar(producto);
    setDialogoEditarVisible(true);
  };

  // se confirma la modificación del nombre verificando que no esté duplicado.
  const confirmarEditarNombre = async (nombreLimpio) => {
    if (!productoParaEditar) return;

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
  const solicitarBorradoDefinitivo = (producto) => {
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
      {/* formulario para introducir nuevos productos */}
      <FormularioCrearProducto
        alCrearProducto={manejarCrearProducto}
        cargando={cargando}
      />

      {/* filtro de búsqueda rápida de productos en despensa */}
      <BuscadorProductos
        filtroTexto={filtroTexto}
        alCambiarFiltro={setFiltroTexto}
        alLimpiarFiltro={() => setFiltroTexto('')}
      />

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
            <i
              className={`pi ${filtroTexto.trim() ? 'pi-search' : 'pi-inbox'} text-3xl text-400 mb-2`}
            />
            <p className="text-sm text-600 m-0">
              {filtroTexto.trim()
                ? `no hay productos que coincidan con "${filtroTexto}".`
                : 'no hay productos en la despensa.'}
            </p>
            <p className="text-xs text-400 mt-1 mb-0">
              {filtroTexto.trim()
                ? 'prueba a buscar con otro término o quita el filtro.'
                : 'todos los productos están en la lista o el catálogo se encuentra vacío.'}
            </p>
            {filtroTexto.trim() && (
              <Button
                label="Quitar filtro"
                icon="pi pi-filter-slash"
                outlined
                severity="primary"
                className="mt-3 border-round-lg font-semibold"
                onClick={() => setFiltroTexto('')}
              />
            )}
          </div>
        ) : (
          productosFueraDeLista.map((producto) => (
            <TarjetaProductoDespensa
              key={producto.id}
              producto={producto}
              alPulsar={abrirDialogoAnadir}
              alEditar={abrirDialogoEditarNombre}
              alBorrar={solicitarBorradoDefinitivo}
            />
          ))
        )}
      </div>

      {/* modal para cambiar el nombre del producto */}
      <DialogoEditarNombre
        visible={dialogoEditarVisible}
        producto={productoParaEditar}
        alGuardar={confirmarEditarNombre}
        alCancelar={() => setDialogoEditarVisible(false)}
      />

      {/* modal para añadir a la lista de compra con cantidad y tienda */}
      <DialogoAnadirALista
        visible={dialogoCantidadVisible}
        producto={productoParaAnadir}
        alConfirmar={confirmarAnadirALista}
        alCancelar={() => setDialogoCantidadVisible(false)}
      />

      {/* modal para confirmar la eliminación definitiva */}
      <DialogoBorrarProducto
        visible={dialogoBorrarVisible}
        producto={productoParaBorrar}
        alConfirmar={confirmarBorradoDefinitivo}
        alCancelar={() => setDialogoBorrarVisible(false)}
      />
    </div>
  );
};

export default PestanaHaciendoLista;
