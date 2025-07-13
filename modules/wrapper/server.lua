---Check for permission
local function hasPermission(source)
    return HasPermission(source, Config.AdminPermission)
end

---Database shop logs
local function createLog(source, logType, message)
    local Player = GetPlayer(source)
    if not Player then return end
    local citizenid = Player.PlayerData.citizenid
    local playerName = Player.PlayerData.charinfo.firstname .. ' ' .. Player.PlayerData.charinfo.lastname
    -- Assuming you are using oxmysql
    MySQL.Async.execute('INSERT INTO shop_logs (citizenid, player_name, log_type, message) VALUES (@cid, @name, @type, @msg)', {
        ['@cid'] = citizenid,
        ['@name'] = playerName,
        ['@type'] = logType,
        ['@msg'] = message
    })
end

---Get All shop data
local function getShopData()
    local p = promise.new()
    MySQL.Async.fetchAll('SELECT * FROM shop_categories ORDER BY display_order ASC, name ASC', {}, function(categories)
        MySQL.Async.fetchAll('SELECT * FROM shop_items', {}, function(items)
            local itemMap = {}
            for _, item in ipairs(items) do
                if not itemMap[item.category_id] then itemMap[item.category_id] = {} end
                table.insert(itemMap[item.category_id], item)
            end
            for i = 1, #categories do
                categories[i].items = itemMap[categories[i].id] or {}
            end
            p:resolve(categories or {})
        end)
    end)
    return p
end

---Get All shop logs
local function getShopLogs()
    local p = promise.new()
    MySQL.Async.fetchAll('SELECT * FROM shop_logs ORDER BY timestamp DESC LIMIT 200', {}, function(logs)
        p:resolve(logs or {})
    end)
    return p
end

---Get All Player Data
local function getAllPlayerData()
    local p = promise.new()
    MySQL.Async.fetchAll([[
        SELECT p.license, p.citizenid, p.charinfo, COALESCE(pd.diamonds, 0) AS diamonds
        FROM players AS p
        LEFT JOIN player_diamonds AS pd ON p.license = pd.license
    ]], {}, function(dbPlayers)
        if not dbPlayers then p:resolve({}) return end
        local allPlayersData = {}
        for _, p_data in ipairs(dbPlayers) do
            local playerName = p_data.citizenid
            if p_data.charinfo then
                local success, charData = pcall(json.decode, p_data.charinfo)
                if success and charData and charData.firstname and charData.lastname then
                    playerName = charData.firstname .. ' ' .. charData.lastname
                end
            end
            table.insert(allPlayersData, { name = playerName, identifier = p_data.license, diamonds = p_data.diamonds })
        end
        p:resolve(allPlayersData)
    end)
    return p
end

---Get Player Diamonds
local function getPlayerDiamonds(license)
    local p = promise.new()
    MySQL.Async.fetchAll('SELECT diamonds FROM player_diamonds WHERE license = @license', { ['@license'] = license }, function(result)
        local diamondCount = (result and result[1] and result[1].diamonds) or 0
        p:resolve(diamondCount)
    end)
    return p
end

---Start Test Vehicle Delete Timer
---@param vehicleNetId integer | number
RegisterNetEvent('bs_tebexwrapper:server:startDeleteTimer', function(vehicleNetId)
    local vehicle = NetworkGetEntityFromNetworkId(vehicleNetId)
    -- Wrap the wait in a thread so it doesn't block
    CreateThread(function()
        Wait(Config.TestDriveDuration * 1000)
        if DoesEntityExist(vehicle) then
            DeleteEntity(vehicle)
        end
    end)
end)

---Fetch All Data
---@param source integer | number
lib.callback.register('bs_tebexwrapper:server:fetchData', function(source)
    local Player = GetPlayer(source)
    if not Player then return end
    local diamondCount = Citizen.Await(getPlayerDiamonds(Player.PlayerData.license))
    local categories, logs = Citizen.Await(getShopData()), Citizen.Await(getShopLogs())
    return {
        categories = categories,
        logs = logs,
        player = {
            diamonds = diamondCount,
            isAdmin = hasPermission(source)
        },
        config = {
            testDriveEnabled = Config.TestDriveEnabled
        }
    }
end)

