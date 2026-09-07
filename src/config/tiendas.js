const BASE = import.meta.env.BASE_URL;

// primera fila de comercios
export const FILA_TIENDAS_1 = [
  { clave: 'Aldi', nombre: 'Aldi', logo: `${BASE}tiendas/aldi.svg` },
  { clave: 'Hiperber', nombre: 'Hiperber', logo: `${BASE}tiendas/hiperber.jpg` },
  { clave: 'Mercadona', nombre: 'Mercadona', logo: `${BASE}tiendas/mercadona.png` },
  { clave: 'Carrefour', nombre: 'Carrefour', logo: `${BASE}tiendas/carrefour.svg` },
  { clave: 'Consum', nombre: 'Consum', logo: `${BASE}tiendas/consum.png` }
];

// segunda fila de comercios en el orden solicitado: Dia, Hipercor, Lidl, Alcampo (y Otro)
export const FILA_TIENDAS_2 = [
  { clave: 'Dia', nombre: 'Dia', logo: `${BASE}tiendas/dia.svg` },
  { clave: 'Hipercor', nombre: 'Hipercor', logo: `${BASE}tiendas/hipercor.png` },
  { clave: 'Lidl', nombre: 'Lidl', logo: `${BASE}tiendas/lidl.svg` },
  { clave: 'Alcampo', nombre: 'Alcampo', logo: `${BASE}tiendas/alcampo.png` },
  { clave: 'Otro', nombre: 'Otro', logo: `${BASE}tiendas/otro.svg` }
];

export const FILAS_TIENDAS = [FILA_TIENDAS_1, FILA_TIENDAS_2];

// se define la lista de comercios con sus logotipos y orden prioritario.
export const LISTA_TIENDAS = [...FILA_TIENDAS_1, ...FILA_TIENDAS_2];

export default LISTA_TIENDAS;

