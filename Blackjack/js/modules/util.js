// 通用工具
export function formatCurrency(n){
  const sign = n < 0 ? '-' : '';
  const num = Math.abs(Math.round(n));
  return sign + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function sleep(ms){
  return new Promise(r=>setTimeout(r,ms));
}

export function clone(obj){
  return structuredClone ? structuredClone(obj) : JSON.parse(JSON.stringify(obj));
}

export function sum(arr){
  return arr.reduce((a,b)=>a+b,0);
}
