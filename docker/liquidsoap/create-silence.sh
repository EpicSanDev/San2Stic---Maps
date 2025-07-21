#!/bin/bash

# Script pour créer un fichier audio de silence pour liquidsoap
# Cela évite l'erreur quand aucun fichier audio n'est disponible

SILENCE_FILE="/var/log/ezstream/silence.mp3"
DURATION=30  # 30 secondes de silence

# Créer le répertoire si nécessaire
mkdir -p "$(dirname "$SILENCE_FILE")"

# Générer un fichier de silence de 30 secondes en MP3
# Utilise ffmpeg si disponible, sinon sox
if command -v ffmpeg >/dev/null 2>&1; then
    echo "Génération du fichier de silence avec ffmpeg..."
    ffmpeg -f lavfi -i anullsrc=channel_layout=stereo:sample_rate=44100 -t $DURATION -c:a mp3 -b:a 128k "$SILENCE_FILE" -y
elif command -v sox >/dev/null 2>&1; then
    echo "Génération du fichier de silence avec sox..."
    sox -n -r 44100 -c 2 "$SILENCE_FILE" trim 0.0 $DURATION
else
    echo "Erreur: ffmpeg ou sox requis pour générer le fichier de silence"
    echo "Création d'un fichier placeholder..."
    touch "$SILENCE_FILE"
fi

echo "Fichier de silence créé: $SILENCE_FILE"