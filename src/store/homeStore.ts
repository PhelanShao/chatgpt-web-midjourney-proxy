import { gptsType, mlog } from '@/api';
import { reactive } from 'vue'
import { ss } from '@/utils/storage'
import { useUserSettingStore } from '@/store/modules/user_setting';

// 声明TAURI全局变量
declare global {
    interface Window {
        __TAURI__: any;
    }
}

export const homeStore = reactive({
    myData:{
        act:'',//动作
        act2:'',//动作
        actData:{} //动作类别 
        ,local:'' //当前所处的版本
        ,session:{} as any
        ,isLoader:false
        ,vtoken:'' //turnstile token
        ,ctoken:'' //cookie
        ,isClient: typeof window !== 'undefined' && window.__TAURI__
        ,ms:{} as any
        ,is_luma_pro:false
        ,is_viggle_pro:false
       
    }
    
    ,setMyData( v:object){
        this.myData={...this.myData,...v}; 
        if( Object.keys(v).indexOf('act')>-1){ 
            setTimeout(()=> {
                this.myData.act=''
                this.myData.actData=''
            }, 2000 );
        }
        if( Object.keys(v).indexOf('act2')>-1){ 
            setTimeout(()=> {
                this.myData.act2=''
                this.myData.actData=''
            }, 500 );
        }
    }
 
})

export interface gptConfigType{
    model:string
    max_tokens:number
    userModel?:string //自定义
    talkCount:number //联系对话
    systemMessage:string //自定义系统提示语
    gpts?:gptsType
    uuid?:number
    temperature?:number // 随机性 : 值越大，回复越随机
    top_p?:number // 核采样 : 与随机性类似，但不要和随机性一起更改
    frequency_penalty?:number
    presence_penalty?:number
    tts_voice?:string //TTS 人物
}
const getGptInt= ():gptConfigType =>{
    let v:gptConfigType=getDefault();
    let str = localStorage.getItem('gptConfigStore');
    if(str){
        let old = JSON.parse(str);
        if(old) v={...v,...old};
    }
    return v;
}

const  getDefault=()=>{
const amodel = homeStore.myData.session.amodel??'gpt-3.5-turbo'
let v:gptConfigType={
        model: amodel,
        max_tokens:1024,
        userModel:'',
        talkCount:10,
        systemMessage:'',
        temperature:0.5,
        top_p:1,
        presence_penalty:0,
        frequency_penalty:0,
        tts_voice:"alloy"
    }
    return v ;
}
export const gptConfigStore= reactive({
    myData:getGptInt(),
    setMyData(v: Partial<gptConfigType>){

         this.myData={...this.myData,...v}; 
         //mlog('gptConfigStore', v )
         if(v.model && !v.gpts) this.myData.gpts=undefined;

         localStorage.setItem('gptConfigStore', JSON.stringify( this.myData));
    }
    ,setInit(){
        this.setMyData(getDefault());
    }
})


export interface gptServerType{
    OPENAI_API_KEY:string
    OPENAI_API_BASE_URL:string
    MJ_SERVER:string
    MJ_API_SECRET:string
    UPLOADER_URL:string
    MJ_CDN_WSRV?:boolean //wsrv.nl
    SUNO_SERVER:string
    SUNO_KEY:string
    LUMA_SERVER:string
    LUMA_KEY:string
    VIGGLE_SERVER:string
    VIGGLE_KEY:string
    RUNWAY_SERVER:string
    RUNWAY_KEY:string
    IDEO_SERVER:string
    IDEO_KEY:string
    KLING_SERVER:string
    KLING_KEY:string
    PIKA_SERVER:string
    PIKA_KEY:string
    UDIO_SERVER:string
    UDIO_KEY:string
    PIXVERSE_SERVER:string
    PIXVERSE_KEY:string
    IS_SET_SYNC?:boolean
    GPTS_GX?:boolean
    IS_LUMA_PRO?:boolean
    RRUNWAY_VERSION?:string
    DRAW_TYPE?:string
    IS_VIGGLE_PRO?:boolean
    TAB_VIDEO?:string
    TTS_VOICE?:string
    REALTIME_SYSMSG?:string
    REALTIME_MODEL?:string
    REALTIME_IS_WHISPER?:boolean 
    TAB_MUSIC?:string

}