---Fetch All Players Data
---@param source integer | number
lib.callback.register('bs_tebexwrapper:server:getAllPlayersFromDB', function(source)
    if not hasPermission(source) then return end
    return Citizen.Await(getAllPlayerData())
end)

---Shop Admin Actions
---@param source integer | number
---@param data table<{ action: string, payload: table }>
lib.callback.register('bs_tebexwrapper:server:adminAction', function(source, data)
    if not hasPermission(source) then return { success = false, message = "Insufficient permissions." } end
    local action, payload = data.action, data.payload
    if (action == 'add_item' or action == 'edit_item') and payload and payload.type == 'item' then
        if not DoesItemExist(payload.item_name) then
            return { success = false, message = string.format("Error: Item name '%s' does not exist.", payload.item_name) }
        end
    end
    local logType, logMessage
    if action == 'add_category' then
        MySQL.Async.execute('INSERT INTO shop_categories (name, logo_url, display_order) VALUES (@name, @logo_url, @display_order)', payload)
        logType, logMessage = 'admin_add', ('Created category: "%s"'):format(payload.name)
    elseif action == 'edit_category' then
        MySQL.Async.execute('UPDATE shop_categories SET name = @name, logo_url = @logo_url, display_order = @display_order WHERE id = @id', payload)
        logType, logMessage = 'admin_edit', ('Edited category: "%s" (ID: %s)'):format(payload.name, payload.id)
    elseif action == 'delete_category' then
        MySQL.Async.execute('DELETE FROM shop_items WHERE category_id = @id', { id = payload.id })
        MySQL.Async.execute('DELETE FROM shop_categories WHERE id = @id', { id = payload.id })
        logType, logMessage = 'admin_delete', ('Deleted category ID: %s'):format(payload.id)
    elseif action == 'add_item' then
        MySQL.Async.execute('INSERT INTO shop_items (category_id, name, description, image_url, price, type, item_name, stock) VALUES (@category_id, @name, @description, @image_url, @price, @type, @item_name, @stock)', payload)
        logType, logMessage = 'admin_add', ('Created item: "%s"'):format(payload.name)
    elseif action == 'edit_item' then
        MySQL.Async.execute('UPDATE shop_items SET category_id = @category_id, name = @name, description = @description, image_url = @image_url, price = @price, type = @type, item_name = @item_name, stock = @stock WHERE id = @id', payload)
        logType, logMessage = 'admin_edit', ('Edited item: "%s" (ID: %s)'):format(payload.name, payload.id)
    elseif action == 'delete_item' then
        MySQL.Async.execute('DELETE FROM shop_items WHERE id = @id', { id = payload.id })
        logType, logMessage = 'admin_delete', ('Deleted item ID: %s'):format(payload.id)
    else
        return { success = false, message = "Unknown admin action." }
    end
    if logType then createLog(source, logType, logMessage) end
    TriggerClientEvent('bs_tebexwrapper:client:refreshData', -1)
    return { success = true, message = "Action completed successfully." }
end)

