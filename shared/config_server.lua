Config = {}

-- The permission group required to access the Admin Zone.
Config.AdminPermission = 'admin' -- 'god', 'admin', 'mod'

Config.Packages = {
	-- ["Exact package name from tebex"] = AMOUNT_OF_DIAMONDS
	["1000 Diamond"] = 1000,
}

-- Set to true to enable the test drive feature for vehicles, false to disable it.
Config.TestDriveEnabled = true
-- Duration in seconds that the test drive vehicle will exist before being automatically deleted.
Config.TestDriveDuration = 10 -- 2 minutes


Config.DiscordLog = true

Config.LogUsername = "ByteCode Tebexwrapper"

Config.LogAvatar = 'https://cdn.discordapp.com/attachments/1018410488683560970/1342208293971693732/bytecode-1.png?ex=685cef22&is=685b9da2&hm=1b1dcb48d68663459184aca52d436788007dc6fb90a796e4ae62544e492e70c2&'

Config.Webhook = {
    admin_logs = '',
    error_logs = '',
    purchase_logs = '',
    redeem_logs = '',
    exploit_logs = ''
}