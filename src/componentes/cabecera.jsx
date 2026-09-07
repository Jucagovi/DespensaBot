import { useLocation, useNavigate } from 'react-router-dom';
import { TabMenu } from 'primereact/tabmenu';
import { Button } from 'primereact/button';
import IndicadorConexion from './indicadorconexion.jsx';
import { useCarritoContexto } from '../contextos/carritocontexto.jsx';
import { useTemaContexto } from '../contextos/temacontexto.jsx';

// se define la cabecera con navegación, conmutador de tema a la derecha e indicador de conexión en tiempo real.
const Cabecera = () => {
  const ubicacion = useLocation();
  const navegar = useNavigate();
  const { productos, estadoConexion } = useCarritoContexto();
  const { esModoOscuro, conmutarTema } = useTemaContexto();

  // se calculan las cantidades para los badges en cada pestaña.
  const cantidadEnCesta = productos.filter((p) => p.listado).length;
  const cantidadFueraCesta = productos.filter((p) => !p.listado).length;

  const pestañas = [
    {
      label: `Comprando (${cantidadEnCesta})`,
      icon: 'pi pi-shopping-cart',
      command: () => navegar('/comprando')
    },
    {
      label: `Haciendo lista (${cantidadFueraCesta})`,
      icon: 'pi pi-list-check',
      command: () => navegar('/haciendo-lista')
    }
  ];

  const indiceActivo = ubicacion.pathname === '/haciendo-lista' ? 1 : 0;

  return (
    <header className="surface-0 shadow-1 sticky top-0 z-5">
      <div className="flex align-items-center justify-content-between px-3 py-2 border-bottom-1 surface-border">
        {/* bloque con icono y título de la aplicación */}
        <div className="flex align-items-center gap-2">
          <i className="pi pi-shopping-bag text-primary text-xl" />
          <h1 className="text-lg font-bold m-0 text-900">DespensaBot</h1>
        </div>

        {/* bloque derecho con botón de cambio de tema e indicador en tiempo real */}
        <div className="flex align-items-center gap-2">
          <Button
            icon={esModoOscuro ? 'pi pi-sun' : 'pi pi-moon'}
            rounded
            text
            severity={esModoOscuro ? 'warning' : 'secondary'}
            onClick={conmutarTema}
            aria-label="Cambiar tema oscuro o claro"
            className="p-button-sm"
            tooltip={esModoOscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            tooltipOptions={{ position: 'bottom' }}
          />
          <IndicadorConexion estado={estadoConexion} />
        </div>
      </div>

      <TabMenu
        model={pestañas}
        activeIndex={indiceActivo}
        onTabChange={(e) => pestañas[e.index].command()}
        className="w-full pestanas-grandes"
      />
    </header>
  );
};

export default Cabecera;
