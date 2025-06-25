fx_version 'cerulean'
game 'gta5'
lua54 'yes'

author 'ButterChilly & Cadburry (Bytecode Studios)'
description 'Tebex Wrapper for your FiveM Server'
version '1.0.0'

shared_scripts {
    '@ox_lib/init.lua',
    'shared/config.lua',
}

client_scripts {
    'bridge/**/client/*.lua',
    'modules/**/client.lua'
}

server_scripts {
    '@oxmysql/lib/MySQL.lua',
    'shared/config_server.lua',
    'bridge/utils/server/*.lua',
    'bridge/**/server/*.lua',
    'modules/**/server.lua'
}

ui_page 'web/build/index.html'

files {
    'web/build/index.html',
    'web/build/**/*',
}