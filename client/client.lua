local QBCore = exports['qb-core']:GetCoreObject()

RegisterNetEvent('ecrp-loading:client:closeNUIdefault', function()
    local interior = GetInteriorAtCoords(Config.Interior.x, Config.Interior.y, Config.Interior.z - 18.9)
    LoadInterior(interior)
    while not IsInteriorReady(interior) do
        Wait(1000)
    end
    SetNuiFocus(false, false)
    DoScreenFadeOut(500)
    Wait(2000)
    SetEntityCoords(PlayerPedId(), Config.CharacterCreation.x, Config.CharacterCreation.y, Config.CharacterCreation.z)
    SetEntityHeading(PlayerPedId(), Config.CharacterCreation.w)
    TriggerServerEvent('QBCore:Server:OnPlayerLoaded')
    TriggerEvent('QBCore:Client:OnPlayerLoaded')
    TriggerServerEvent('qb-houses:server:SetInsideMeta', 0, false)
    TriggerServerEvent('qb-apartments:server:SetInsideMeta', 0, 0, false)
    Wait(500)
    SetEntityVisible(PlayerPedId(), true)
    Wait(500)
    DoScreenFadeIn(250)
    TriggerEvent('qb-weathersync:client:EnableSync')
    TriggerEvent('qb-clothes:client:CreateFirstCharacter')
    SendNUIMessage({
        action = "hideui"
    })
end)

RegisterNetEvent('ecrp-loading:client:closeNUI', function()
    SetNuiFocus(false, false)
    SendNUIMessage({
        action = "hideui"
    })
end)

RegisterNetEvent("ecrp-loading:client:toggleLoading", function(bool, characters)
    SetNuiFocus(true, true)
    SendNUIMessage({
        action = "loading",
        bool = bool,
        characters = characters
    })
end)

RegisterNetEvent('ecrp-loading:client:spawnLastLocation', function(coords, cData)
    QBCore.Functions.TriggerCallback('apartments:GetOwnedApartment', function(result)
        local ped = PlayerPedId()
        if result then
            TriggerEvent("apartments:client:SetHomeBlip", result.type)
        end
        SetEntityCoords(ped, coords.x, coords.y, coords.z)
        SetEntityHeading(ped, coords.w)
        FreezeEntityPosition(ped, false)
        SetEntityVisible(ped, true)
        local PlayerData = QBCore.Functions.GetPlayerData()
        local insideMeta = PlayerData.metadata["inside"]
        DoScreenFadeOut(500)

        if insideMeta.house then
            TriggerEvent('qb-houses:client:LastLocationHouse', insideMeta.house)
        elseif insideMeta.apartment.apartmentType and insideMeta.apartment.apartmentId then
            TriggerEvent('qb-apartments:client:LastLocationHouse', insideMeta.apartment.apartmentType,
                insideMeta.apartment.apartmentId)
        else
            SetEntityCoords(ped, coords.x, coords.y, coords.z)
            SetEntityHeading(ped, coords.w)
            FreezeEntityPosition(ped, false)
            SetEntityVisible(ped, true)
        end

        TriggerServerEvent('QBCore:Server:OnPlayerLoaded')
        TriggerEvent('QBCore:Client:OnPlayerLoaded')
        Wait(2000)
        DoScreenFadeIn(250)
    end, cData.citizenid)
end)

-- Callbacks
local ran = false
RegisterNUICallback('createNewCharacter', function(data)
    if not ran then
        ran = true
        local cData = data
        DoScreenFadeOut(250)
        if cData.gender == "male" then
            cData.gender = 0
        elseif cData.gender == "female" then
            cData.gender = 1
        end
        TriggerServerEvent('ecrp-loading:server:createCharacter', cData)
        Wait(500)
    end
end)

RegisterNUICallback('selectCharacter', function(data, cb)
    local character = data.character

    DoScreenFadeOut(250)

    TriggerServerEvent('ecrp-loading:server:loadUserData', character)

    SetNuiFocus(false, false)
    SendNUIMessage({
        action = "hideui"
    })
    cb("ok")
end)

RegisterNUICallback('deleteCharacter', function(data, cb)
    ShutdownLoadingScreenNui()
    TriggerServerEvent('ecrp-loading:server:deleteCharacter', data.citizenid)
    cb("ok")
end)
