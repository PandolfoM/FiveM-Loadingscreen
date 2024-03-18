local QBCore = exports['qb-core']:GetCoreObject()
local hasDonePreloading = {}

-- init
AddEventHandler('playerConnecting', function(_, _, deferrals)
    local source = source
    local license = QBCore.Functions.GetIdentifier(source, 'license')
    local characters = MySQL.query.await('SELECT * FROM players WHERE license = ?', {license})

    deferrals.handover({
        characters = characters
    })
end)

-- Functions

local function loadHouseData()
    local HouseGarages = {}
    local Houses = {}
    local result = MySQL.Sync.fetchAll('SELECT * FROM houselocations', {})
    if result[1] ~= nil then
        for k, v in pairs(result) do
            local owned = false
            if tonumber(v.owned) == 1 then
                owned = true
            end
            local garage = v.garage ~= nil and json.decode(v.garage) or {}
            Houses[v.name] = {
                coords = json.decode(v.coords),
                owned = v.owned,
                price = v.price,
                locked = true,
                adress = v.label,
                tier = v.tier,
                garage = garage,
                decorations = {}
            }
            HouseGarages[v.name] = {
                label = v.label,
                takeVehicle = garage
            }
        end
    end
    TriggerClientEvent("qb-garages:client:houseGarageConfig", -1, HouseGarages)
    TriggerClientEvent("qb-houses:client:setHouseConfig", -1, Houses)
end

local function GiveStarterItems(source)
    local src = source
    local Player = QBCore.Functions.GetPlayer(src)

    for _, v in pairs(QBCore.Shared.StarterItems) do
        local info = {}
        if v.item == "id_card" then
            info.citizenid = Player.PlayerData.citizenid
            info.firstname = Player.PlayerData.charinfo.firstname
            info.lastname = Player.PlayerData.charinfo.lastname
            info.birthdate = Player.PlayerData.charinfo.birthdate
            info.gender = Player.PlayerData.charinfo.gender
            info.nationality = Player.PlayerData.charinfo.nationality
        elseif v.item == "driver_license" then
            info.firstname = Player.PlayerData.charinfo.firstname
            info.lastname = Player.PlayerData.charinfo.lastname
            info.birthdate = Player.PlayerData.charinfo.birthdate
            info.type = "Class C Driver License"
        end
        Player.Functions.AddItem(v.item, v.amount, false, info)
    end
end

RegisterNetEvent('ecrp-loading:server:loadUserData', function(character)
    local src = source
    if QBCore.Player.Login(src, character.citizenid) then
        repeat
            Wait(10)
        until hasDonePreloading[src]
        -- print('^2[qb-core]^7 ' .. GetPlayerName(src) .. ' (Citizen ID: ' .. character.citizenid ..
        --           ') has succesfully loaded!')
        QBCore.Commands.Refresh(src)
        loadHouseData()
        if Config.SkipSelection then
            local coords = json.decode(character.position)
            TriggerClientEvent('ecrp-loading:client:spawnLastLocation', src, coords, character)
        else
            if GetResourceState('qb-apartments') == 'started' then
                TriggerClientEvent('apartments:client:setupSpawnUI', src, character)
            else
                TriggerClientEvent('qb-spawn:client:setupSpawns', src, character, false, nil)
                TriggerClientEvent('qb-spawn:client:openUI', src, true)
            end
        end
    end
    TriggerEvent("qb-log:server:CreateLog", "joinleave", "Loaded", "green",
        "**" .. GetPlayerName(src) .. "** (" .. (QBCore.Functions.GetIdentifier(src, 'discord') or 'undefined') ..
            " |  ||" .. (QBCore.Functions.GetIdentifier(src, 'ip') or 'undefined') .. "|| | " ..
            (QBCore.Functions.GetIdentifier(src, 'license') or 'undefined') .. " | " .. character.citizenid .. " | " ..
            src .. ") loaded..")
end)

RegisterNetEvent('ecrp-loading:server:createCharacter', function(data)
    local src = source
    local newData = {}
    newData.cid = data.cid
    newData.charinfo = data
    if QBCore.Player.Login(src, false, newData) then
        repeat
            Wait(10)
        until hasDonePreloading[src]
        if Config.StartingApartment then
            local randbucket = (GetPlayerPed(src) .. math.random(1, 999))
            SetPlayerRoutingBucket(src, tonumber(randbucket))
            QBCore.Commands.Refresh(src)
            loadHouseData()
            TriggerClientEvent("ecrp-loading:client:closeNUI", src)
            TriggerClientEvent('apartments:client:setupSpawnUI', src, newData)
            GiveStarterItems(src)
        else
            QBCore.Commands.Refresh(src)
            loadHouseData()
            TriggerClientEvent("ecrp-loading:client:closeNUIdefault", src)
            GiveStarterItems(src)
        end
    end
end)

RegisterNetEvent("ecrp-loading:server:deleteCharacter", function(citizenid)
    local src = source
    QBCore.Player.DeleteCharacter(src, citizenid)
    Wait(500)
    local license = QBCore.Functions.GetIdentifier(src, 'license')
    local characters = MySQL.query.await('SELECT * FROM players WHERE license = ?', {license})
    TriggerClientEvent("ecrp-loading:client:toggleLoading", src, false, characters)
end)

AddEventHandler('QBCore:Server:PlayerLoaded', function(Player)
    Wait(1000) -- 1 second should be enough to do the preloading in other resources
    hasDonePreloading[Player.PlayerData.source] = true
end)

AddEventHandler('QBCore:Server:OnPlayerUnload', function(src)
    hasDonePreloading[src] = false
end)