---Shop Modify Diamonds
---@param source integer | number
---@param data table<{ identifier: string, amount: number, targetName: string, action: string }>
lib.callback.register('bs_tebexwrapper:server:modifyDiamonds', function(source, data)
    if not hasPermission(source) then return { success = false, message = "Insufficient permissions." } end
    local targetLicense = data.identifier
    local amount = tonumber(data.amount)
    local targetName = data.targetName or "Unknown Player"
    if not amount or amount <= 0 then return { success = false, message = "Invalid amount specified." } end
    if data.action == 'add' then
        MySQL.Async.execute('INSERT INTO player_diamonds (license, diamonds) VALUES (@license, @amount) ON DUPLICATE KEY UPDATE diamonds = diamonds + @amount', { ['@license'] = targetLicense, ['@amount'] = amount })
        createLog(source, 'admin_give_diamonds', ('Gave %s diamonds to %s'):format(amount, targetName))
        SendToDiscord('admin_logs', 'Admin Action: Diamonds Given', nil, 16753920, {{ name = "Admin", value = "```" ..GetPlayerName(source).. "```", inline = true },{ name = "Target Player", value = "```"..targetName.."```", inline = true },{ name = "Amount Given", value = "```"..tostring(amount).. "```", inline = true },})
    elseif data.action == 'remove' then
        local affectedRows = MySQL.Sync.execute('UPDATE player_diamonds SET diamonds = diamonds - @amount WHERE license = @license AND diamonds >= @amount', { ['@license'] = targetLicense, ['@amount'] = amount })
        if affectedRows == 0 then return { success = false, message = "Player does not have enough diamonds." } end
        createLog(source, 'admin_take_diamonds', ('Took %s diamonds from %s'):format(amount, targetName))
        SendToDiscord('admin_logs', 'Admin Action: Diamonds Removed', nil, 16753920, {{ name = "Admin", value =  "```" ..GetPlayerName(source).. "```", inline = true },{ name = "Target Player", value = "```" ..targetName.. "```", inline = true },{ name = "Amount Removed", value = "```" ..tostring(amount).. "```", inline = true }})
    else
        return { success = false, message = "Invalid action." }
    end
    TriggerClientEvent('bs_tebexwrapper:client:refreshData', -1)
    local updatedPlayers = Citizen.Await(getAllPlayerData())
    return { success = true, message = "Player balance updated.", players = updatedPlayers }
end)

---Shop Item Purchase
---@param source integer | number
---@param data table<{ cart: table }>
lib.callback.register('bs_tebexwrapper:server:purchase', function(source, data)
    local Player = GetPlayer(source)
    if not Player then return { success = false, message = "Player not found." } end

    local cart = data.cart
    if not cart or #cart == 0 then return { success = false, message = "Your cart is empty." } end

    local totalCost = 0
    for _, cartItem in ipairs(cart) do
        totalCost = totalCost + (cartItem.price * cartItem.quantity)
        if cartItem.type == 'item' then
             if not CanCarryItem(source, cartItem.item_name, cartItem.quantity) then
                return { success = false, message = "You don't have enough inventory space for all items." }
            end
        end
    end

    local license = Player.PlayerData.license
    local affectedRows = MySQL.Sync.execute(
        'UPDATE player_diamonds SET diamonds = diamonds - @cost WHERE license = @license AND diamonds >= @cost',
        { ['@cost'] = totalCost, ['@license'] = license }
    )

    if affectedRows == 0 then
        local currentDiamonds = Citizen.Await(getPlayerDiamonds(license))
        if currentDiamonds < totalCost then
            return { success = false, message = "You don't have enough Diamonds." }
        else
            return { success = false, message = "Payment failed, please try again." }
        end
    end

    local purchaseLogMessage = 'Purchased: '
    local successfulItems, failedItems, refundAmount = {}, {}, 0
    local stockUpdated = false

    for _, cartItem in ipairs(cart) do
        if cartItem.type == 'item' then
            -- Item handling logic...
            local purchaseSuccessful = true
            if cartItem.stock ~= -1 then
                local stockUpdatedRows = MySQL.Sync.execute('UPDATE shop_items SET stock = stock - @quantity WHERE id = @id AND stock >= @quantity', { ['@quantity'] = cartItem.quantity, ['@id'] = cartItem.id })
                stockUpdated = true
                if stockUpdatedRows == 0 then
                    purchaseSuccessful = false
                    table.insert(failedItems, ('%dx %s'):format(cartItem.quantity, cartItem.name))
                    refundAmount = refundAmount + (cartItem.price * cartItem.quantity)
                end
            end
            if purchaseSuccessful then
                Player.Functions.AddItem(cartItem.item_name, cartItem.quantity)
                table.insert(successfulItems, ('%dx %s'):format(cartItem.quantity, cartItem.name))
            end

        elseif cartItem.type == 'vehicle' then
            local vehicleModel = cartItem.item_name
            local vehicleData = GetVehicleData(vehicleModel)

            if vehicleData then
                for i = 1, cartItem.quantity do
                    local plate = GeneratePlate()
                    local finalModsJson = json.encode({}) -- Empty mods table

                    -- Vehicle is spawned, not stored. `garage` is nil and `state` is 1 (out).
                    local vehicleValues = {
                        license = Player.PlayerData.license, citizenid = Player.PlayerData.citizenid, vehicle = vehicleModel,
                        hash = vehicleData.hash, mods = finalModsJson, plate = plate, garage = nil,
                        fuel = 100, engine = 1000.0, body = 1000.0, state = 1
                    }
                    MySQL.Async.execute(
                        'INSERT INTO player_vehicles (license, citizenid, vehicle, hash, mods, plate, garage, fuel, engine, body, state) VALUES (@license, @citizenid, @vehicle, @hash, @mods, @plate, @garage, @fuel, @engine, @body, @state)',
                        vehicleValues,
                        function(rowsChanged)
                            if rowsChanged > 0 then
                                TriggerClientEvent('bs_tebexwrapper:client:spawnPurchasedVehicle', source, vehicleModel, plate)
                            end
                        end
                    )
                end
                table.insert(successfulItems, ('%dx %s'):format(cartItem.quantity, cartItem.name))
            else
                print(('[bs_tebexwrapper] ERROR: Vehicle model "%s" not found in Shared.Vehicles. Refunding player.'):format(vehicleModel))
                table.insert(failedItems, ('%dx %s (Invalid)'):format(cartItem.quantity, cartItem.name))
                refundAmount = refundAmount + (cartItem.price * cartItem.quantity)
            end
        end
    end

    if refundAmount > 0 then
        MySQL.Sync.execute('UPDATE player_diamonds SET diamonds = diamonds + @refund WHERE license = @license', { ['@refund'] = refundAmount, ['@license'] = license })
        local failMsg = "Some items were out of stock and have been refunded: " .. table.concat(failedItems, ', ')
        Notify(source, failMsg, 'error')
    end

    if #successfulItems > 0 then
        purchaseLogMessage = purchaseLogMessage .. table.concat(successfulItems, ', ')
        createLog(source, 'purchase', purchaseLogMessage .. (' for %s diamonds.'):format(totalCost - refundAmount))
    end

    if stockUpdated then
        TriggerClientEvent('bs_tebexwrapper:client:refreshData', -1)
    end

    local newBalance = Citizen.Await(getPlayerDiamonds(license))
    return { success = true, message = "Purchase processed successfully!", newBalance = newBalance }
end)

