if GetResourceState('qbx_core') ~= 'started' then return end
Debug('^1[Bridge] ^2QBox framework detected')

---Check permission
---@param source number | integer
---@param permission string
function HasPermission(source, permission)
    return exports.qbx_core:HasPermission(source, permission)
end

---Get Player Data
---@param src number | integer
function GetPlayer(src)
    return exports.qbx_core:GetPlayer(src)
end

---Get Vehicle Data
---@param vehicleModel string | integer
function GetVehicleData(vehicleModel)
    if not vehicleModel or type(vehicleModel) ~= 'string' then
        return nil
    end
    return exports.qbx_core:GetVehiclesByName(vehicleModel)
end
