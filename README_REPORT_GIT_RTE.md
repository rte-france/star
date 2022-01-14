#STAR- Copie interne

Ce repo constitue la copie interne du repository Gitlab public du projet STAR, disponible à cette adresse :
https://gitlab.com/xdev-tech/star

Maintainer : daniel.thirion@rte-france.com

## Mode opératoire pour procéder à la synchronisation :
Le code source de STAR est situé sur Gitlab. Innaccessible depuis une machine RTE derrière le VPN. Nous allons procéder à sa récupération et à son push côté Git RTE.

Prérequis :

- Avoir git installé sur sa machine
- Posséder un compte gitlab et avoir configuré l'authent en SSH : https://docs.gitlab.com/ee/ssh/
- Ne pas être derrière le proxy RTE (se connecter en partage de connexion via son téléphone si on est sur site)

A faire une fois :
1) Cloner le repo git public sur sa machine : ```bash git clone https://gitlab.com/xdev-tech/star.git ```
2) Se placer à la racine du répertoire puis ajouter un **git remote** afin que l'on continue à pull depuis le gitlab public, mais qu'on push sur le git rte :  ```git remote add gitRte https://devin-source.rte-france.com/star/star.git```
3) Vérifier que la commande ``` git remote -v``` retourne bien ceci :
```
   gitRte	https://devin-source.rte-france.com/star/star.git (fetch)
   gitRte	https://devin-source.rte-france.com/star/star.git (push)
   origin	git@gitlab.com:xdev-tech/star.git (fetch)
   origin	git@gitlab.com:xdev-tech/star.git (push)
```

Dorénavant, pour maintenir le code à jour il suffira de faire un :
``` git pull origin develop``` pour récupérer les modifications apportées et code, puis 
``` git push gitRte develop``` pour push sur le gitRte