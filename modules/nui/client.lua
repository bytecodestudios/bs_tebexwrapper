RegisterNetEvent('bs_tebexwrapper:client:refreshData', function()
    SendNUIMessage({
        action = 'forceRefresh'
    })
end)

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

    local playerPed = PlayerPedId()
    local originalCoords = GetEntityCoords(playerPed)

    SpawnTestVehicle(data.vehicle, Config.TestDriveLocation, function(vehicle)
        if vehicle and DoesEntityExist(vehicle) then
            SetVehicleNumberPlateText(vehicle, "TESTDRIVE")
            SetEntityAsMissionEntity(vehicle, true, true)
            SetPedIntoVehicle(playerPed, vehicle, -1)
            GiveKeys("TESTDRIVE")
            local ended = false
            Citizen.CreateThread(function()
                local timeLeft = 20
                AddTextUI(("🕒 Test drive ends in: %ss"):format(timeLeft))

                while timeLeft > 0 and not ended do
                    Citizen.Wait(1000)
                    timeLeft -= 1
                    AddTextUI(("🕒 Test drive ends in: %ss"):format(timeLeft))
                end

                HideTextUI()

                if not ended and DoesEntityExist(vehicle) then
                    ended = true
                    Notify("Test drive finished. Returning to original location...", "info")
                    EndTestDrive(vehicle, playerPed, originalCoords)
                end
            end)
            Citizen.CreateThread(function()
                while not ended do
                    Citizen.Wait(1000)
                    if not IsPedInVehicle(playerPed, vehicle, false) then
                        ended = true
                        Notify("You exited the vehicle. Test drive ended.", "error")
                        EndTestDrive(vehicle, playerPed, originalCoords)
                        HideTextUI()
                        break
                    end
                end
            end)
        else
            Notify("Vehicle model could not be loaded or spawned.", "error")
        end

        DoScreenFadeIn(500)
    end)

    cb({ success = true })
end)


function EndTestDrive(vehicle, playerPed, originalCoords)
    if DoesEntityExist(vehicle) then
        SetEntityAsMissionEntity(vehicle, true, true)
        DeleteVehicle(vehicle)
        if DoesEntityExist(vehicle) then
            DeleteEntity(vehicle)
        end
    end
    DoScreenFadeOut(500)
    Citizen.Wait(600)
    if IsPedInAnyVehicle(playerPed, false) then
        TaskLeaveVehicle(playerPed, GetVehiclePedIsIn(playerPed, false), 0)
        Citizen.Wait(1000)
    end
    SetEntityCoordsNoOffset(playerPed, originalCoords.x, originalCoords.y, originalCoords.z, false, false, false)
    DoScreenFadeIn(500)
end