if GetResourceState('ox_inventory') ~= 'started' then return end
Debug('^1[Bridge]^6 ^2ox_inventory detected')

function AddItem(source, item, amount)
    return exports.ox_inventory:AddItem(source, item, amount)
end

function CanCarryItem(source, itemName, amount)
    return exports.ox_inventory:CanCarryItem(source, itemName, amount)
end

function DoesItemExist(itemName)
    return exports.ox_inventory:GetItem(itemName)[itemName] ~= nil
end