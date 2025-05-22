#!/bin/sh
# Script d'entrée pour substituer les variables d'environnement dans icecast.xml
# et ensuite démarrer le serveur Icecast.

# Chemin vers le fichier de configuration d'Icecast
CONFIG_FILE="/etc/icecast2/icecast.xml"

# Vérifier si les variables d'environnement sont définies, sinon utiliser des valeurs par défaut (optionnel)
# Ceci est déjà géré par ENV dans le Dockerfile, mais une double vérification peut être utile.
: "${ICECAST_SOURCE_PASSWORD:=default_source_password}"
: "${ICECAST_RELAY_PASSWORD:=default_relay_password}"
: "${ICECAST_ADMIN_USER:=admin}"
: "${ICECAST_ADMIN_PASSWORD:=default_admin_password}"

# Créer une copie temporaire pour éviter les problèmes avec sed -i sur certains systèmes/images
TEMP_CONFIG_FILE=$(mktemp)
cp "$CONFIG_FILE" "$TEMP_CONFIG_FILE"

# Effectuer les substitutions
# sed utilise ici des délimiteurs | pour éviter les conflits si les mots de passe contiennent des /
sed -i "s|%%ICECAST_SOURCE_PASSWORD%%|$ICECAST_SOURCE_PASSWORD|g" "$TEMP_CONFIG_FILE"
sed -i "s|%%ICECAST_RELAY_PASSWORD%%|$ICECAST_RELAY_PASSWORD|g" "$TEMP_CONFIG_FILE"
sed -i "s|%%ICECAST_ADMIN_USER%%|$ICECAST_ADMIN_USER|g" "$TEMP_CONFIG_FILE"
sed -i "s|%%ICECAST_ADMIN_PASSWORD%%|$ICECAST_ADMIN_PASSWORD|g" "$TEMP_CONFIG_FILE"

# Remplacer le fichier de configuration original par celui modifié
mv "$TEMP_CONFIG_FILE" "$CONFIG_FILE"

# Afficher un message indiquant que la configuration est prête (optionnel, pour le débogage)
echo "Icecast configuration updated with environment variables."
echo "Starting Icecast server..."

# Exécuter la commande passée en argument (CMD du Dockerfile)
# Cela permet de démarrer Icecast avec la configuration mise à jour.
exec "$@"