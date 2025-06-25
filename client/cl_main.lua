local isShopOpen = false

RegisterCommand(Config.OpenCommand, function()
    if isShopOpen then return end
    SendNUIMessage({ action = 'setVisible', data = true })
    SetNuiFocus(true, true)
    isShopOpen = true
end, false)

function closeShop()
    if not isShopOpen then return end
    SendNUIMessage({ action = 'setVisible', data = false })
    SetNuiFocus(false, false)
    isShopOpen = false
end

RegisterNUICallback('close', function(_, cb)
    closeShop()
    cb('ok')
end)

CreateThread(function()
    while true do
        Wait(0)
        if isShopOpen and (IsControlJustReleased(0, 200) or IsControlJustReleased(0, 199)) then
            closeShop()
        end
    end
end)

RegisterNetEvent('bs_tebexwrapper:client:refreshData', function()
    if isShopOpen then
        SendNUIMessage({ action = 'forceRefresh' })
    end
end)

-- NUI CALLBACK BRIDGE
RegisterNUICallback('fetchData', function(_, cb)
    local data = lib.callback.await('bs_tebexwrapper:server:fetchData', false)
    cb(data)
end)

RegisterNUICallback('getAllPlayers', function(_, cb)
    local players = lib.callback.await('bs_tebexwrapper:server:getAllPlayersFromDB', false)
    cb(players)
end)

RegisterNUICallback('purchase', function(data, cb)
    local result = lib.callback.await('bs_tebexwrapper:server:purchase', false, data)
    cb(result)
end)

RegisterNUICallback('adminAction', function(data, cb)
    local result = lib.callback.await('bs_tebexwrapper:server:adminAction', false, data)
    cb(result)
end)

RegisterNUICallback('modifyDiamonds', function(data, cb)
    local result = lib.callback.await('bs_tebexwrapper:server:modifyDiamonds', false, data)
    cb(result)
end)

RegisterNUICallback('redeemCode', function(data, cb)
    local result = lib.callback.await('bs_tebexwrapper:server:redeemCode', false, data)
    cb(result)
end)

local function spawnTestVehicle(model, coords, cb)
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

RegisterNUICallback('startTestDrive', function(data, cb)
    if not data or not data.vehicle then
        cb({ success = false })
        return
    end
    closeShop()
    DoScreenFadeOut(500)
    Wait(1000)
    local result = lib.callback.await('bs_tebexwrapper:server:validateTestDrive', false, data.vehicle)
    if not result or not result.allowed then
        Notify(result.message or "Could not start test drive.", "error")
        DoScreenFadeIn(500)
        cb({ success = false })
        return
    end
    spawnTestVehicle(data.vehicle, Config.TestDriveLocation, function(vehicle)
        if vehicle and DoesEntityExist(vehicle) then
            local plate = GetVehicleNumberPlateText(vehicle)
            SetVehicleNumberPlateText(vehicle, "TESTDRIVE")
            SetEntityAsMissionEntity(vehicle, true, true)
            SetPedIntoVehicle(PlayerPedId(), vehicle, -1)
            GiveKeys(plate)
            local vehicleNetId = VehToNet(vehicle)
            TriggerServerEvent('bs_tebexwrapper:server:startDeleteTimer', vehicleNetId)
        else
            Notify("Vehicle model could not be loaded or spawned.", "error")
        end
        DoScreenFadeIn(500)
    end)

    cb({ success = true })
end)

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