---Debug Wrapper
---@param a any
function Debug(a)
    if Config.Debug then
        print(a)
    end
end

---Notification Wrapper
---@param message string
---@param type string
function Notify(source, message, type)
    if Config.Notify == 'qb' then
        TriggerClientEvent('QBCore:Notify', source, message, type)
        return true
    elseif Config.Notify == 'ox' then
        TriggerClientEvent('ox_lib:notify', source, { description = message, type = type or 'info' })
        return true
    end
end
