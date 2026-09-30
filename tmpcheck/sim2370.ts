import { computeBenefitAmount } from "../src/routes/admin.contracts.client-contracts";
const comps=[["Basic",7722],["HRA 40% (Basic+DA) Exact",3088.8],["OA",4000],["Transportation Allowance",950],["Hardship Allowance",500],["WA",1250],["Bonus / Exgratia 8.33% (Basic+DA) Exact",643.24],["Leave with Wages 5% (Basic+DA)",386.1]].map(([name,amount]:any)=>({name,amount,allowanceId:null}));
const epfPreset='{"base":{"kind":"composite","components":[{"name":"Gross","operator":"+"},{"name":"HRA 40% (Basic+DA)","operator":"-"},{"name":"WA","operator":"-"},{"name":"Bonus / Exgratia 8.33% (Basic+DA) Rounded","operator":"-"},{"name":"Leave with Wages 5% (Basic+DA)","operator":"-"}]},"operator":"percent","multipliers":[],"percent":13}';
const mk=(name:string,calcType:string,amount:number,mode:any,expr:any)=>({name,calcType,amount,percentage:0,baseComponents:[],capAmount:null,capFlatAmount:null,formulaMode:mode,formulaExpression:expr,costComponentId:name});
const emp=[mk("ER EPF","percentage",1712,"preset",epfPreset),mk("ER ESIC 3.25% (Gross-WA)","percentage",562,"advanced","(gross - wa) * 0.0325"),mk("Uniform Charges","fixed",400,"preset",null),mk("Service Charge (Fixed)","fixed",850,"preset",null),mk("Reliever Charges 1/6th (Total CTC)","percentage",3677,"advanced","total_ctc / 6")];
const first=emp.map(b=>b.name.startsWith("Reliever")?b:({...b,amount:(b.calcType==="percentage"||b.formulaExpression)?computeBenefitAmount(b as any,comps as any,[],[]):b.amount}));
console.log(first.map(b=>[b.name,b.amount]));
const base=first.filter(b=>!b.name.startsWith("Reliever"));
const rel=computeBenefitAmount(emp[4] as any,comps as any,[],[],base as any);
console.log("reliever",rel, "total", comps.reduce((s,c:any)=>s+c.amount,0)+base.reduce((s,b)=>s+b.amount,0)+rel);
import { formulaReferencesCtc } from "../src/routes/admin.contracts.client-contracts";
// replicate the editor effect exactly
const refs=(b:any)=>formulaReferencesCtc(b.formulaExpression);
const fp=emp.map(b=>(b.calcType==="percentage"||b.formulaExpression)&&!refs(b)?{...b,amount:computeBenefitAmount(b as any,comps as any,[],[])}:b);
const cb=fp.filter(b=>!refs(b)&&!/management\s*fee/i.test(b.name));
const out=fp.map(b=>(b.calcType==="percentage"||b.formulaExpression)&&refs(b)?{...b,amount:computeBenefitAmount(b as any,comps as any,[],[],cb as any)}:b);
const monthly=comps.reduce((s,c:any)=>s+c.amount,0)+out.reduce((s,b)=>s+b.amount,0);
console.log("EDITOR: reliever",out[4].amount,"monthly",monthly.toFixed(2),"per day @30.40",(monthly/30.4).toFixed(2));
console.log("old regex matched total_ctc?", /\bctc\b/i.test("total_ctc / 6"), "new:", formulaReferencesCtc("total_ctc / 6"), formulaReferencesCtc("(total_ctc + total_ctc * 0.1667) * 0.07"), formulaReferencesCtc("ctc*0.1"), formulaReferencesCtc("abctc"));
