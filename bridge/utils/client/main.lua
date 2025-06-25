local QBCore = exports['qb-core']:GetCoreObject()

function Debug(a)
    if Config.Debug then
        print(a)
    end
end

function Notify(message, type)
    if Config.Notify == 'qb' then
        return  QBCore.Functions.Notify(message, type)     
    elseif Config.Notify == 'ox' then
        return lib.notify({ description = message, type = type or 'info' })
    end
end

function GiveKeys(plate)
    if Config.Keys == 'qb' then
        TriggerEvent("vehiclekeys:client:SetOwner", plate)
    end
end