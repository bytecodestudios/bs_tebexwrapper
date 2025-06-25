if GetResourceState('ox_inventory') ~= 'started' then return end
Debug('^1[Bridge]^6 ^2ox_inventory detected')

---Add Inventory Item
---@param source integer | number
---@param item string
---@param amount number
function AddItem(source, item, amount)
    return exports.ox_inventory:AddItem(source, item, amount)
end

---Can Carry Inventory Item
---@param source integer | number
---@param item string
---@param amount number
function CanCarryItem(source, item, amount)
    return exports.ox_inventory:CanCarryItem(source, item, amount)
end

---Does Item Exist
---@param item string
function DoesItemExist(item)
    return exports.ox_inventory:GetItem(item)[item] ~= nil
end
