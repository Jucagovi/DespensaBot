import { Tag } from 'primereact/tag';
import { LISTA_TIENDAS } from '../config/tiendas.js';

// se obtiene el logotipo correspondiente al supermercado del producto.
const obtenerLogoTienda = (nombreTienda) => {
  const logoPorDefecto = `${import.meta.env.BASE_URL}tiendas/otro.svg`;
  if (!nombreTienda) return logoPorDefecto;
  const encontrado = LISTA_TIENDAS.find(
    (t) => t.clave.toLowerCase() === nombreTienda.toLowerCase()
  );
  return encontrado ? encontrado.logo : logoPorDefecto;
};

// se representa la tarjeta visual de un producto dentro de la cesta de la compra.
const TarjetaProductoCompra = ({ producto, alPulsar }) => {
  const logoTienda = obtenerLogoTienda(producto.supermercado);

  return (
    <div
      onClick={() => alPulsar(producto)}
      className="tarjeta-producto surface-card p-3 px-3 shadow-1 flex align-items-center justify-content-between gap-3 cursor-pointer border-left-3 border-primary"
      role="button"
      tabIndex={0}
      style={{ minHeight: '64px' }}
    >
      {/* imagen de la tienda y nombre del producto */}
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

      {/* indicador de unidades del producto */}
      <div className="flex align-items-center flex-shrink-0">
        <Tag
          value={`x${producto.cantidad || 1}`}
          severity="info"
          className="font-bold border-round-lg text-sm px-3 py-2"
        />
      </div>
    </div>
  );
};

export default TarjetaProductoCompra;
