-- =================================================================
--                        DISCORD WEBHOOK CONFIG
-- =================================================================

local DISCORD_USERNAME = "ByteCode Tebexwrapper"
local DISCORD_AVATAR = "https://cdn.discordapp.com/attachments/1018410488683560970/1342208293971693732/bytecode-1.png?ex=685cef22&is=685b9da2&hm=1b1dcb48d68663459184aca52d436788007dc6fb90a796e4ae62544e492e70c2&"
local DiscordWebhooks = {
    admin_logs =  ServerConfig.Webhook.admin_logs,
    error_logs = ServerConfig.Webhook.error_logs,
    redeem_logs = ServerConfig.Webhook.redeem_logs,
    exploit_logs = ServerConfig.Webhook.exploit_logs,
    purchase_logs = ServerConfig.Webhook.purchase_logs
}

--- Sends a formatted embed message to a specified Discord webhook.
--- @param webhookType string The key from the DiscordWebhooks table (e.g., 'admin_logs').
--- @param title string The title of the embed message.
--- @param message string The main content (description) of the embed.
--- @param color integer The decimal color code for the embed's side border.
function SendToDiscord(webhookType, title, message, color)
    if not ServerConfig.Discord then
        return
    end
    Debug("[Discord] Using Discord For Logging")
    local webhookUrl = DiscordWebhooks[webhookType]
    if not webhookUrl or webhookUrl == '' or string.find(webhookUrl, "YOUR_") then
        print(string.format("[Discord] Webhook for '%s' is not configured. Message: %s", webhookType, message))
        return
    end
    local embeds = {
        {
            ["color"] = color or 3447003, 
            ["title"] = "**" .. title .. "**",
            ["description"] = message,
            ["footer"] = {
                ["text"] = "Butter Tebexwrapper", 
                ["icon_url"] = DISCORD_AVATAR
            },
            ["timestamp"] = os.date("!%Y-%m-%dT%H:%M:%S.000Z")
        }
    }
    local payload = {
        username = DISCORD_USERNAME,
        avatar_url = DISCORD_AVATAR, 
        embeds = embeds
    }
    PerformHttpRequest(webhookUrl, function(err, text, headers)
        if err ~= 204 and err ~= 200 then
            print(string.format("[Discord] Error sending webhook for '%s'. HTTP code: %s. Response: %s", webhookType, err, text))
        end
    end, 'POST', json.encode(payload), { ['Content-Type'] = 'application/json' })
end
