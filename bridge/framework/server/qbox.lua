if GetResourceState('qbx_core') ~= 'started' then return end
string = lib.string
Debug('^1[Bridge] ^2QBox framework detected')

function HasPermission(source, permission)
    return exports.qbx_core:HasPermission(source, permission)
end

function GetPlayer(src)
    return exports.qbx_core:GetPlayer(src)
end

function GeneratePlate()
    local plate = nil
    local isPlateTaken = true
    while isPlateTaken do
        -- \\ Need Logic For QBox Plate Generation
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
    return exports.qbx_core:GetVehiclesByName(vehicleModel)
end