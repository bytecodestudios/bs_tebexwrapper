if GetResourceState('qb-inventory') ~= 'started' then return end
Debug('^1[Bridge] ^2qb-inventory detected')

---Add Inventory Item
---@param source integer | number
---@param item string
---@param amount number
function AddItem(source, item, amount)
    return exports['qb-inventory']:AddItem(source, item, amount)
end

---Can Carry Inventory Item
---@param source integer | number
---@param item string
---@param amount number
function CanCarryItem(source, item, amount)
    return exports['qb-inventory']:CanAddItem(source, item, amount)
end
