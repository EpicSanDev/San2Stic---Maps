<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:output method="html" encoding="UTF-8" />
<xsl:template match="/icestats">
<html>
<head>
    <title>San2Stic Icecast Server Status</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        h1 { color: #333; text-align: center; }
        .info { background: #e8f4fd; padding: 15px; border-radius: 5px; margin: 10px 0; }
        .source { background: #f0f8ff; padding: 10px; margin: 10px 0; border-left: 4px solid #007acc; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; }
        .stat { background: #f9f9f9; padding: 10px; border-radius: 5px; }
        .stat strong { color: #555; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎵 San2Stic Icecast Server</h1>
        
        <div class="info">
            <h2>Server Information</h2>
            <div class="stats">
                <div class="stat"><strong>Server:</strong> <xsl:value-of select="server_id" /></div>
                <div class="stat"><strong>Host:</strong> <xsl:value-of select="host" /></div>
                <div class="stat"><strong>Location:</strong> <xsl:value-of select="location" /></div>
                <div class="stat"><strong>Admin:</strong> <xsl:value-of select="admin" /></div>
            </div>
        </div>

        <div class="info">
            <h2>Server Statistics</h2>
            <div class="stats">
                <div class="stat"><strong>Current Listeners:</strong> <xsl:value-of select="listeners" /></div>
                <div class="stat"><strong>Peak Listeners:</strong> <xsl:value-of select="listener_peak" /></div>
                <div class="stat"><strong>Sources:</strong> <xsl:value-of select="sources" /></div>
                <div class="stat"><strong>Source Connections:</strong> <xsl:value-of select="source_total_connections" /></div>
                <div class="stat"><strong>Client Connections:</strong> <xsl:value-of select="client_connections" /></div>
                <div class="stat"><strong>Stats:</strong> <xsl:value-of select="stats" /></div>
                <div class="stat"><strong>Stats Connections:</strong> <xsl:value-of select="stats_connections" /></div>
            </div>
        </div>

        <xsl:if test="source">
            <div class="info">
                <h2>Active Sources</h2>
                <xsl:for-each select="source">
                    <div class="source">
                        <h3>Mount: <xsl:value-of select="@mount" /></h3>
                        <div class="stats">
                            <div class="stat"><strong>Listeners:</strong> <xsl:value-of select="listeners" /></div>
                            <div class="stat"><strong>Type:</strong> <xsl:value-of select="server_type" /></div>
                            <div class="stat"><strong>Name:</strong> <xsl:value-of select="server_name" /></div>
                            <div class="stat"><strong>Description:</strong> <xsl:value-of select="server_description" /></div>
                            <div class="stat"><strong>Genre:</strong> <xsl:value-of select="genre" /></div>
                            <div class="stat"><strong>Bitrate:</strong> <xsl:value-of select="bitrate" /> kbps</div>
                            <xsl:if test="title">
                                <div class="stat"><strong>Current Track:</strong> <xsl:value-of select="title" /></div>
                            </xsl:if>
                        </div>
                    </div>
                </xsl:for-each>
            </div>
        </xsl:if>

        <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
            Generated at: <script>document.write(new Date().toLocaleString());</script>
        </div>
    </div>
</body>
</html>
</xsl:template>
</xsl:stylesheet>