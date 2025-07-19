<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:output method="html" encoding="UTF-8" />
<xsl:template match="/icestats">
<html>
<head>
    <title>San2Stic Icecast Admin</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1000px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        h1 { color: #333; text-align: center; }
        .admin-section { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 10px 0; border: 1px solid #ffeaa7; }
        .source { background: #f0f8ff; padding: 10px; margin: 10px 0; border-left: 4px solid #007acc; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; }
        .stat { background: #f9f9f9; padding: 10px; border-radius: 5px; }
        .stat strong { color: #555; }
        .action-btn { background: #007acc; color: white; padding: 5px 10px; border: none; border-radius: 3px; cursor: pointer; margin: 2px; }
        .action-btn:hover { background: #005a9e; }
        .danger-btn { background: #dc3545; }
        .danger-btn:hover { background: #c82333; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔧 San2Stic Icecast Admin Panel</h1>
        
        <div class="admin-section">
            <h2>⚠️ Administrative Access</h2>
            <p>This is the administrative interface for the San2Stic Icecast server. Use with caution.</p>
        </div>

        <div class="admin-section">
            <h2>Server Information</h2>
            <div class="stats">
                <div class="stat"><strong>Server:</strong> <xsl:value-of select="server_id" /></div>
                <div class="stat"><strong>Host:</strong> <xsl:value-of select="host" /></div>
                <div class="stat"><strong>Location:</strong> <xsl:value-of select="location" /></div>
                <div class="stat"><strong>Admin:</strong> <xsl:value-of select="admin" /></div>
                <div class="stat"><strong>Current Listeners:</strong> <xsl:value-of select="listeners" /></div>
                <div class="stat"><strong>Peak Listeners:</strong> <xsl:value-of select="listener_peak" /></div>
                <div class="stat"><strong>Sources:</strong> <xsl:value-of select="sources" /></div>
                <div class="stat"><strong>Client Connections:</strong> <xsl:value-of select="client_connections" /></div>
            </div>
        </div>

        <xsl:if test="source">
            <div class="admin-section">
                <h2>Source Management</h2>
                <xsl:for-each select="source">
                    <div class="source">
                        <h3>Mount: <xsl:value-of select="@mount" /></h3>
                        <div class="stats">
                            <div class="stat"><strong>Listeners:</strong> <xsl:value-of select="listeners" /></div>
                            <div class="stat"><strong>Type:</strong> <xsl:value-of select="server_type" /></div>
                            <div class="stat"><strong>Name:</strong> <xsl:value-of select="server_name" /></div>
                            <div class="stat"><strong>Bitrate:</strong> <xsl:value-of select="bitrate" /> kbps</div>
                            <div class="stat"><strong>Connected:</strong> <xsl:value-of select="stream_start" /></div>
                            <xsl:if test="title">
                                <div class="stat"><strong>Current Track:</strong> <xsl:value-of select="title" /></div>
                            </xsl:if>
                        </div>
                        <div style="margin-top: 10px;">
                            <button class="action-btn" onclick="window.open('/admin/metadata?mount={@mount}', '_blank')">Update Metadata</button>
                            <button class="action-btn" onclick="window.open('/admin/listclients?mount={@mount}', '_blank')">List Clients</button>
                            <button class="action-btn danger-btn" onclick="if(confirm('Kill source {@mount}?')) window.open('/admin/killsource?mount={@mount}', '_blank')">Kill Source</button>
                        </div>
                    </div>
                </xsl:for-each>
            </div>
        </xsl:if>

        <div class="admin-section">
            <h2>Quick Actions</h2>
            <button class="action-btn" onclick="window.open('/admin/stats', '_blank')">View Stats</button>
            <button class="action-btn" onclick="window.open('/admin/listmounts', '_blank')">List Mounts</button>
            <button class="action-btn" onclick="window.location.reload()">Refresh</button>
        </div>

        <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
            San2Stic Icecast Admin - Generated at: <script>document.write(new Date().toLocaleString());</script>
        </div>
    </div>
</body>
</html>
</xsl:template>
</xsl:stylesheet>