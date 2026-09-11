import { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { FILAS_TIENDAS } from '../config/tiendas.js';

// se implementa el diálogo modal para seleccionar cantidad y supermercado al añadir a la lista de compra.
const DialogoAnadirALista = ({ visible, producto, alConfirmar, alCancelar }) => {
  const [cantidad, setCantidad] = useState(1);
  const [tienda, setTienda] = useState(null);

  useEffect(() => {
    if (visible) {
      setCantidad(1);
      setTienda(null);
    }
  }, [visible, producto]);

  const manejarConfirmar = () => {
    alConfirmar({ cantidad, tienda });
  };

  return (
    <Dialog
      header="Añadir a la lista de compra"
      visible={visible}
      onHide={alCancelar}
      className="w-11 max-w-26rem border-round-2xl"
      footer={
        <div className="flex justify-content-end gap-2">
          <Button
            label="Cancelar"
            icon="pi pi-times"
            text
            onClick={alCancelar}
            className="border-round-lg"
          />
          <Button
            label="Añadir a lista"
            icon="pi pi-shopping-cart"
            severity="primary"
            onClick={manejarConfirmar}
            autoFocus
            className="border-round-lg"
          />
        </div>
      }
    >
      <div className="flex flex-column gap-3 pt-1">
        <div className="text-center py-1">
          <span className="text-lg font-bold text-900 block">{producto?.nombre}</span>
        </div>

        {/* selector de cantidad ampliado con botones táctiles */}
        <div className="flex justify-content-center my-2">
          <InputNumber
            id="cantidad-input"
            value={cantidad}
            onValueChange={(e) => setCantidad(e.value || 1)}
            showButtons
            buttonLayout="horizontal"
            step={1}
            min={1}
            max={99}
            incrementButtonIcon="pi pi-plus"
            decrementButtonIcon="pi pi-minus"
            className="selector-cantidad-grande"
          />
        </div>

        {/* selector de tienda en dos filas con logotipos de supermercados */}
        <div className="flex flex-column gap-2">
          {tienda && (
            <div className="text-center">
              <span className="text-primary font-semibold text-xs">{tienda}</span>
            </div>
          )}

          <div className="flex flex-column gap-2 w-full">
            {FILAS_TIENDAS.map((fila, indexFila) => (
              <div
                key={indexFila}
                className="flex align-items-center justify-content-between gap-1 w-full"
                style={{ overflowX: 'hidden' }}
              >
                {fila.map((t) => {
                  const estaSeleccionada = tienda === t.clave;
                  return (
                    <button
                      key={t.clave}
                      type="button"
                      onClick={() => setTienda(t.clave)}
                      title={t.nombre}
                      aria-label={t.nombre}
                      className={`boton-tienda cursor-pointer transition-all transition-duration-150 flex align-items-center justify-content-center p-1 ${
                        estaSeleccionada
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
                        src={t.logo}
                        alt={t.nombre}
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
        </div>
      </div>
    </Dialog>
  );
};

export default DialogoAnadirALista;
