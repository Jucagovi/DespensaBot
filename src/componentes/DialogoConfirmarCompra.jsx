import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';

// se implementa el diálogo modal para confirmar si un producto ha sido comprado y retirarlo de la lista.
const DialogoConfirmarCompra = ({ visible, producto, alConfirmar, alCancelar }) => {
  return (
    <Dialog
      header="Eliminar de la lista"
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
            label="Sí, comprado"
            icon="pi pi-check"
            severity="success"
            onClick={alConfirmar}
            autoFocus
            className="border-round-lg"
          />
        </div>
      }
    >
      <p className="m-0 text-base text-700 line-height-3 py-2">
        ¿Has comprado <strong>{producto?.nombre}</strong>?
      </p>
    </Dialog>
  );
};

export default DialogoConfirmarCompra;
