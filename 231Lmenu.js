ll.registerPlugin("231Lmenu", "231L专用主菜单插件", [0, 1, 1]);
const globalConf = new JsonConfigFile("plugins\\231menu\\config.json");
const menucontents = new JsonConfigFile("plugins\\231menu\\menu.json");
menucontents.init("menus", [{ name: "main", permission: 0, title: "", caption: "", contents: [{ name: "", title: "", action: [{type:"tell",value:""}]}] }])
/*mc.regPlayerCmd(`231l spawn`, `§6前往起始点`, (player) => {
	player.teleport(520, 69.5, 118, 0);
    player.tell(`§a已将您传送至起始点`);
}, 0)
mc.regPlayerCmd(`231l`, `服务器主菜单`, (player) => {
	aNewForm(player)
}, 0)*/
//主菜单ui
mc.listen("onServerStarted",()=>{
	let maincmd = mc.newCommand("231l", "231L主菜单", PermType.Any)
	maincmd.setEnum("spawn", ["spawn"])
	maincmd.setEnum("reload", ["reload"])
	maincmd.setEnum("shop", ["shop"])
	maincmd.setEnum("reloadtype", ["menu","shop"])
	maincmd.mandatory("spawn", ParamType.Enum, "spawn")
	maincmd.mandatory("reload", ParamType.Enum, "reload")
	maincmd.mandatory("reloadtype", ParamType.Enum, "reloadtype")
	maincmd.mandatory("shop", ParamType.Enum, "shop")
	maincmd.overload([])
	maincmd.overload(["spawn"])
	maincmd.overload(["reload", "reloadtype"])
	maincmd.overload(["shop"])
	maincmd.setCallback((cmd, origin, output, results) => {
		if (results.spawn == "spawn" && origin.type==0) {
			origin.player.teleport(520, 69.5, 118, 0);
			origin.player.tell(`§a已将您传送至起始点`);
		}
		else if (results.reload == "reload" && origin.type == 0) {
			if (results.reloadtype == "menu") {
				playerreloadmenu(origin.player);
				
			}
			if (results.reloadtype == "shop") {
				//shopReload(origin.player);

			}
		}
		else if (results.shop == "shop" && origin.type == 0) {
			//shopForm(origin.player);
		}
		else {
			menucontents.get("menus").forEach((currentValue, index) => {
				if (currentValue.name == "main") {
					form(currentValue,origin.player);
				}
			});
		}
	})
	maincmd.setup();	
})

function form(menu,player) {
	let fm = mc.newSimpleForm();
	fm.setTitle(menu.title);
	fm.setContent(menu.caption)
	menu.contents.forEach((currentValue, index) => {
		fm.addButton(currentValue.title)
	})
	player.sendForm(fm, (player, id) => {
		if (id != null) {
			let cmdsuccess = true;
			menu.contents[id].action.forEach((currentValue, index) => {
				switch (currentValue.type) {
					case "tell": player.tell(currentValue.value); break;
					case "plcmd": mc.runcmdEx(`execute as ${player.realName} at @s run ${currentValue.value}`); break;
					case "plcmdex": player.runcmd(currentValue.value); break;
					case "cmd": cmdsuccess = mc.runcmdEx(currentValue.value).success ; break;
					case "condcmd": if (cmdsuccess) { cmdsuccess = mc.runcmdEx(currentValue.value).success; } break;
					case "fm": {
						menucontents.get("menus").forEach((currentValue1, index) => {
							if (currentValue1.name == currentValue.value ) {
								form(currentValue1, player);
							}
						});
						break;
					}
				}
			})
		}
	})
}
function aNewForm(player){
    let fm = mc.newSimpleForm()
    fm.setTitle("231L")
    fm.setContent("")
    fm.addButton('传送')
    fm.addButton('签到')
	fm.addButton('个人信息')
	fm.addButton('商店')
    player.sendForm(fm, function (player,id) {
		switch(id){
			case 0:tpform(player);break;
			case 1:player.runcmd(`signin`);break;
			case 2:information(player);break;
			case 3:shopForm(player);break;
		}
    })
}
//个人信息
function information(player){
	infofm=mc.newSimpleForm()
	infofm.setTitle(`${player.realName}的个人信息`)
	infofm.setContent(`您当前拥有${mc.getScoreObjective("integral").getScore(player)}积分`)
	player.sendForm(infofm,function(player,id){})
}
//传送ui
function tpform(player){
	tpfm=mc.newSimpleForm()
	tpfm.addButton('主城')
	tpfm.addButton('起始点')
	player.sendForm(tpfm,function(player,id){
		if(id==0){
			player.teleport(-7068.5, 70, 1994.5, 0);
			player.tell(`§a已将您传送至主城`);			
		}
		if(id==1){
			player.teleport(520, 69.5, 118, 0);
			player.tell(`§a已将您传送至起始点`);			
		}		
	})
}
function playerreloadmenu(player) {
	if (menucontents.reload()) {
		player.tell(`§a重载完成，请留意后台报错信息`);
	} else {
		player.tell(`§a无法重载菜单内容`);
	}
}
//商店
const shopContentsfile=new JsonConfigFile("plugins\\231Essentials\\features\\shop\\contents.json");
let shopContents = JSON.parse(shopContentsfile.read());
//重载

