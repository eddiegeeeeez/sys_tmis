import{c as n,a as e}from"./index-COn2AFnq.js";/**
 * @license lucide-react v0.574.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const c=[["path",{d:"M16 10a4 4 0 0 1-8 0",key:"1ltviw"}],["path",{d:"M3.103 6.034h17.794",key:"awc11p"}],["path",{d:"M3.4 5.467a2 2 0 0 0-.4 1.2V20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6.667a2 2 0 0 0-.4-1.2l-2-2.667A2 2 0 0 0 17 2H7a2 2 0 0 0-1.6.8z",key:"o988cm"}]],s=n("shopping-bag",c),i=async()=>{const{data:t}=await e.get("inventory/products");return t.data.filter(a=>a.stock>0).map(a=>({id:String(a.id),name:a.name,category:a.category,price:a.sellingPrice,stock:a.stock,sku:a.sku,reorderLevel:a.reorderLevel??0,unitOfMeasure:a.unitOfMeasure??"pcs",image:a.imageUrl??void 0}))},r=async t=>{const{data:a}=await e.post("transaction",t);return a.data},d=async t=>{const{data:a}=await e.get("transaction",{params:{...t,pageSize:(t==null?void 0:t.pageSize)??500}});return a.data??[]},g=async t=>{const{data:a}=await e.patch(`transaction/${t}/void`,{});return a.data};export{s as S,r as c,i as f,d as g,g as v};
