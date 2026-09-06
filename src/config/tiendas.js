const BASE = import.meta.env.BASE_URL;

// se define la lista de comercios con sus logotipos y orden prioritario.
export const LISTA_TIENDAS = [
  { clave: 'Aldi', nombre: 'Aldi', logo: `${BASE}tiendas/aldi.svg` },
  { clave: 'Hiperber', nombre: 'Hiperber', logo: `${BASE}tiendas/hiperber.jpg` },
  { clave: 'Mercadona', nombre: 'Mercadona', logo: `${BASE}tiendas/mercadona.png` },
  { clave: 'Carrefour', nombre: 'Carrefour', logo: `${BASE}tiendas/carrefour.svg` },
  { clave: 'Consum', nombre: 'Consum', logo: `${BASE}tiendas/consum.png` },
  { clave: 'Otro', nombre: 'Otro', logo: `${BASE}tiendas/otro.svg` }
];

export default LISTA_TIENDAS;
