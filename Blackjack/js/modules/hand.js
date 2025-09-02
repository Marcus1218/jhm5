// 手牌計算
export function handValue(cards){
  let total = 0;
  let aces = 0;
  for(const c of cards){
    if(c.rank==='A'){aces++; total += 11;} else if(['K','Q','J'].includes(c.rank)){ total += 10;} else { total += parseInt(c.rank); }
  }
  while(total>21 && aces>0){
    total -=10; aces--; // 將一個 A 從 11 調為 1
  }
  const soft = cards.some(c=>c.rank==='A') && cards.reduce((sum,c)=>sum+(c.rank==='A'?1:0),0) > (cards.reduce((sum,c)=>sum+(c.rank==='A'?1:0),0) - (11*cards.filter(c=>c.rank==='A').length - (total - cards.filter(c=>c.rank==='A').length))) && total<=21 && hasAceCountedAs11(cards, total);
  return { value: total, soft };
}

function hasAceCountedAs11(cards,total){
  // 簡化：重新計算，若有一個 A 作 11 且不爆就是 soft
  let tmp=0; let aces=0; let soft=false;
  for(const c of cards){
    if(c.rank==='A'){aces++; tmp+=11;}
    else if(['K','Q','J'].includes(c.rank)) tmp+=10; else tmp+=parseInt(c.rank);
  }
  while(tmp>21 && aces>0){ tmp-=10; aces--; }
  // 如果還有至少一個 A 仍為 11 (即 aces 原始數減去調整次數 >0) 則 soft
  // 為簡化改寫：用標準判斷：存在 A 且 total<=21 且 total-10 >=2 (因為 A 改成1會少10) 且 total-10 < total
  return cards.some(c=>c.rank==='A') && total<=21 && (total-10)>=2 && (total-10) < total;
}

export function isBlackjack(cards){
  return cards.length===2 && handValue(cards).value===21;
}

export function isBust(cards){
  return handValue(cards).value>21;
}

