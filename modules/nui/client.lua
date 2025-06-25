RegisterNUICallback('close', function(_, cb)
    CloseShop()
    cb('ok')
end)

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

RegisterNUICallback('startTestDrive', function(data, cb)
    if not data or not data.vehicle then
        cb({ success = false })
        return
    end
    CloseShop()
    DoScreenFadeOut(500)
    Wait(1000)
    local result = lib.callback.await('bs_tebexwrapper:server:validateTestDrive', false, data.vehicle)
    if not result or not result.allowed then
        Notify(result.message or "Could not start test drive.", "error")
        DoScreenFadeIn(500)
        cb({ success = false })
        return
    end
    SpawnTestVehicle(data.vehicle, Config.TestDriveLocation, function(vehicle)
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