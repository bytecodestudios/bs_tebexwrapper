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
function Notify(message, type)
    if Config.Notify == 'qb' then
        return exports['qb-core']:Notify(message, type)
    elseif Config.Notify == 'ox' then
        return lib.notify({ description = message, type = type or 'info' })
    end
end

---Give Keys Wrapper
---@param plate string
function GiveKeys(plate)
    if Config.Keys == 'qb' then
        TriggerEvent("vehiclekeys:client:SetOwner", plate)
    end
end


function AddTextUI(text, options)
    return lib.showTextUI(text, options)
end

function HideTextUI()
    return lib.hideTextUI()
end