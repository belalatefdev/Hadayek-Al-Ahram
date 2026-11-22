import {useState} from "react";
import {View,Text,TextInput,Pressable,ScrollView,StyleSheet,ActivityIndicator,KeyboardAvoidingView,Platform} from "react-native";
type Message={role:"user"|"assistant";content:string};
export default function Support(){
const [text,setText]=useState("");
const [messages,setMessages]=useState<Message[]>([{role:"assistant",content:"أهلاً بيك في دعم حدائق الأهرام. اكتب سؤالك."}]);
const [busy,setBusy]=useState(false);
const send=async()=>{
 const q=text.trim();if(!q||busy)return;
 setText("");const next=[...messages,{role:"user" as const,content:q}];setMessages(next);setBusy(true);
 try{
  const response=await fetch("https://hadayek-al-ahram.vercel.app/api/support-chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:next.slice(-12)})});
  const data=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(data.error||"الخدمة مشغولة حاليًا. حاول بعد قليل.");
  const reply=data.reply||data.message;
  setMessages([...next,{role:"assistant",content:typeof reply==="string"&&reply.trim()?reply:"لم يصل رد. حاول مرة أخرى."}]);
 }catch(e:any){
  setMessages([...next,{role:"assistant",content:e?.message||"تعذر الاتصال بالدعم حاليًا. حاول مرة أخرى."}]);
 }finally{setBusy(false);}
};
return <KeyboardAvoidingView style={s.root} behavior={Platform.OS==="ios"?"padding":undefined}><Text style={s.title}>الدعم الفني</Text><ScrollView style={s.messages} contentContainerStyle={{paddingBottom:10}}>{messages.map((m,i)=><View key={i} style={[s.bubble,m.role==="user"?s.user:s.bot]}><Text style={s.msg}>{m.content}</Text></View>)}</ScrollView>{busy?<ActivityIndicator style={{marginBottom:8}} color="#D9AD43"/>:null}<View style={s.row}><TextInput style={s.input} value={text} onChangeText={setText} placeholder="اكتب سؤالك..." editable={!busy} multiline/><Pressable style={[s.send,busy&&{opacity:.6}]} disabled={busy||!text.trim()} onPress={send}><Text style={s.sendTxt}>{busy?"...":"إرسال"}</Text></Pressable></View></KeyboardAvoidingView>}
const s=StyleSheet.create({root:{flex:1,backgroundColor:"#F5F7FA",padding:15},title:{fontSize:23,fontWeight:"900",color:"#102B4D",textAlign:"right",marginBottom:12},messages:{flex:1},bubble:{padding:12,borderRadius:13,marginVertical:6,maxWidth:"86%"},user:{alignSelf:"flex-start",background:"#DCE8F4"},bot:{alignSelf:"flex-end",background:"#FFF",borderColor:"#E4EAF1",borderWidth:1},msg:{fontSize:13,color:"#213B57",textAlign:"right",lineHeight:22},row:{flexDirection:"row",gap:8,paddingTop:12,alignItems:"center"},input:{flex:1,background:"#FFF",borderWidth:1,borderColor:"#E1E7EE",borderRadius:10,paddingHorizontal:12,paddingVertical:10,textAlign:"right",color:"#102B4D",maxHeight:120},send:{background:"#102B4D",borderRadius:10,paddingHorizontal:16,justifyContent:"center",alignSelf:"stretch"},sendTxt:{color:"#FFF",fontWeight:"800"}});