---Shop Validate Test Drive
---@param source integer | number
---@param vehicleSpawnCode table<{ vehicleSpawnCode: string }>
lib.callback.register('bs_tebexwrapper:server:validateTestDrive', function(source, vehicleSpawnCode)
    if not Config.TestDriveEnabled then
        return { allowed = false, message = "Test drives are currently disabled." }
    end
    createLog(source, 'test_drive', ('Requested test drive for: %s'):format(vehicleSpawnCode))
    Notify(source, "Your test drive vehicle has arrived. It will be returned in " .. (Config.TestDriveDuration / 60) .. " minutes.", "primary")
    return { allowed = true }
end)

---Redeem Diamonds From Tebex
---@param source integer | number
---@param data table<{ code: string }>
lib.callback.register('bs_tebexwrapper:server:redeemCode', function(source, data)
    local Player =  GetPlayer(source)
    if not Player then
        return { success = false, message = "Player data could not be found." }
    end
    local license = Player.PlayerData.license
    local codeToRedeem = data.code

    if not codeToRedeem or codeToRedeem:gsub("%s", "") == "" then
        return { success = false, message = "Please enter a code." }
    end
    local codeData = MySQL.Sync.fetchAll('SELECT * FROM codes WHERE UPPER(code) = UPPER(@code)', {
        ['@code'] = codeToRedeem
    })
    if not codeData or not codeData[1] then
        return { success = false, message = "This code is invalid or has already been used." }
    end
    local boughtPackages = json.decode(codeData[1].packagename)
    local totalDiamondsToGive = 0
    if boughtPackages and next(boughtPackages) ~= nil then
        for _, packageName in ipairs(boughtPackages) do
            if Config.Packages and Config.Packages[packageName] then
                totalDiamondsToGive = totalDiamondsToGive + Config.Packages[packageName]
            else
                print(('[bs_tebexwrapper] WARNING: Player %s tried to redeem a code with an unconfigured package: "%s"'):format(license, packageName))
            end
        end
    end
    if totalDiamondsToGive <= 0 then
        return { success = false, message = "The items in this code are no longer available. Please contact support." }
    end
    MySQL.Sync.execute('INSERT INTO player_diamonds (license, diamonds) VALUES (@license, @amount) ON DUPLICATE KEY UPDATE diamonds = diamonds + @amount', {
        ['@license'] = license,
        ['@amount'] = totalDiamondsToGive
    })
    MySQL.Sync.execute('DELETE FROM codes WHERE code = @code', { ['@code'] = codeToRedeem })
    local logMessage = ('Redeemed code "%s" for %d diamonds.'):format(codeToRedeem, totalDiamondsToGive)
    createLog(source, 'redeem_code', logMessage)
	SendToDiscord('redeem_logs', 'Redeem Code', logMessage, 65280)
    TriggerClientEvent('bs_tebexwrapper:client:refreshData', -1)

    local newBalance = Citizen.Await(getPlayerDiamonds(license))

    return {
        success = true,
        message = string.format("Success! You have redeemed %d Diamonds.", totalDiamondsToGive),
        newBalance = newBalance
    }
end)


