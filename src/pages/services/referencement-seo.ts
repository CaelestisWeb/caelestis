import { movedTo } from '../../utils/moved';

/* Ancienne URL de la page SEO, encore indexée par Google alors qu'elle
   ne répondait plus (404). Redirigée vers son adresse actuelle.

   Pointe DIRECTEMENT vers la destination finale, jamais vers /referencement-naturel
   qui est lui-même redirigé depuis le 29/07/2026 : une chaîne de redirections
   dilue le signal et ralentit le crawl. */
export const prerender = false;
export const ALL = movedTo('/services/referencement-naturel');
