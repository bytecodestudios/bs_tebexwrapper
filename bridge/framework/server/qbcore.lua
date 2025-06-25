if GetResourceState('qb-core') ~= 'started' then return false end
Debug('^1[Bridge] ^2QBCore framework detected')

local QBCore = exports['qb-core']:GetCoreObject()

function HasPermission(source, permission)
    return QBCore.Functions.HasPermission(source, permission)
end

function GetPlayer(src)
    return QBCore.Functions.GetPlayer(src)
end

function DoesItemExist(itemName)
    return QBCore.Shared.Items[itemName] ~= nil
end

function GeneratePlate()
    local plate = nil
    local isPlateTaken = true
    while isPlateTaken do
        plate = ('%s%s%s%s'):format(
            QBCore.Shared.RandomInt(1),
            QBCore.Shared.RandomStr(2),
            QBCore.Shared.RandomInt(3),
            QBCore.Shared.RandomStr(2)
        ):upper()
        local result = MySQL.scalar.await('SELECT plate FROM player_vehicles WHERE plate = ?', { plate })
        if not result then
            isPlateTaken = false
        end
    end
    return plate
end

function GetVehicleData(vehicleModel)
    if not vehicleModel or type(vehicleModel) ~= 'string' then
        return nil
    end
    return QBCore.Shared.Vehicles[vehicleModel:lower()]
end