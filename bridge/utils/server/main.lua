function Debug(a)
    if Config.Debug then
        print(a)
    end
end

function Notify(source, message, type)
    if Config.Notify == 'qb' then
        return  TriggerClientEvent('QBCore:Notify', source, message, type)
    elseif Config.Notify == 'ox' then
        return TriggerClientEvent('ox_lib:notify', source, { description = message, type = type or 'info' })
    end
end
