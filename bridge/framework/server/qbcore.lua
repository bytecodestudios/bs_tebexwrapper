if GetResourceState('qb-core') ~= 'started' then return false end
Debug('^1[Bridge] ^2QBCore framework detected')

local QBCore = exports['qb-core']:GetCoreObject()

---Check permission
---@param source number | integer
---@param permission string
function HasPermission(source, permission)
    return QBCore.Functions.HasPermission(source, permission)
end

---Get Player Data
---@param src number | integer
function GetPlayer(src)
    return QBCore.Functions.GetPlayer(src)
end

---Check if item exists
---@param item string | integer
function DoesItemExist(item)
    return QBCore.Shared.Items[item] ~= nil
end

---Generate Plate Number
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

---Get Vehicle Data
---@param vehicleModel string | integer
function GetVehicleData(vehicleModel)
    if not vehicleModel or type(vehicleModel) ~= 'string' then
        return nil
    end
    return QBCore.Shared.Vehicles[vehicleModel:lower()]
end
