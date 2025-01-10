import { FMPDefaultDimension } from "../lib/Game/Dimension.js";
import {Logger,InitEvent, JsonFile,
    File,
    Directory,
    Command,
    CommandParam,
    CommandParamType,
    CommandParamDataType,
    CommandEnum,
    CommandEnumOptions,
    CommandExecutorType,
    Player,
    Location,
    Dimension,
    CommandExecutor,
    SimpleForm,
    SimpleFormButton,
    runcmd,
    SimpleFormSession
} from "../lib/index.js";
import {data_path} from "../lib/plugin_info.js"
const globalConf = new JsonFile(data_path+"/config.json");
/*
class MenuConfig{
    path:string
    content:string
    constructor(path){
        this.path=path
        this.init()
        this.reload()
    }
    init(){
        const lastDir=new Directory(this.path)
        const menuFileName=lastDir.folders[lastDir.folders.length-1]
        lastDir.folders.push("..")
        if(File.ls(lastDir.toString()).includes(menuFileName))return
        File.forceWrite(lastDir.toString(),JSON.stringify(
            [
                { 
                    name: "main", 
                    permission: 0, 
                    title: "", 
                    caption: "", 
                    contents: [
                        { 
                            name: "", 
                            title: "", 
                            action: [
                                {
                                    type:"tell",
                                    value:""
                                }
                            ]
                        }
                    ] 
                }
            ]
        ))
    }
    reload(){
        this.content=File.read(this.path)
    }

}
    */
const menucontents = new JsonFile(data_path+"/menu.json");
function tellExecutor(executor:CommandExecutor,msg:string){
    switch(executor.type){
        case CommandExecutorType.Player:executor.object.tell(msg);break;
        case CommandExecutorType.Console:Logger.info(msg);break;
    }
}

enum ButtonActionType{
    TELL,
    FORM,
    PLCMD,
    CMD,
    CONDCMD
}

function parseButtonActionType(str:string):ButtonActionType{
    switch(str){
        case "tell":return ButtonActionType.TELL;
        case "fm":return ButtonActionType.FORM;
        case "plcmdex":return ButtonActionType.PLCMD;
        case "cmd":return ButtonActionType.CMD
        case "condcmd":return ButtonActionType.CONDCMD
        default:throw new Error("目前还没有完善"+str+"类型表单按钮动作的解析")
    }
}

interface buttonAction{
    type:ButtonActionType,
    value:string
}

interface MenuButton{ 
    name: string, 
    title: string, 
    actions: buttonAction[]
}


interface MenuConfig{ 
    name:string, 
    permission:boolean, 
    title:string, 
    caption:string, 
    contents: MenuButton[] 
}

function menuConfFromConfig(conf:any):MenuConfig{
    const contents:MenuButton[]=[]
    for(let confButton of conf.contents){
        const actions:buttonAction[]=[]
        for(let confAction of confButton.action)actions.push({
            type:parseButtonActionType(confAction.type),
            value:confAction.value
        })
        contents.push({
            name:confButton.name,
            title:confButton.title,
            actions
        })
    }
    return {
        name:conf.name,
        permission:conf.permissoin,
        title:conf.title,
        caption:conf.caption,
        contents
    }
}

menucontents.init("menus",[
    { 
        name: "main", 
        permission: 0, 
        title: "", 
        caption: "", 
        contents: [
            { 
                name: "", 
                title: "", 
                action: [
                    {
                        type:"tell",
                        value:""
                    }
                ]
            }
        ] 
    }
])

const maincmd=new Command(
    "231l",[
        new CommandParam(CommandParamType.Mandatory,"reload",CommandParamDataType.Enum,new CommandEnum("reload", ["reload"]),CommandEnumOptions.Unfold),
        new CommandParam(CommandParamType.Mandatory,"shop",CommandParamDataType.Enum,new CommandEnum("shop", ["shop"]),CommandEnumOptions.Unfold),
        new CommandParam(CommandParamType.Mandatory,"reloadtype",CommandParamDataType.Enum,new CommandEnum("reloadtype", ["menu,shop"]),CommandEnumOptions.Unfold),
        new CommandParam(CommandParamType.Mandatory,"spawn",CommandParamDataType.Enum,new CommandEnum("spawn", ["spawn"]),CommandEnumOptions.Unfold),
    ],[[],["spawn"],["reload", "reloadtype"],["shop"]],
    result=>{
        if(result.executor.type==CommandExecutorType.Player){
            const player:Player=result.executor.object
            if (result.params.get("spawn")?.value == "spawn") {
                player.teleport(new Location(520, 69.5, 118,new Dimension(FMPDefaultDimension.Overworld)));
                player.tell(`§a已将您传送至起始点`);
            }  		
            else if (result.params.get("shop")?.value == "shop") {
                //shopForm(origin.player);
                tellExecutor(result.executor,"请为此指令设置跳转到专门商店菜单的功能")
            }
            else {
                const menusConf:any[]=menucontents.get("menus")
                for(let menuConf of menusConf){
                    const menu=menuConfFromConfig(menuConf)                    
                    if (menu.name == "main") {
                        form(menu,player);
                    }
                }
            }          
        }
		else if (result.params.get("reload")?.value == "reload") {
			if (result.params.get("reloadtype")?.value == "menu") {
                tellExecutor(result.executor,"请完善此功能")
				//playerreloadmenu(origin.player);
				
			}
			if (result.params.get("reloadtype")?.value == "shop") {
                tellExecutor(result.executor,"请完善此功能")
				//shopReload(origin.player);

			}
		}
        else{
            Logger.error("该指令为打开菜单指令，只能加入游戏并在游戏内使用")
        }
    }
)

//主菜单ui

function form(menu:MenuConfig,playerOrSession:Player|SimpleFormSession) {
    const player:Player=playerOrSession instanceof Player?playerOrSession:playerOrSession.player
    const buttons:SimpleFormButton[]=[]
	menu.contents.forEach((button, index) => buttons.push(new SimpleFormButton(button.title,button.title,session=>{
        let cmdsuccess = true;
        button.actions.forEach(action=> {
            switch (action.type) {
                case ButtonActionType.TELL: player.tell(action.value); break;
                //case ButtonActionType.PLCMD: mc.runcmdEx(`execute as ${player.realName} at @s run ${action.value}`); break;
                case ButtonActionType.PLCMD: throw new Error("满月平台需要先新增玩家执行命令api")//player.runcmd(action.value); break;
                case ButtonActionType.CMD: cmdsuccess = runcmd(action.value).success ; break;
                case ButtonActionType.CONDCMD:throw new Error("条件cmd")//if (cmdsuccess) { cmdsuccess = mc.runcmdEx(action.value).success; } break;
                case ButtonActionType.FORM: {
                    const menusConf:any[]=menucontents.get("menus")
                    for(let menuConf of menusConf){
                        const menu=menuConfFromConfig(menuConf)  
                        if (menu.name == action.value ) form(menu, playerOrSession);
                    }
                    break;
                }
            }
        })
    })))
    new SimpleFormSession(new SimpleForm(menu.title,menu.caption),playerOrSession).send()
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