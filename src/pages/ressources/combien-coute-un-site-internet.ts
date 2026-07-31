import { movedTo } from '../../utils/moved';

/* Renommée le 30/07/2026 : "tarifs" est plus intuitif à lire dans une URL
   qu'une question longue, pour un lecteur qui cherche à s'orienter dans le
   menu ou dans une barre d'adresse. Le contenu ne change pas, seule
   l'adresse change ; l'ancienne reste indexée, elle est donc redirigée. */
export const prerender = false;
export const ALL = movedTo('/ressources/tarifs');
