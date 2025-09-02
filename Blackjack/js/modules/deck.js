// 牌組與洗牌
export function createShoe(numDecks=4){
  const ranks = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
  const suits = ['S','H','D','C']; // Spade Heart Diamond Club
  const shoe = [];
  for(let d=0; d<numDecks; d++){
    for(const s of suits){
      for(const r of ranks){
        shoe.push(makeCard(r,s));
      }
    }
  }
  // 洗牌 Fisher-Yates
  for(let i=shoe.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [shoe[i], shoe[j]] = [shoe[j], shoe[i]];
  }
  return shoe;
}

function makeCard(rank, suit){
  const value = rank==='A'?11: (['K','Q','J'].includes(rank)?10: parseInt(rank));
  return { rank, suit, value, display: rank };
}

export function drawCard(shoe){
  if(shoe.length===0) throw new Error('shoe empty');
  return shoe.pop();
}

