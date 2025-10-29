local inventoryName = nil
if (GetResourceState('qb-inventory') == "started") then inventoryName = 'qb-inventory' end
if (GetResourceState('ps-inventory') == "started") then inventoryName = 'ps-inventory' end
if (GetResourceState('lj-inventory') == "started") then inventoryName = 'lj-inventory' end
if not inventoryName then return end

---Add Inventory Item
---@param source integer | number
---@param item string
---@param amount number
function AddItem(source, item, amount)
    return exports[inventoryName]:AddItem(source, item, amount)
end

---Can Carry Inventory Item
---@param source integer | number
---@param item string
---@param amount number
function CanCarryItem(source, item, amount)
    return exports[inventoryName]:CanAddItem(source, item, amount)
end
