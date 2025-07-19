#!/bin/bash

set -e

echo "☁️  Cloudflare Setup for San2Stic"
echo "================================="

# Vérifier que les variables d'environnement sont définies
if [ -f ".env.production" ]; then
    source .env.production
else
    echo "❌ Error: .env.production file not found"
    exit 1
fi

if [ -z "$CLOUDFLARE_API_TOKEN" ] || [ -z "$CLOUDFLARE_ZONE_ID" ] || [ -z "$DOMAIN_NAME" ]; then
    echo "❌ Error: Please set CLOUDFLARE_API_TOKEN, CLOUDFLARE_ZONE_ID, and DOMAIN_NAME in .env.production"
    exit 1
fi

# Fonction pour créer un enregistrement DNS
create_dns_record() {
    local record_type=$1
    local record_name=$2
    local record_content=$3
    local proxied=${4:-true}
    
    echo "📝 Creating DNS record: $record_name ($record_type) -> $record_content"
    
    curl -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json" \
        --data "{
            \"type\": \"$record_type\",
            \"name\": \"$record_name\",
            \"content\": \"$record_content\",
            \"proxied\": $proxied,
            \"ttl\": 1
        }" | jq '.'
}

# Fonction pour configurer les paramètres de sécurité Cloudflare
configure_security() {
    echo "🔒 Configuring Cloudflare security settings..."
    
    # Activer le SSL/TLS Full (strict)
    curl -X PATCH "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/settings/ssl" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json" \
        --data '{"value": "full"}' | jq '.'
    
    # Activer Always Use HTTPS
    curl -X PATCH "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/settings/always_use_https" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json" \
        --data '{"value": "on"}' | jq '.'
    
    # Activer HSTS
    curl -X PATCH "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/settings/security_header" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json" \
        --data '{
            "value": {
                "strict_transport_security": {
                    "enabled": true,
                    "max_age": 31536000,
                    "include_subdomains": true,
                    "preload": true
                }
            }
        }' | jq '.'
    
    # Configurer le niveau de sécurité
    curl -X PATCH "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/settings/security_level" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json" \
        --data '{"value": "medium"}' | jq '.'
}

# Fonction pour créer des règles de page
create_page_rules() {
    echo "📄 Creating page rules..."
    
    # Règle pour le streaming (bypass cache)
    curl -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/pagerules" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json" \
        --data "{
            \"targets\": [{
                \"target\": \"url\",
                \"constraint\": {
                    \"operator\": \"matches\",
                    \"value\": \"$DOMAIN_NAME/stream*\"
                }
            }],
            \"actions\": [
                {\"id\": \"cache_level\", \"value\": \"bypass\"},
                {\"id\": \"browser_cache_ttl\", \"value\": 0}
            ],
            \"priority\": 1,
            \"status\": \"active\"
        }" | jq '.'
    
    # Règle pour l'API (bypass cache)
    curl -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/pagerules" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json" \
        --data "{
            \"targets\": [{
                \"target\": \"url\",
                \"constraint\": {
                    \"operator\": \"matches\",
                    \"value\": \"$DOMAIN_NAME/api/*\"
                }
            }],
            \"actions\": [
                {\"id\": \"cache_level\", \"value\": \"bypass\"}
            ],
            \"priority\": 2,
            \"status\": \"active\"
        }" | jq '.'
}

# Fonction pour télécharger les certificats Origin
download_origin_cert() {
    echo "📜 Instructions for Cloudflare Origin Certificate:"
    echo ""
    echo "1. Go to: https://dash.cloudflare.com/$CLOUDFLARE_ZONE_ID/ssl-tls/origin"
    echo "2. Click 'Create Certificate'"
    echo "3. Select 'Let Cloudflare generate a private key and a CSR'"
    echo "4. Add hostnames: $DOMAIN_NAME, *.$DOMAIN_NAME"
    echo "5. Choose 'RSA (2048)' key type"
    echo "6. Set validity to 15 years"
    echo "7. Click 'Create'"
    echo ""
    echo "8. Save the certificate as: ssl/cloudflare-origin.pem"
    echo "9. Save the private key as: ssl/cloudflare-origin.key"
    echo ""
    echo "Make sure to create the ssl/ directory first:"
    echo "mkdir -p ssl"
}

# Menu principal
case "${1:-setup}" in
    "setup")
        echo "🚀 Setting up Cloudflare for $DOMAIN_NAME..."
        echo ""
        echo "Please provide your server IP address:"
        read -p "Server IP: " SERVER_IP
        
        if [ -z "$SERVER_IP" ]; then
            echo "❌ Error: Server IP is required"
            exit 1
        fi
        
        create_dns_record "A" "$DOMAIN_NAME" "$SERVER_IP" true
        create_dns_record "A" "www.$DOMAIN_NAME" "$SERVER_IP" true
        configure_security
        create_page_rules
        download_origin_cert
        ;;
    "dns")
        echo "📝 Creating DNS records..."
        echo "Please provide your server IP address:"
        read -p "Server IP: " SERVER_IP
        
        if [ -z "$SERVER_IP" ]; then
            echo "❌ Error: Server IP is required"
            exit 1
        fi
        
        create_dns_record "A" "$DOMAIN_NAME" "$SERVER_IP" true
        create_dns_record "A" "www.$DOMAIN_NAME" "$SERVER_IP" true
        ;;
    "security")
        configure_security
        ;;
    "rules")
        create_page_rules
        ;;
    "cert")
        download_origin_cert
        ;;
    "tunnel")
        if [ -z "$CLOUDFLARE_TUNNEL_TOKEN" ]; then
            echo "❌ Error: CLOUDFLARE_TUNNEL_TOKEN not set in .env.production"
            echo ""
            echo "To create a Cloudflare Tunnel:"
            echo "1. Go to: https://dash.cloudflare.com/$CLOUDFLARE_ZONE_ID/access/tunnels"
            echo "2. Click 'Create a tunnel'"
            echo "3. Choose 'Cloudflared'"
            echo "4. Name your tunnel (e.g., 'san2stic')"
            echo "5. Copy the token and add it to .env.production as CLOUDFLARE_TUNNEL_TOKEN"
            exit 1
        fi
        
        echo "✅ Cloudflare Tunnel token is configured"
        echo "The tunnel will be started automatically with docker-compose"
        ;;
    *)
        echo "Usage: $0 {setup|dns|security|rules|cert|tunnel}"
        echo ""
        echo "Commands:"
        echo "  setup    - Complete Cloudflare setup"
        echo "  dns      - Create DNS records only"
        echo "  security - Configure security settings only"
        echo "  rules    - Create page rules only"
        echo "  cert     - Show Origin certificate instructions"
        echo "  tunnel   - Check tunnel configuration"
        exit 1
        ;;
esac

echo ""
echo "✅ Cloudflare configuration completed!"