const  getServerDefault=()=>{
let v:gptServerType={
        OPENAI_API_KEY:'',
        OPENAI_API_BASE_URL:'',
        MJ_SERVER:'',
        UPLOADER_URL:'',
        MJ_API_SECRET:'',
        SUNO_KEY:'',
        SUNO_SERVER:'',
        MJ_CDN_WSRV:false
        ,IS_SET_SYNC:true,
        LUMA_SERVER:'',
        LUMA_KEY:'',
        VIGGLE_SERVER:'',
        VIGGLE_KEY:'',
        TAB_VIDEO:'luma',
        RUNWAY_SERVER:'',
        RUNWAY_KEY:'',
        IDEO_SERVER:'',
        IDEO_KEY:'',
        KLING_SERVER:'',
        KLING_KEY:'',
        PIKA_SERVER:'',
        PIKA_KEY:'',
        TTS_VOICE:'alloy',
        UDIO_SERVER:'',
        UDIO_KEY:'',
        PIXVERSE_SERVER:'',
        PIXVERSE_KEY:''
    }
    return v ;
}
const getServerInit= ():gptServerType =>{
    console.log('初始化服务器设置');
    let v:gptServerType=getServerDefault();
    console.log('默认服务器设置:', {
        OPENAI_API_KEY: v.OPENAI_API_KEY ? '***' : '',
        OPENAI_API_BASE_URL: v.OPENAI_API_BASE_URL
    });
    
    try {
        // 尝试从用户设置中获取API设置
        console.log('尝试从用户设置中获取API设置');
        const userSettingStore = useUserSettingStore();
        if (userSettingStore) {
            console.log('用户设置存储获取成功');
            if (userSettingStore.api_settings) {
                console.log('找到用户API设置:', {
                    OPENAI_API_KEY: userSettingStore.api_settings.OPENAI_API_KEY ? '***' : '',
                    OPENAI_API_BASE_URL: userSettingStore.api_settings.OPENAI_API_BASE_URL
                });
                v = {...v, ...userSettingStore.api_settings};
            } else {
                console.log('用户API设置为空');
            }
        } else {
            console.log('用户设置存储为空');
        }
    } catch (error) {
        console.error('获取用户API设置失败:', error);
    }
    
    console.log('最终服务器设置:', {
        OPENAI_API_KEY: v.OPENAI_API_KEY ? '***' : '',
        OPENAI_API_BASE_URL: v.OPENAI_API_BASE_URL
    });
    return v;
}

export const gptServerStore= reactive({
    myData:getServerInit(),
    setMyData(v: Partial<gptServerType>){
         this.myData={...this.myData,...v};
         
         try {
             // 保存到用户设置
             const userSettingStore = useUserSettingStore();
             if (userSettingStore) {
                 userSettingStore.saveApiSettings(this.myData);
             }
         } catch (error) {
             console.error('保存用户API设置失败:', error);
         }
    }
    ,setInit(){
        this.setMyData(getServerDefault());
    }
    // 重新加载用户的API设置
    ,reloadUserSettings() {
        console.log('开始重新加载用户的API设置');
        const oldSettings = { ...this.myData };
        this.myData = getServerInit();
        console.log('API设置重新加载完成', {
            old: {
                OPENAI_API_KEY: oldSettings.OPENAI_API_KEY ? '***' : undefined,
                OPENAI_API_BASE_URL: oldSettings.OPENAI_API_BASE_URL
            },
            new: {
                OPENAI_API_KEY: this.myData.OPENAI_API_KEY ? '***' : undefined,
                OPENAI_API_BASE_URL: this.myData.OPENAI_API_BASE_URL
            }
        });
    }
})


const gptsUlistInit= ():gptsType[]=>{
    const lk= ss.get('gpts-use-list');
    if( !lk) return [];
    return lk as gptsType[]; 
}

//使用gtps列表
export const gptsUlistStore= reactive({
    myData:gptsUlistInit(),
    setMyData( v: gptsType){
        this.myData= this.myData.filter( v2=> v2.gid!=v.gid );
        this.myData.unshift(v);
        ss.set('gpts-use-list', this.myData );
        return this;
    }
});