RegisterCommand('package_purchase', function(source, args)
	if source == 0 then
        -- This command runs from console, so we wrap it in a thread to use Await/Sync calls
        CreateThread(function()
            if not args or not args[1] then
                print('^1[bs_tebexwrapper] Error: purchase_package_tebex was called with no arguments.^0')
                return
            end

            local success, dec = pcall(json.decode, args[1])
            if not success or not dec then
                print('^1[bs_tebexwrapper] Error: Could not decode Tebex JSON.^0')
                return
            end

            -- Tebex can send transactionId or transid, support both
            local tbxid = dec.transactionId or dec.transid 
            local packageName = dec.packageName or dec.packagename

            if not tbxid or not packageName then
                print('^1[bs_tebexwrapper] Error: Tebex JSON missing transactionId or packageName.^0')
                return
            end

            local result = MySQL.Sync.fetchAll('SELECT * FROM codes WHERE code = @code', {['@code'] = tbxid})

            if result and result[1] then
                local packagetable = json.decode(result[1].packagename)
                table.insert(packagetable, packageName)
                local rowsChanged = MySQL.Sync.execute('UPDATE codes SET packagename = ? WHERE code = ?', {json.encode(packagetable), tbxid})
                if rowsChanged > 0 then
                    SendToDiscord('purchase_logs', 'Purchase Logs', '`'..packageName..'` was just added to existing redeem code: `'..tbxid..'`.', 1752220)
                else
                    SendToDiscord('error_logs', 'Error Logs', '`'..tbxid..'` was not updated in the database. Please check for errors!', 15158332)
                end
            else
                local packTab = {packageName}
                MySQL.Sync.execute("INSERT INTO codes (code, packagename) VALUES (?, ?)", {tbxid, json.encode(packTab)})
                SendToDiscord('purchase_logs', 'New Tebex Purchase', nil, 1752220, {{ name = "Package Purchased", value = "```" .. packageName .. "```", inline = false },{ name = "Transaction ID / Redeem Code", value = "```" .. tbxid .. "```", inline = false }})
                print('^2Purchase '..tbxid..' was successfully inserted into the database.^0')
            end
        end)
	else
		print(GetPlayerName(source)..' tried to give themself a store code.')
        SendToDiscord('exploit_logs', 'Attempted Exploit Detected', nil, 15158332, {{ name = "Player Name", value = '```' ..GetPlayerName(source).. '```', inline = true }, { name = "Server ID", value = '```' ..source.. '```', inline = true }, { name = "Details", value = '```Attempted to trigger an event to grant a store code without authorization.```', inline = false }})
	end
end, false)