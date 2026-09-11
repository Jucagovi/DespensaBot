import { Button } from 'primereact/button';

// se representa la tarjeta individual de un producto del catálogo fuera de la lista.
const TarjetaProductoDespensa = ({ producto, alPulsar, alEditar, alBorrar }) => {
  return (
    <div
      onClick={() => alPulsar(producto)}
      className="tarjeta-producto surface-card p-3 px-3 shadow-1 flex align-items-center justify-content-between cursor-pointer border-left-3 border-300 gap-2"
      role="button"
      tabIndex={0}
      style={{ minHeight: '64px' }}
    >
      <span
        className="font-semibold text-800 white-space-nowrap overflow-hidden text-overflow-ellipsis flex-1 pr-2 min-w-0"
        style={{ fontSize: '1.15rem' }}
        title={producto.nombre}
      >
        {producto.nombre}
      </span>

      {/* acciones del producto en despensa: cambiar nombre, añadir a cesta y borrar */}
      <div className="flex align-items-center gap-2 flex-shrink-0">
        <Button
          icon="pi pi-pencil"
          rounded
          text
          severity="secondary"
          aria-label="Cambiar nombre"
          className="boton-accion-despensa"
          onClick={(e) => {
            e.stopPropagation();
            alEditar(producto);
          }}
          tooltip="Cambiar nombre"
          tooltipOptions={{ position: 'left' }}
        />
        <Button
          icon="pi pi-shopping-cart"
          rounded
          text
          severity="info"
          aria-label="Añadir a lista"
          className="boton-accion-despensa"
          onClick={(e) => {
            e.stopPropagation();
            alPulsar(producto);
          }}
          tooltip="Añadir a lista"
          tooltipOptions={{ position: 'left' }}
        />
        <Button
          icon="pi pi-trash"
          rounded
          text
          severity="danger"
          aria-label="Borrar producto"
          className="boton-accion-despensa"
          onClick={(e) => {
            e.stopPropagation();
            alBorrar(producto);
          }}
          tooltip="Borrar permanentemente"
          tooltipOptions={{ position: 'left' }}
        />
      </div>
    </div>
  );
};

export default TarjetaProductoDespensa;