function shopReload(player) {
	if(shopContentsfile.reload()){
		player.tell(`§a重载完成，请留意后台报错信息`);
	}else{
		player.tell(`§a无法重载商店内容`);
	}
	if(shopContentsfile.reload()){
		player.tell(`§a重载完成，请留意后台报错信息`);
	}else{
		player.tell(`§a无法重载商店内容`);
	}
	shopContents = JSON.parse(shopContentsfile.read());
}
/*mc.regPlayerCmd(`231e shop reload`, `重载商店内容`, (player) => {

}, 1)*/
//商店ui
function shopForm(player){
	let shopfm=mc.newSimpleForm()
	for(i=0;i<shopContents.shopsorts.length;i++){
		shopfm.addButton(shopContents.shopsorts[i].sort)
	}

	player.sendForm(shopfm, function (player,id) {
		if(id==null){
			player.runcmdEx("231l")
			return;
		}	
		shopForm1(player,id);
	})
}
function shopForm1(player,sort){
	let shopfm1=mc.newSimpleForm()
	for(i=0;i<shopContents.shopsorts[sort].contents.length;i++){
		shopfm1.addButton(`${shopContents.shopsorts[sort].contents[i].name}:${shopContents.shopsorts[sort].contents[i].price}积分`)
	}
	player.sendForm(shopfm1, function (player,id) {
		if(id==null){
			shopForm(player)
			return;
		}		
		//纯指令购买
		mc.runcmdEx(`tag @p[name="${player.realName}",scores={integral=${shopContents.shopsorts[sort].contents[id].price}..}] add affordable`);
		mc.runcmdEx(`scoreboard players remove @a[name="${player.realName}",tag=affordable] integral ${shopContents.shopsorts[sort].contents[id].price}`);
		mc.runcmdEx(`give @a[name="${player.realName}",tag=affordable] ${shopContents.shopsorts[sort].contents[id].type}`);
		mc.runcmdEx(`tell @a[name="${player.realName}",tag=affordable] 购买成功`);
		mc.runcmdEx(`tell @a[name="${player.realName}",tag=!affordable] 您的余额不足`);
		mc.runcmdEx(`tag @a[name="${player.realName}",tag=affordable] remove affordable`);
	})
}




