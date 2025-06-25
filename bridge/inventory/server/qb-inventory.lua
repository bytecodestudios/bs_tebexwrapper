if GetResourceState('qb-inventory') ~= 'started' then return end
Debug('^1[Bridge] ^2qb-inventory detected')

function AddItem(source, item, amount)
    return exports['qb-inventory']:AddItem(source, item, amount)
end

function CanCarryItem(source, itemName, amount)
    return exports['qb-inventory']:CanAddItem(source, itemName, amount)
end
