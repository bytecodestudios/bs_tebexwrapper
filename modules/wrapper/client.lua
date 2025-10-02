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
        RequestModel(Config.ClaimPedModel)
        while not HasModelLoaded(Config.ClaimPedModel) do Wait(50) end
        local loc = Config.ClaimPedLocation
        local claimPed = CreatePed(4, GetHashKey(Config.ClaimPedModel), loc.x, loc.y, loc.z, loc.w, true, true)
        FreezeEntityPosition(claimPed, true)
        SetEntityInvincible(claimPed, true)
        SetBlockingOfNonTemporaryEvents(claimPed, true)
        local pedBlip = AddBlipForEntity(claimPed)
        SetBlipSprite(pedBlip, 477) -- Person icon
        SetBlipColour(pedBlip, 5)   -- Yellow
        SetBlipAsShortRange(pedBlip, true)
        BeginTextCommandSetBlipName("STRING")
        AddTextComponentString("Vehicle Pickup")
        EndTextCommandSetBlipName(pedBlip)
        exports.ox_target:addLocalEntity(claimPed, {
            {
                name = 'claim_vehicle',
                label = 'Claim Vehicle',
                icon = 'fas fa-car-key',
                onSelect = function()       
                    RequestModel(vehicleModel)
                    CreateThread(function()
                        while not HasModelLoaded(vehicleModel) do Wait(50) end

                        local playerPed = PlayerPedId()
                        local spawnPos = GetOffsetFromEntityInWorldCoords(claimPed, 0.0, 3.0, 0.0)
                        local vehicle = CreateVehicle(vehicleModel, spawnPos.x, spawnPos.y, spawnPos.z, GetEntityHeading(claimPed), true, true)
                        SetVehicleNumberPlateText(vehicle, plate)
                        SetVehicleFuelLevel(vehicle, 100.0)
                        GiveKeys(plate)
                        local blip = AddBlipForEntity(vehicle)
                        SetBlipSprite(blip, 225)
                        SetBlipColour(blip, 2)
                        BeginTextCommandSetBlipName("STRING")
                        AddTextComponentString("Your New Vehicle")
                        EndTextCommandSetBlipName(blip)
                        Notify("Your new vehicle has arrived!", "success", 8000) 
                        SetModelAsNoLongerNeeded(vehicleModel)
                        exports.ox_target:removeEntity(claimPed)
                        RemoveBlip(pedBlip)
                        DeleteEntity(claimPed)
                        CreateThread(function()
                            local blipRemoved = false
                            while not blipRemoved do
                                Wait(1000)
                                if (DoesBlipExist(blip) and IsPedInVehicle(playerPed, vehicle, false)) or not DoesEntityExist(vehicle) then
                                    RemoveBlip(blip)
                                    blipRemoved = true
                                end
                            end
                        end)
                    end)
                end
            }
        })
         Notify("Your vehicle is ready for pickup! Aim at the valet to claim it.", "info", 8000) 
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
