import { Button } from 'primereact/button';
import { FILAS_TIENDAS } from '../config/tiendas.js';

// se representa el selector de tiendas en cuadrícula táctil y la barra de estado del filtro activo.
const FiltroTiendas = ({ tiendaSeleccionada, alSeleccionarTienda, alLimpiarFiltro }) => {
  return (
    <div className="surface-card p-2 border-round-xl shadow-1 flex flex-column gap-2">
      {/* filas de botones táctiles con los logotipos de los supermercados */}
      <div className="flex flex-column gap-2 w-full">
        {FILAS_TIENDAS.map((fila, indexFila) => (
          <div
            key={indexFila}
            className="flex align-items-center justify-content-between gap-1 w-full"
            style={{ overflowX: 'hidden' }}
          >
            {fila.map((tienda) => {
              const estaActivo = tiendaSeleccionada === tienda.clave;
              return (
                <button
                  key={tienda.clave}
                  type="button"
                  onClick={() => alSeleccionarTienda(estaActivo ? null : tienda.clave)}
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

      {/* barra informativa con botón para quitar el filtro cuando hay uno activo */}
      {tiendaSeleccionada && (
        <div className="flex align-items-center justify-content-between pt-1 px-1 border-top-1 surface-border">
          <span className="text-xs text-600">
            Viendo: <strong className="text-primary">{tiendaSeleccionada}</strong>
          </span>
          <Button
            label="Quitar filtro"
            icon="pi pi-filter-slash"
            text
            severity="secondary"
            className="p-button-sm text-xs py-1 px-2 border-round-lg"
            onClick={alLimpiarFiltro}
          />
        </div>
      )}
    </div>
  );
};

export default FiltroTiendas;
