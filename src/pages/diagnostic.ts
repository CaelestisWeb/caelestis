import { movedTo } from '../utils/moved';

/* Déplacé sous /outils/ le 29/07/2026 : les deux outils gratuits (simulateur
   de prix et diagnostic de site) vivent dans un espace commun, distinct des
   pages d'offre. L'ancienne adresse reste indexée et partagée, elle est donc
   redirigée plutôt qu'abandonnée. */
export const prerender = false;
export const ALL = movedTo('/outils/diagnostic');
