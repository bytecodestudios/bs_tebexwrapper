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
--- @param message string|nil The main content (description) of the embed. Can be nil or an empty string.
--- @param color integer|nil The decimal color code for the embed's side border.
--- @param fields table|nil An array of field objects to include in the embed. e.g., {{name="Field 1", value="Value 1"}, {name="Field 2", value="Value 2"}}
function SendToDiscord(webhookType, title, message, color, fields)
    if not Config.DiscordLog then return end
    Debug("[Discord] Using Discord For Logging")
    local webhookUrl = DiscordWebhooks[webhookType]
    if not webhookUrl or webhookUrl == '' or string.find(webhookUrl, "YOUR_") then
        print(string.format("[Discord] Webhook for '%s' is not configured. Message Title: %s", webhookType, title))
        return
    end
    local embed = {
        ["color"] = color or 3447003,
        ["title"] = "**" .. title .. "**",
        ["footer"] = {
            ["text"] = "Butter Tebexwrapper",
            ["icon_url"] = DISCORD_AVATAR
        },
        ["timestamp"] = os.date("!%Y-%m-%dT%H:%M:%S.000Z")
    }
    if message and message ~= "" then
        embed.description = message
    end
    if fields and #fields > 0 then
        embed.fields = fields
    end
    local payload = {
        username = DISCORD_USERNAME,
        avatar_url = DISCORD_AVATAR,
        embeds = { embed } 
    }
    PerformHttpRequest(webhookUrl, function(err, text, headers)
        if err ~= 204 and err ~= 200 then
            print(string.format("[Discord] Error sending webhook for '%s'. HTTP code: %s. Response: %s", webhookType, err, text))
        end
    end, 'POST', json.encode(payload), { ['Content-Type'] = 'application/json' })
end