local isShopOpen = false

---Checker function to know if shop is open
local function checkShopOpen()
    return isShopOpen
end exports('isShopOpen', checkShopOpen)

---Close Shop Function
function CloseShop()
    if not isShopOpen then return end
    SendNUIMessage({ action = 'setVisible', data = false })
    SetNuiFocus(false, false)
    isShopOpen = false
end

---Spawn Vehicle Wrapper Function
---@param model string
---@param coords vector4
---@param cb fun(vehicle: integer | number | nil)
function SpawnTestVehicle(model, coords, cb)
    local modelHash = GetHashKey(model)
    RequestModel(modelHash)
    local attempts = 0
    while not HasModelLoaded(modelHash) and attempts < 100 do
        attempts = attempts + 1
        Wait(50)
    end
    if HasModelLoaded(modelHash) then
        local vehicle = CreateVehicle(modelHash, coords.x, coords.y, coords.z, coords.w, true, false)
        SetModelAsNoLongerNeeded(modelHash)
        if cb then
            cb(vehicle)
        end
    else
        SetModelAsNoLongerNeeded(modelHash)
        if cb then
            cb(nil) 
        end
    end
end

---Force Refresh Data
RegisterNetEvent('bs_tebexwrapper:client:refreshData', function()
    if isShopOpen then
        SendNUIMessage({ action = 'forceRefresh' })
    end
end)

---Spawn Purchased Vehicle
---@param vehicleModel string
---@param plate string
RegisterNetEvent('bs_tebexwrapper:client:spawnPurchasedVehicle', function(vehicleModel, plate)
    CreateThread(function()
        RequestModel(vehicleModel)
        local playerPed = PlayerPedId()
        local coords = Config.Spawn_Purchased_Vehicle_Location 
        local vehicle = CreateVehicle(vehicleModel, coords.x, coords.y, coords.z, coords.w, true, true)
        SetVehicleNumberPlateText(vehicle, plate)
        SetVehicleFuelLevel(vehicle, 100.0)
        SetVehicleAsNoLongerNeeded(vehicle) 
        local blip = AddBlipForEntity(vehicle)
        SetBlipSprite(blip, 225) 
        SetBlipDisplay(blip, 4)
        SetBlipScale(blip, 1.0)
        SetBlipColour(blip, 2) -- Green color
        SetBlipAsShortRange(blip, true)
        BeginTextCommandSetBlipName("STRING")
        GiveKeys(plate)
        AddTextComponentString("Your New Vehicle")
        EndTextCommandSetBlipName(blip)
        Notify("Your new vehicle has arrived nearby! It's marked on your map.", "success", 8000)
        SetModelAsNoLongerNeeded(vehicleModel)
        CreateThread(function()
            local blipRemoved = false
            while not blipRemoved do
                Wait(1000)
                if DoesBlipExist(blip) and IsPedInVehicle(playerPed, vehicle, false) then
                    RemoveBlip(blip)
                    blipRemoved = true
                elseif not DoesEntityExist(vehicle) and DoesBlipExist(blip) then
                    RemoveBlip(blip)
                    blipRemoved = true
                end
            end
        end)
    end)
end)

---Command to Open Shop
RegisterCommand(Config.OpenCommand, function()
    if isShopOpen then return end
    SendNUIMessage({ action = 'setVisible', data = true })
    SetNuiFocus(true, true)
    isShopOpen = true
    CreateThread(function()
        while isShopOpen do
            Wait(0)
            if IsControlJustReleased(0, 200) or IsControlJustReleased(0, 199) then
                CloseShop()
            end
        end
    end)
end, false)
---Register Key Bind linked to the command
RegisterKeyMapping(Config.OpenCommand, Config.CommandHelp, 'keyboard', Config.Keybind)