/*function shopForm(player){
	let fm=mc.newSimpleForm()
	fm.setTitle("231L")
    fm.setContent("")
    fm.addButton('购买飞机')
    fm.addButton('购买汽车')
	fm.addButton('购买尖啸体激活券')
	//fm.addButton('购买刷怪笼和刷怪蛋')
    player.sendForm(fm, function (player,id) {
		if(id==0){
			let plane=mc.newSimpleForm()
			plane.setTitle("231L")
			plane.setContent('购买zern飞机')		
			plane.addButton('小飞机：80000积分')
			plane.addButton('两栖飞机：90000积分')
			plane.addButton('直升机；65000积分')
			player.sendForm(plane, function(player,id){
				if(id==0){
					//纯指令商店
					mc.runcmdEx(`tag @p[name="${player.realName}",scores={integral=80000..}] add affordable`);
					mc.runcmdEx(`scoreboard players remove @a[name="${player.realName}",tag=affordable] integral 80000`);
					mc.runcmdEx(`give @a[name="${player.realName}",tag=affordable] zern:small_plane_spawn_egg`);
					mc.runcmdEx(`tell @a[name="${player.realName}",tag=affordable] 购买成功`);
					mc.runcmdEx(`tell @a[name="${player.realName}",tag=!affordable] 您的余额不足`);
					mc.runcmdEx(`tag @a[name="${player.realName}",tag=affordable] remove affordable`);
				}
				if(id==1){
					//纯指令商店
					mc.runcmdEx(`tag @p[name="${player.realName}",scores={integral=90000..}] add affordable`);
					mc.runcmdEx(`scoreboard players remove @a[name="${player.realName}",tag=affordable] integral 90000`);
					mc.runcmdEx(`give @a[name="${player.realName}",tag=affordable] zern:seaplane_spawn_egg`);
					mc.runcmdEx(`tell @a[name="${player.realName}",tag=affordable] 购买成功`);
					mc.runcmdEx(`tell @a[name="${player.realName}",tag=!affordable] 您的余额不足`);
					mc.runcmdEx(`tag @a[name="${player.realName}",tag=affordable] remove affordable`);
				}	
				if(id==2){
					//纯指令商店
					mc.runcmdEx(`tag @p[name="${player.realName}",scores={integral=65000..}] add affordable`);
					mc.runcmdEx(`scoreboard players remove @a[tag=affordable] integral 65000`);
					mc.runcmdEx(`give @a[name="${player.realName}",tag=affordable] zern:helicopter_spawn_egg`);
					mc.runcmdEx(`tell @a[name="${player.realName}",tag=affordable] 购买成功`);
					mc.runcmdEx(`tell @a[name="${player.realName}",tag=!affordable] 您的余额不足`);
					mc.runcmdEx(`tag @a[tag=affordable] remove affordable`);
				}	
				if(id==null){
					shopForm(player);
				}
			})
		}
		if(id==1){
			let car=mc.newSimpleForm()
			car.setTitle("231L")
			car.setContent('购买lanevo3汽车')		
			car.addButton('小黄车：20000积分')
			car.addButton('红色小轿车：20000积分')
			car.addButton('白色低级车：20000积分')
			car.addButton('黑色高级车：20000积分')
			player.sendForm(car, function(player,id){
				if(id==0){
					//纯指令商店
					mc.runcmdEx(`tag @p[name="${player.realName}",scores={integral=20000..}] add affordable`);
					mc.runcmdEx(`scoreboard players remove @a[name="${player.realName}",tag=affordable] integral 20000`);
					mc.runcmdEx(`give @a[name="${player.realName}",tag=affordable] lanevo3:yellow1_spawn_egg`);
					mc.runcmdEx(`tell @a[name="${player.realName}",tag=affordable] 购买成功`);
					mc.runcmdEx(`tell @a[name="${player.realName}",tag=!affordable] 您的余额不足`);
					mc.runcmdEx(`tag @a[name="${player.realName}",tag=affordable] remove affordable`);
				}
				if(id==1){
					//纯指令商店
					mc.runcmdEx(`tag @p[name="${player.realName}",scores={integral=20000..}] add affordable`);
					mc.runcmdEx(`scoreboard players remove @a[name="${player.realName}",tag=affordable] integral 20000`);
					mc.runcmdEx(`give @a[name="${player.realName}",tag=affordable] lanevo3:red1_spawn_egg`);
					mc.runcmdEx(`tell @a[name="${player.realName}",tag=affordable] 购买成功`);
					mc.runcmdEx(`tell @a[name="${player.realName}",tag=!affordable] 您的余额不足`);
					mc.runcmdEx(`tag @a[name="${player.realName}",tag=affordable] remove affordable`);
				}	
				if(id==2){
					//纯指令商店
					mc.runcmdEx(`tag @p[name="${player.realName}",scores={integral=20000..}] add affordable`);
					mc.runcmdEx(`scoreboard players remove @a[name="${player.realName}",tag=affordable] integral 20000`);
					mc.runcmdEx(`give @a[name="${player.realName}",tag=affordable] lanevo3:white1_spawn_egg`);
					mc.runcmdEx(`tell @a[name="${player.realName}",tag=affordable] 购买成功`);
					mc.runcmdEx(`tell @a[name="${player.realName}",tag=!affordable] 您的余额不足`);
					mc.runcmdEx(`tag @a[name="${player.realName}",tag=affordable] remove affordable`);
				}	
				if(id==3){
					//纯指令商店
					mc.runcmdEx(`tag @p[name="${player.realName}",scores={integral=20000..}] add affordable`);
					mc.runcmdEx(`scoreboard players remove @a[name="${player.realName}",tag=affordable] integral 20000`);
					mc.runcmdEx(`give @a[name="${player.realName}",tag=affordable] lanevo3:black1_spawn_egg`);
					mc.runcmdEx(`tell @a[name="${player.realName}",tag=affordable] 购买成功`);
					mc.runcmdEx(`tell @a[name="${player.realName}",tag=!affordable] 您的余额不足`);
					mc.runcmdEx(`tag @a[name="${player.realName}",tag=affordable] remove affordable`);
				}
				if(id==null){
					shopForm(player);
				}
			})		
		}
		if(id==2){
			let sculk=mc.newSimpleForm()
			sculk.setTitle("231L")
			sculk.setContent('购买尖啸体激活券')		
			sculk.addButton('购买尖啸体激活券：1000积分')
			sculk.addButton('查询剩余的尖啸体激活券数量')
			player.sendForm(sculk, function(player,id){
				if(id==0){
					mc.runcmdEx(`tag @p[name="${player.realName}",scores={integral=1000..}] add affordable`);
					mc.runcmdEx(`scoreboard players remove @a[name="${player.realName}",tag=affordable] integral 1000`);
					mc.runcmdEx(`scoreboard players add @a[name="${player.realName}",tag=affordable] sculkactive 1`);
					mc.runcmdEx(`tell @a[name="${player.realName}",tag=affordable] 购买成功`);
					mc.runcmdEx(`tell @a[name="${player.realName}",tag=!affordable] 您的余额不足`);
					mc.runcmdEx(`tag @a[name="${player.realName}",tag=affordable] remove affordable`);	
				}	
				if(id==1){
					mc.runcmdEx(`titleraw "${player.realName}" subtitle {"rawtext":[{"text":"当前拥有的激活券："},{"score":{"name":"*","objective":"sculkactive"}}]}`);
					mc.runcmdEx(`titleraw "${player.realName}" title {"rawtext":[{"text":" "}]}`);
				}
				if(id==null){
					shopForm(player);
				}				
			})
		}
		if(id==3){
			
			shopForm(player);
		}
		if(id==null){
			aNewForm(player);
		}
    })
}*/