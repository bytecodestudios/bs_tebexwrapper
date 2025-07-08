Config = {}

Config.Debug = true

Config.Notify = 'qb' -- Options: 'qb', 'ox'
Config.Keys = 'qb' -- Options: 'qb', 'ox'

-- The permission group required to access the Admin Zone.
Config.AdminPermission = 'admin' -- 'god', 'admin', 'mod'

-- Command to open the shop
Config.OpenCommand = 'diamondshop'
Config.CommandHelp = 'Tebex Wrapper'
Config.Keybind = 'F9'

Config.DefaultGarageForPurchases = 'pillboxgarage'
Config.Packages = {
	-- ["Exact package name from tebex"] = AMOUNT_OF_DIAMONDS
	["1000 Diamond"] = 1000,
}

-- Set to true to enable the test drive feature for vehicles, false to disable it.
Config.TestDriveEnabled = true

-- The location where the test drive vehicle will spawn. The player will be teleported into it.
Config.TestDriveLocation = vector4(-986.77, -2982.61, 13.95, 351.74) -- Default: A parking spot at LSIA

-- Duration in seconds that the test drive vehicle will exist before being automatically deleted.
Config.TestDriveDuration = 10 -- 2 minutes

-- The location where the purchased vehicle will spawn.
Config.SpawnPurchasedVehicleLocation  = vector4(227.28, -801.94, 30.6, 160.27)