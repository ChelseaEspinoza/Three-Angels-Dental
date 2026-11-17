import { TIPO_CAMBIO_BS_POR_USD } from '../config';

export const bs = (monto: number) =>
  `Bs. ${monto.toLocaleString('es-BO', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

export const aUsd = (montoBs: number) => Math.round((montoBs / TIPO_CAMBIO_BS_POR_USD) * 100) / 100;

export const usd = (montoBs: number) => `≈ US$ ${aUsd(montoBs).toFixed(2)}`;

/** Quita tildes y pasa a minúsculas, para buscar "cepillo" y encontrar "Cépillo". */
export const normalizar = (texto: string) =>
  texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Abre WhatsApp con un mensaje ya escrito. */
export function abrirWhatsApp(numero: string, mensaje: string) {
  window.open(`https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`, '_blank', 'noopener');
}
