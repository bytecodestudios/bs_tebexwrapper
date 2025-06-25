local DISCORD_USERNAME = Config.LogUsername
local DISCORD_AVATAR = Config.LogAvatar
local DiscordWebhooks = {
    admin_logs =  Config.Webhook.admin_logs,
    error_logs = Config.Webhook.error_logs,
    redeem_logs = Config.Webhook.redeem_logs,
    exploit_logs = Config.Webhook.exploit_logs,
    purchase_logs = Config.Webhook.purchase_logs
}

--- Sends a formatted embed message to a specified Discord webhook.
--- @param webhookType string The key from the DiscordWebhooks table (e.g., 'admin_logs').
--- @param title string The title of the embed message.
--- @param message string The main content (description) of the embed.
--- @param color integer The decimal color code for the embed's side border.
function SendToDiscord(webhookType, title, message, color)
    if not Config.DiscordLog then return end
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
