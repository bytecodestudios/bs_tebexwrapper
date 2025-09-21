local StringCharset = {}
local NumberCharset = {}

---Debug Wrapper
---@param a any
function Debug(a)
    if Config.Debug then
        print(a)
    end
end

---Notification Wrapper
---@param message string
---@param type string
function Notify(source, message, type)
    if Config.Notify == 'qb' then
        TriggerClientEvent('QBCore:Notify', source, message, type)
        return true
    elseif Config.Notify == 'ox' then
        TriggerClientEvent('ox_lib:notify', source, { description = message, type = type or 'info' })
        return true
    end
end

function fetchPlate(plate)
    local query = "SELECT COUNT(*) AS count FROM player_vehicles WHERE plate = @plate"
    MySQL.Async.fetchScalar(query, {['@plate'] = plate}, function(result)
        if result > 0 then
            return true 
        else
            return false
        end
    end)
end


for i = 48, 57 do NumberCharset[#NumberCharset+1] = string.char(i) end  -- 0–9
for i = 65, 90 do StringCharset[#StringCharset+1] = string.char(i) end -- A–Z only

function RandomNumber()
    return NumberCharset[math.random(1, #NumberCharset)]
end

function RandomLetter()
    return StringCharset[math.random(1, #StringCharset)]
end

function GeneratePlate()
    local plate = ""

    for i = 1, #Config.PlateFormat do
        local charType = Config.PlateFormat:sub(i, i)
        if charType == "N" then
            plate = plate .. RandomNumber()
        elseif charType == "L" then
            plate = plate .. RandomLetter()
        else
            plate = plate .. charType
        end
    end

    local result = fetchPlate(plate)
    if result then
        return GeneratePlate() -- retry if already exists
    else
        return plate
    end
end