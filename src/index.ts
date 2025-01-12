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
    SimpleFormSession,
    InternalPermission
} from "../lib/index.js";
import {data_path} from "../lib/plugin_info.js"
const globalConf = new JsonFile(data_path+"/config.json");
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
        case "plcmd":
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
        permission: false, 
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
let menusConf:any[]=menucontents.get("menus")
function reloadMenus(){
    menucontents.reload()
    menusConf=menucontents.get("menus")
}
function getMenu(name:string):MenuConfig{
    for(let menuConf of menusConf){
        const menu=menuConfFromConfig(menuConf)                    
        if (menu.name == name) return menu
    }
    throw new Error("找不到菜单"+name)
}

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
                player.teleport(Location.new(520, 69.5, 118,new Dimension(FMPDefaultDimension.Overworld)));
                player.tell(`§a已将您传送至起始点`);
            }  		
            else if (result.params.get("shop")?.value == "shop") {
                //shopForm(origin.player);
                tellExecutor(result.executor,"请为此指令设置跳转到专门商店菜单的功能")
            }
            else form(getMenu("main"),player);
        }
		else if (result.params.get("reload")?.value == "reload") {
			if (result.params.get("reloadtype")?.value == "menu") {
				reloadMenus();
				tellExecutor(result.executor,"菜单重载完成")
			}
			if (result.params.get("reloadtype")?.value == "shop") {
                tellExecutor(result.executor,"请完善此功能")
				//shopReload(origin.player);

			}
		}
        else{
            Logger.error("该指令为打开菜单指令，只能加入游戏并在游戏内使用")
        }
    },InternalPermission.Any
)

//主菜单ui

function form(menu:MenuConfig,playerOrSession:Player|SimpleFormSession) {
    const player:Player=playerOrSession instanceof Player?playerOrSession:playerOrSession.player
    let currentSession:SimpleFormSession
    const buttons:SimpleFormButton[]=[]
	menu.contents.forEach((button) => buttons.push(new SimpleFormButton(button.title,button.title,session=>{
        /**这些动作中命令是否仍然在成功执行。如果有一条命令执行失败，此处会被设置为false */
        let cmdsuccess = true;
        button.actions.forEach(action=> {
            switch (action.type) {
                case ButtonActionType.TELL: player.tell(action.value); break;
                case ButtonActionType.PLCMD: player.runCmd(action.value); break;
                case ButtonActionType.CMD: cmdsuccess = runcmd(action.value).success ; break;
                //当之前有命令执行失败时，则不执行该命令
                case ButtonActionType.CONDCMD:if (cmdsuccess) cmdsuccess = runcmd(action.value).success;  break;
                case ButtonActionType.FORM: form(getMenu(action.value), currentSession);break;
            }
        })
    })))
    currentSession=new SimpleFormSession(new SimpleForm(menu.title,menu.caption,buttons),playerOrSession)
    currentSession.send()
}
