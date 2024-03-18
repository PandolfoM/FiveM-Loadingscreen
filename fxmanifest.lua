fx_version 'cerulean'
game 'gta5'

description 'loading screen'
version '1.0.0'

shared_script 'config.lua'
client_script "client/**/*"
server_scripts {'@oxmysql/lib/MySQL.lua', "server/**/*"}

loadscreen 'html/index.html'
ui_page 'html/index.html'

loadscreen_cursor 'yes'
loadscreen_manual_shutdown 'yes'

files {'html/*'}

lua54 'yes'
