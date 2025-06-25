if GetResourceState('qs-inventory') ~= 'started' then return end
Debug('^1[Bridge] ^2qs-inventory detected')

function AddItem(source, item, amount)
    return exports['qs-inventory']:AddItem(source, item, amount)
end

function CanCarryItem(source, itemName, amount)
    return exports['qs-inventory']:CanCarryItem(source, itemName, amount)
end

function DoesItemExist(itemName)
    return exports['qs-inventory']:GetItemList(itemName)[itemName] ~= nil
end