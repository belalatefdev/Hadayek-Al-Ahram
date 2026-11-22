import {useState} from "react";
import {Alert,ScrollView,StyleSheet,Text,TextInput,Pressable,View} from "react-native";
import {supabase} from "../lib/supabase";
const gates=["البوابة الأولى","البوابة الثانية الجديدة","البوابة الثانية القديمة","البوابة الثالثة القديمة","البوابة الثالثة الجديدة","البوابة الرابعة"];
const propertyTypes=["شقة","دوبلكس","فيلا","محل تجاري","أرض","مكتب","عيادة"];
const finishes=["بدون تشطيب","نصف تشطيب","تشطيب كامل","سوبر لوكس"];
export default function AddListing(){
const [title,setTitle]=useState(""),[deal,setDeal]=useState("بيع"),[kind,setKind]=useState("شقة"),[gate,setGate]=useState(gates[0]),[price,setPrice]=useState(""),[area,setArea]=useState(""),[rooms,setRooms]=useState(""),[baths,setBaths]=useState(""),[floor,setFloor]=useState(""),[finish,setFinish]=useState(""),[age,setAge]=useState(""),[name,setName]=useState(""),[phone,setPhone]=useState(""),[address,setAddress]=useState(""),[desc,setDesc]=useState(""),[payment,setPayment]=useState("كاش"),[down,setDown]=useState(""),[years,setYears]=useState(""),[monthly,setMonthly]=useState(""),[busy,setBusy]=useState(false);
const field=(label:string,val:string,set:(v:string)=>void,keyboard:any="default",multiline=false)=><View style={s.field}><Text style={s.label}>{label}</Text><TextInput style={[s.input,multiline&&s.multiline]} value={val} onChangeText={set} placeholder={label} keyboardType={keyboard} multiline={multiline}/></View>;
const chips=(label:string,values:string[],selected:string,onPick:(v:string)=>void)=><View style={s.field}><Text style={s.label}>{label}</Text><View style={s.wrap}>{values.map(x=><Pressable key={x} style={[s.chip,selected===x&&s.active]} onPress={()=>onPick(x)}><Text style={[s.chipText,selected===x&&s.activeText]}>{x}</Text></Pressable>)}</View></View>;
const computedPerMeter=area&&Number(area)>0&&price&&Number(price)>0?Math.round(Number(price)/Number(area)):null;
const submit=async()=>{
if(!supabase){Alert.alert("إعداد ناقص","إعداد Supabase مطلوب.");return;}
if(!title.trim()||!price||!phone.trim()){Alert.alert("بيانات ناقصة","عنوان الإعلان والسعر ورقم الهاتف مطلوب.");return;}
if(!Number.isFinite(Number(price))||Number(price)<=0||area&&(!Number.isFinite(Number(area))||Number(area)<=0)){Alert.alert("بيانات غير صحيحة","راجع السعر والمساحة.");return;}
if(payment==="تقسيط"&&(!down||!years)){Alert.alert("بيانات التقسيط","أدخل المقدم وعدد السنوات.");return;}
setBusy(true);
try{const {data:{user}}=await supabase.auth.getUser();const {error}=await supabase.from("listings").insert({title:title.trim(),deal_type:deal,property_type:kind,gate,price:Number(price),area:area?Number(area):null,bedrooms:rooms?Number(rooms):null,bathrooms:baths?Number(baths):null,phone:phone.trim(),contact_name:name.trim()||null,description:desc.trim()||null,image_urls:[],status:"pending",submitted_by:user?.id||null,submitted_email:user?.email||null,price_unit:"إجمالي العقار",payment_method:payment,down_payment:down?Number(down):null,installment_years:years?Number(years):null,monthly_installment:monthly?Number(monthly):null,floor:floor||null,finishing:finish||null,building_age:age||null,address_details:address||null,price_per_meter:computedPerMeter});if(error)throw error;Alert.alert("تم استلام الإعلان","إعلانك قيد المراجعة وسيظهر بعد موافقة الإدارة.");setTitle("");setPrice("");setArea("");setRooms("");setBaths("");setDesc("");}catch(e:any){Alert.alert("تعذر الإرسال",e?.message||"حدث خطأ، حاول مرة أخرى.");}finally{setBusy(false);}
};
return <ScrollView style={s.page} contentContainerStyle={{padding:18,paddingBottom:40}}>
<Text style={s.title}>أضف عقارك مجانًا</Text><Text style={s.subtitle}>أدخل تفاصيل دقيقة لعرض عقارك بشكل أفضل. الإعلانات مجانية حاليًا وتظهر بعد مراجعة الإدارة.</Text>
{field("عنوان الإعلان",title,setTitle)}
{chips("نوع العملية",["بيع","إيجار"],deal,setDeal)}
{chips("نوع العقار",propertyTypes,kind,setKind)}
{chips("البوابة",gates,gate,setGate)}
{field("السعر الإجمالي بالجنيه",price,setPrice,"numeric")}
{field("المساحة بالمتر²",area,setArea,"numeric")}
{computedPerMeter?<View style={s.calculation}><Text style={s.calculationText}>سعر المتر التقريبي: {new Intl.NumberFormat("ar-EG").format(computedPerMeter)} جنيه/م²</Text></View>:null}
{field("عدد غرف النوم",rooms,setRooms,"numeric")}
{field("عدد الحمامات",baths,setBaths,"numeric")}
{field("الدور",floor,setFloor)}
{chips("التشطيب",finishes,finish,setFinish)}
{field("عمر العقار",age,setAge)}
{field("تفاصيل الموقع (اختياري)",address,setAddress)}
{chips("طريقة الدفع",["كاش","تقسيط"],payment,setPayment)}
{payment==="تقسيط"?<>{field("المقدم بالجنيه",down,setDown,"numeric")}{field("مدة التقسيط بالسنوات",years,setYears,"numeric")}{field("القسط الشهري بالجنيه (إن وجد)",monthly,setMonthly,"numeric")}</>:null}
{field("اسم المعلن",name,setName)}
{field("رقم الهاتف للتواصل",phone,setPhone,"phone-pad")}
{field("وصف العقار",desc,setDesc,"default",true)}
<Pressable style={[s.submit,busy&&s.disabled]} disabled={busy} onPress={submit}><Text style={s.submitText}>{busy?"جارٍ إرسال الإعلان...":"إرسال الإعلان للمراجعة"}</Text></Pressable>
</ScrollView>}
const s=StyleSheet.create({page:{flex:1,backgroundColor:"#F4F7FA"},title:{fontSize:25,fontWeight:"900",color:"#102B4D",textAlign:"right"},subtitle:{color:"#75889E",textAlign:"right",lineHeight:22,marginTop:7,marginBottom:12},field:{marginTop:12},label:{fontSize:12,fontWeight:"800",color:"#345370",textAlign:"right",marginBottom:7},input:{backgroundColor:"#FFF",borderColor:"#E1E8EF",borderWidth:1,borderRadius:11,paddingHorizontal:12,paddingVertical:12,textAlign:"right",color:"#173756",minHeight:46},multiline:{minHeight:115,textAlignVertical:"top"},wrap:{flexDirection:"row",flexWrap:"wrap",gap:7},chip:{paddingHorizontal:12,paddingVertical:10,borderRadius:22,borderWidth:1,borderColor:"#DFE7EE",backgroundColor:"#FFF"},active:{backgroundColor:"#102B4D",borderColor:"#102B4D"},chipText:{fontSize:11,color:"#5F748A"},activeText:{color:"#FFF",fontWeight:"800"},calculation:{marginTop:9,padding:12,backgroundColor:"#FFF7E5",borderRadius:10,borderWidth:1,borderColor:"#F0DFB4"},calculationText:{color:"#916D21",textAlign:"right",fontWeight:"800",fontSize:12},submit:{backgroundColor:"#102B4D",borderRadius:12,padding:16,alignItems:"center",marginTop:24},disabled:{opacity:.65},submitText:{color:"#FFF",fontWeight:"900"},note:{color:"#9A7A3C",fontSize:11,textAlign:"center",marginVertical:14}});
