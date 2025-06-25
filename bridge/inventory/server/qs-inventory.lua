if GetResourceState('qs-inventory') ~= 'started' then return end
Debug('^1[Bridge] ^2qs-inventory detected')

---Add Inventory Item
---@param source integer | number
---@param item string
---@param amount number
function AddItem(source, item, amount)
    return exports['qs-inventory']:AddItem(source, item, amount)
end

---Can Carry Inventory Item
---@param source integer | number
---@param item string
---@param amount number
function CanCarryItem(source, item, amount)
    return exports['qs-inventory']:CanCarryItem(source, item, amount)
end

---Does Item Exist
---@param item string
function DoesItemExist(item)
    return exports['qs-inventory']:GetItemList(item)[item] ~= nil
end
