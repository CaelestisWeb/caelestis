import { movedTo } from '../utils/moved';

/* Déplacée sous /services/ le 29/07/2026 : les quatre formules et les leviers
   de visibilité vivent désormais dans un silo unique, ce qui rend la
   hiérarchie lisible pour les moteurs comme pour les visiteurs. L'ancienne
   adresse reste indexée, elle est donc redirigée plutôt qu'abandonnée. */
export const prerender = false;
export const ALL = movedTo('/services/site-une-page');
