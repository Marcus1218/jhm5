// 基礎擴展版 Blackjack 多手 + 功能
import { createShoe, drawCard } from './modules/deck.js';
import { handValue, isBlackjack, isBust } from './modules/hand.js';
import { formatCurrency } from './modules/util.js';

const state = {
  shoe: [],
  numDecks: 4,
  hands: [], // 每手: { cards:[], bet: number, doubled:false, surrendered:false, insuranceBet:0, evenMoney:false, result:null }
  activeHand: 0,
  dealerHand: [],
  bank: 2000,
  currentBet: 0,
  phase: 'bet', // bet | player | dealer | settle | insurance
  insuranceOffered: false,
  stats: { rounds: 0, wins: 0, losses: 0, pushes: 0, blackjack: 0, net: 0 },
  animations:true,
  cardCounter:0,
  renderedCardIds:new Set()
};

// DOM 綁定
const bankAmountEl = document.getElementById('bankAmount');
const dealerHandEl = document.getElementById('dealerHand');
const dealerValueEl = document.getElementById('dealerValue');
const currentBetEl = document.getElementById('currentBet');
const statusMessageEl = document.getElementById('statusMessage');
const statRoundsEl = document.getElementById('statRounds');
const statWinsEl = document.getElementById('statWins');
const statLossesEl = document.getElementById('statLosses');
const statPushesEl = document.getElementById('statPushes');
const statBJEl = document.getElementById('statBJ');
const statNetEl = document.getElementById('statNet');
const strategyHintEl = document.getElementById('strategyHint');

const playerHandsWrap = document.getElementById('playerHands');

const dealBtn = document.getElementById('dealBtn');
const hitBtn = document.getElementById('hitBtn');
const standBtn = document.getElementById('standBtn');
const doubleBtn = document.getElementById('doubleBtn');
const splitBtn = document.getElementById('splitBtn');
const surrenderBtn = document.getElementById('surrenderBtn');
const insuranceBtn = document.getElementById('insuranceBtn');
const evenMoneyBtn = document.getElementById('evenMoneyBtn');
const hintBtn = document.getElementById('hintBtn');
const newRoundBtn = document.getElementById('newRoundBtn');
const resetGameBtn = document.getElementById('resetGameBtn');
const chipBar = document.getElementById('chipBar');
const clearBetBtn = document.getElementById('clearBet');
const animToggleBtn = document.getElementById('animToggleBtn');

function init(){
  loadPersist();
  buildChipButtons();
  freshShoe();
  updateUI();
  attachEvents();
}

function loadPersist(){
  try{
    const saved = JSON.parse(localStorage.getItem('bj_basic_v2'));
    if(saved){
      state.bank = saved.bank ?? state.bank;
      state.stats = saved.stats ?? state.stats;
    }
  }catch(e){}
}
function persist(){
  localStorage.setItem('bj_basic_v2', JSON.stringify({ bank: state.bank, stats: state.stats }));
}
function freshShoe(){ state.shoe = createShoe(state.numDecks); }

function buildChipButtons(){
  const values=[10,50,100,500];
  chipBar.innerHTML='';
  values.forEach(v=>{ const b=document.createElement('button'); b.className=`chip-btn chip-v${v}`; b.textContent=v; b.onclick=()=>addBet(v); chipBar.appendChild(b);});
}
function addBet(amount){ if(state.phase!=='bet')return; if(state.bank>=amount){ state.bank-=amount; state.currentBet+=amount; updateUI();}}
function clearBet(){ if(state.phase!=='bet')return; state.bank+=state.currentBet; state.currentBet=0; updateUI(); }

function startDeal(){
  if(state.currentBet<=0) return;
  if(state.shoe.length<40) freshShoe();
  state.hands=[{ cards:[], bet: state.currentBet, doubled:false, surrendered:false, insuranceBet:0, evenMoney:false, result:null }];
  state.dealerHand=[];
  state.activeHand=0;
  state.phase='player';
  state.insuranceOffered=false;
  // 發牌 順序: 玩家1, 莊家1, 玩家2, 莊家2
  state.hands[0].cards.push(drawCard(state.shoe));
  state.dealerHand.push(drawCard(state.shoe));
  state.hands[0].cards.push(drawCard(state.shoe));
  state.dealerHand.push(drawCard(state.shoe));
  tagNewCard(state.hands[0].cards[0]);
  tagNewCard(state.dealerHand[0]);
  tagNewCard(state.hands[0].cards[1]);
  tagNewCard(state.dealerHand[1]);
  state.currentBet=0; // 已轉為手注
  // 即時檢查玩家 Blackjack
  if(isBlackjack(state.hands[0].cards)){
    // 若莊家明牌 A -> 提供 Even Money/保險, 先不立即結算直到保險處理
    if(dealerUpcardIsAce()){
      state.phase='insurance';
      state.insuranceOffered=true;
      statusMessageEl.textContent='玩家 Blackjack，可選 Even Money 或等待莊家檢查';
    } else {
      // 若莊家十值需 peek (簡化：直接 peek)
      if(dealerUpcardIsTenValue() && isBlackjack(state.dealerHand)){
        // push
        finishAllHandsDealerBlackjack();
      } else {
        // 玩家自然 21 等待莊家流程
        statusMessageEl.textContent='玩家 Blackjack';
        proceedToDealerIfNoActions();
      }
    }
  } else if(dealerUpcardIsAce()) {
    state.phase='insurance';
    state.insuranceOffered=true;
    statusMessageEl.textContent='莊家 A，是否買保險？';
  } else {
    statusMessageEl.textContent='選擇：要牌 / 停牌';
  }
  updateUI();
}

function dealerUpcardIsAce(){ return state.dealerHand[0]?.rank==='A'; }
function dealerUpcardIsTenValue(){ const r=state.dealerHand[0]?.rank; return ['10','J','Q','K'].includes(r); }

function buyInsurance(){
  if(state.phase!=='insurance' || !dealerUpcardIsAce()) return;
  const hand = state.hands[0]; // 單手版保險
  const maxIns = Math.floor(hand.bet/2);
  if(state.bank>=maxIns){ state.bank-=maxIns; hand.insuranceBet=maxIns; statusMessageEl.textContent='已買保險'; }
  resolveInsurancePhase();
}
function takeEvenMoney(){
  if(state.phase!=='insurance') return;
  const hand=state.hands[0];
  if(!isBlackjack(hand.cards) || !dealerUpcardIsAce()) return;
  // 支付 1:1
  const payout = hand.bet*2; // 原注+等額盈利
  const profit = payout - hand.bet;
  state.bank += payout;
  hand.result='evenMoney';
  state.stats.rounds++; state.stats.wins++; state.stats.blackjack++; state.stats.net+=profit;
  statusMessageEl.textContent='Even Money 已支付 (盈虧 '+formatCurrency(profit)+')';
  state.phase='settle';
  updateUI();
}
function resolveInsurancePhase(){
  // peek 莊家是否 Blackjack（簡化直接看牌）
  const dealerBJ = isBlackjack(state.dealerHand);
  const hand = state.hands[0];
  if(dealerBJ){
    // 若玩家 Blackjack -> push (未選 even money)
    if(isBlackjack(hand.cards)){
      const refund = hand.bet; state.bank += refund; hand.result='push'; state.stats.pushes++; state.stats.rounds++; statusMessageEl.textContent='雙方 Blackjack (Push)';
    } else {
      // 莊家 Blackjack 玩家輸
      // 支付保險 2:1
      if(hand.insuranceBet>0){ state.bank += hand.insuranceBet*3; state.stats.net += hand.insuranceBet*2; }
      hand.result='lose'; state.stats.losses++; state.stats.rounds++; statusMessageEl.textContent='莊家 Blackjack';
    }
    finalizeRoundNet();
    state.phase='settle';
  } else {
    // 無 Blackjack -> 保險喪失
    if(hand.insuranceBet>0){ state.stats.net -= hand.insuranceBet; }
    statusMessageEl.textContent = isBlackjack(hand.cards)?'玩家 Blackjack 等待莊家補牌':'選擇：要牌 / 停牌';
    state.phase = isBlackjack(hand.cards)?'dealer':'player';
    if(state.phase==='dealer') proceedToDealerIfNoActions();
  }
  updateUI();
}

function playerHit(){
  if(state.phase!=='player') return;
  const hand=currentHand();
  if(hand.surrendered||hand.result) return;
  hand.cards.push(drawCard(state.shoe));
  const newCard = hand.cards[hand.cards.length-1];
  tagNewCard(newCard);
  if(isBust(hand.cards)){ hand.result='bust'; statusMessageEl.textContent='玩家爆牌'; nextHandOrDealer(); }
  updateUI();
}
function playerStand(){ if(state.phase!=='player') return; const hand=currentHand(); hand.result = hand.result || 'stand'; nextHandOrDealer(); updateUI(); }

function playerDouble(){
  if(state.phase!=='player') return;
  const hand=currentHand();
  if(hand.cards.length!==2 || hand.doubled || hand.surrendered || isBlackjack(hand.cards)) return;
  if(state.bank < hand.bet) return; // 需加注
  state.bank -= hand.bet; hand.bet*=2; hand.doubled=true; statusMessageEl.textContent='雙倍後自動要牌';
  hand.cards.push(drawCard(state.shoe));
  const newCard = hand.cards[hand.cards.length-1];
  tagNewCard(newCard);
  if(isBust(hand.cards)){ hand.result='bust'; } else { hand.result='stand'; }
  nextHandOrDealer(); updateUI();
}
function playerSplit(){
  if(state.phase!=='player') return;
  const hand=currentHand();
  if(hand.cards.length!==2) return;
  const r1=hand.cards[0].rank, r2=hand.cards[1].rank;
  if(r1!==r2 && !(isTenValue(r1)&&isTenValue(r2))) return; // 10 J Q K 可視為禁止混合，這裡允許同 rank 或同為10值? 保守只同 rank
  if(r1!==r2) return; // 保守：限定完全同 rank
  if(state.bank < hand.bet) return;
  // 建兩手
  state.bank -= hand.bet;
  const newBet = hand.bet;
  const card2 = hand.cards.pop();
  const newHand = { cards:[card2], bet:newBet, doubled:false, surrendered:false, insuranceBet:0, evenMoney:false, result:null };
  hand.result=null; // 重置
  // 抽補牌
  hand.cards.push(drawCard(state.shoe));
  newHand.cards.push(drawCard(state.shoe));
  tagNewCard(hand.cards[hand.cards.length-1]);
  tagNewCard(newHand.cards[newHand.cards.length-1]);
  state.hands.splice(state.activeHand+1,0,newHand);
  statusMessageEl.textContent='已分牌';
  updateUI();
}
function isTenValue(r){ return ['10','J','Q','K'].includes(r); }

function playerSurrender(){
  if(state.phase!=='player') return;
  const hand=currentHand();
  if(hand.cards.length!==2 || hand.surrendered || hand.doubled || isBlackjack(hand.cards)) return;
  hand.surrendered=true; hand.result='surrender'; // 返還一半
  const refund = hand.bet/2; state.bank += refund; state.stats.net -= hand.bet/2; // 計入損失一半
  statusMessageEl.textContent='玩家投降 (-'+formatCurrency(hand.bet/2)+')';
  nextHandOrDealer(); updateUI();
}

function currentHand(){ return state.hands[state.activeHand]; }

function nextHandOrDealer(){
  // 移到下一未結束手
  let i=state.activeHand+1;
  while(i<state.hands.length && state.hands[i].result && state.hands[i].result!=='stand' && state.hands[i].result!=='blackjack' && state.hands[i].result!=='bust' && state.hands[i].result!=='surrender') i++;
  if(i<state.hands.length){ state.activeHand=i; statusMessageEl.textContent='下一手行動'; }
  else { proceedToDealerIfNoActions(); }
}

function proceedToDealerIfNoActions(){
  // 若所有手 Blackjack 或投降或爆牌且無需莊家行動則直接結算
  if(state.hands.every(h=> h.result && (h.result==='blackjack' || h.result==='bust' || h.result==='surrender' || h.result==='evenMoney'))){
    settleRound();
  } else {
    state.phase='dealer';
    dealerPlay();
  }
}

function dealerPlay(){
  while(handValue(state.dealerHand).value < 17){
    state.dealerHand.push(drawCard(state.shoe));
    tagNewCard(state.dealerHand[state.dealerHand.length-1]);
  }
  settleRound();
}

function finishAllHandsDealerBlackjack(){
  // 在發牌階段確認莊家 Blackjack
  const dealerBJ=true;
  state.hands.forEach(h=>{
    if(isBlackjack(h.cards)) { h.result='push'; state.stats.pushes++; }
    else { h.result='lose'; state.stats.losses++; }
  });
  state.stats.rounds++;
  state.phase='settle';
  finalizeRoundNet();
  updateUI();
}

function settleRound(){
  state.phase='settle';
  const dealerVal = handValue(state.dealerHand);
  const dealerBust = dealerVal.value>21;
  const dealerBJ = isBlackjack(state.dealerHand);
  state.hands.forEach(h=>{
    if(h.result==='surrender' || h.result==='evenMoney') return; // 已處理
    if(isBlackjack(h.cards)){
      if(dealerBJ){ h.result='push'; state.stats.pushes++; refundPush(h); }
      else { h.result='blackjack'; const payout = h.bet*2.5; payHand(h,payout,h.bet*1.5); state.stats.blackjack++; state.stats.wins++; }
      return;
    }
    if(h.result==='bust'){ /* 已輸 */ return; }
    if(h.surrendered){ return; }
    const playerVal = handValue(h.cards).value;
    if(dealerBJ){ h.result='lose'; state.stats.losses++; return; }
    if(dealerBust){ h.result='win'; const payout=h.bet*2; payHand(h,payout,h.bet); state.stats.wins++; return; }
    if(playerVal>dealerVal.value){ h.result='win'; const payout=h.bet*2; payHand(h,payout,h.bet); state.stats.wins++; }
    else if(playerVal<dealerVal.value){ h.result='lose'; state.stats.losses++; }
    else { h.result='push'; state.stats.pushes++; refundPush(h); }
  });
  state.stats.rounds++;
  finalizeRoundNet();
  buildHandsResultsMessages();
  updateUI();
}

function payHand(hand,payout,profit){ state.bank+=payout; state.stats.net+=profit; }
function refundPush(hand){ state.bank+=hand.bet; }
function finalizeRoundNet(){ /* 已在逐手計 */ }
function buildHandsResultsMessages(){
  const msgs = state.hands.map((h,i)=>`H${i+1}:${h.result||''}`).join(' ');
  statusMessageEl.textContent = '結算 '+msgs;
}

function nextRound(){ if(state.phase!=='settle') return; state.phase='bet'; state.hands=[]; state.dealerHand=[]; state.activeHand=0; strategyHintEl.textContent='-'; statusMessageEl.textContent='下注開始'; updateUI(); }
function resetGame(){ if(!confirm('重置資金與統計？')) return; state.bank=2000; state.currentBet=0; state.stats={ rounds:0,wins:0,losses:0,pushes:0,blackjack:0,net:0 }; state.phase='bet'; state.hands=[]; state.dealerHand=[]; updateUI(); }

function updateUI(){
  bankAmountEl.textContent = formatCurrency(state.bank);
  currentBetEl.textContent = formatCurrency(state.currentBet);
  renderDealer();
  renderPlayerHands();
  // 按鈕狀態
  dealBtn.disabled = !(state.phase==='bet' && state.currentBet>0);
  hitBtn.disabled = !(state.phase==='player');
  standBtn.disabled = !(state.phase==='player');
  doubleBtn.disabled = !canDouble();
  splitBtn.disabled = !canSplit();
  surrenderBtn.disabled = !canSurrender();
  insuranceBtn.disabled = !(state.phase==='insurance' && dealerUpcardIsAce());
  evenMoneyBtn.disabled = !(state.phase==='insurance' && dealerUpcardIsAce() && isBlackjack(state.hands[0]?.cards||[]));
  hintBtn.disabled = !(state.phase==='player');
  newRoundBtn.disabled = !(state.phase==='settle');
  clearBetBtn.disabled = !(state.phase==='bet' && state.currentBet>0);
  // Stats
  statRoundsEl.textContent=state.stats.rounds;
  statWinsEl.textContent=state.stats.wins;
  statLossesEl.textContent=state.stats.losses;
  statPushesEl.textContent=state.stats.pushes;
  statBJEl.textContent=state.stats.blackjack;
  statNetEl.textContent=formatCurrency(state.stats.net);
  persist();
}

function tagNewCard(card){ if(!card._cid){ card._cid=++state.cardCounter; } }

function renderDealer(){
  dealerHandEl.innerHTML='';
  const hideHole = (state.phase==='player' || state.phase==='insurance');
  state.dealerHand.forEach((c,i)=>{
    const isNew = !state.renderedCardIds.has(c._cid);
    const hidden = hideHole && i===1;
    dealerHandEl.appendChild(buildCardEl(c, isNew, hidden));
    if(!hidden) state.renderedCardIds.add(c._cid);
  });
  dealerValueEl.textContent = (hideHole)?'?': handValue(state.dealerHand).value;
}

function renderPlayerHands(){
  playerHandsWrap.innerHTML='';
  state.hands.forEach((h,idx)=>{
    const wrap=document.createElement('div');
    wrap.className='player-hand-wrap';
    if(idx===state.activeHand && state.phase==='player') wrap.classList.add('active');
    if(h.surrendered) wrap.classList.add('surrendered');
    if(h.result) wrap.classList.add(h.result);
    const valObj = handValue(h.cards); const valText = valObj.value + (valObj.soft?' (Soft)':'');
    if(isBlackjack(h.cards) && !h.result) h.result='blackjack';
    const head=document.createElement('div'); head.className='player-hand-head'; head.innerHTML=`<span class="value ${valObj.soft?'soft':''}">V:${valText}</span><span class="bet">下注:${formatCurrency(h.bet)}</span>`; wrap.appendChild(head);
    const handDiv=document.createElement('div'); handDiv.className='hand';
    h.cards.forEach(c=>{ const isNew=!state.renderedCardIds.has(c._cid); handDiv.appendChild(buildCardEl(c,isNew,false)); state.renderedCardIds.add(c._cid); });
    wrap.appendChild(handDiv);
    const result=document.createElement('div'); result.className='player-hand-result'; result.textContent= h.result?labelResult(h.result):''; wrap.appendChild(result);
    playerHandsWrap.appendChild(wrap);
  });
}

function buildCardEl(card,isNew,hidden){
  const el=document.createElement('div');
  el.className='card suit-'+card.suit + (state.animations && isNew? ' deal-anim':'') + (hidden?' face-down':'');
  const suitSym = suitSymbol(card.suit);
  const rank = card.display;
  el.innerHTML = `<div class="card-inner">\n  <div class="card-face front">\n    <div class="corner tl"><span class="rank">${rank}</span><span class="suit">${suitSym}</span></div>\n    <div class="center-suit">${suitSym}</div>\n    <div class="corner br"><span class="rank">${rank}</span><span class="suit">${suitSym}</span></div>\n  </div>\n  <div class="card-face back">BJ</div>\n</div>`;
  return el;
}
function suitSymbol(s){ switch(s){ case 'H':return '♥'; case 'D':return '♦'; case 'S':return '♠'; case 'C':return '♣'; default:return '?'; } }

function canDouble(){ if(state.phase!=='player') return trueFalse(false); const h=currentHand(); return h && h.cards.length===2 && !h.doubled && !h.surrendered; }
function canSplit(){ if(state.phase!=='player') return trueFalse(false); const h=currentHand(); if(!h||h.cards.length!==2) return false; if(h.doubled||h.surrendered) return false; const r1=h.cards[0].rank, r2=h.cards[1].rank; return r1===r2 && state.bank>=h.bet; }
function canSurrender(){ if(state.phase!=='player') return false; const h=currentHand(); return h && h.cards.length===2 && !h.surrendered && !h.doubled; }
function trueFalse(v){return v;}

function showStrategyHint(){ if(state.phase!=='player') return; const h=currentHand(); const dealerUp=state.dealerHand[0]; const hint = basicStrategy(h,dealerUp); strategyHintEl.textContent=hint; }

function basicStrategy(hand,dealerUp){
  const up = dealerUp.rank==='A'?'A':(['10','J','Q','K'].includes(dealerUp.rank)?'T':dealerUp.rank);
  const cards=hand.cards; const hv=handValue(cards); const v=hv.value; const pair = (cards.length===2 && cards[0].rank===cards[1].rank);
  if(pair){ // 簡化對表
    const r=cards[0].rank; if(r==='A') return 'Split'; if(['8'].includes(r)) return 'Split'; if(['10','J','Q','K'].includes(r)) return 'Stand'; if(r==='9') return (['7','10','A'].includes(up)?'Stand':'Split'); if(r==='7') return (['8','9','10','A'].includes(up)?'Hit':'Split'); if(r==='6') return (['7','8','9','10','A'].includes(up)?'Hit':'Split'); if(r==='5') return 'Double'; if(r==='4') return (['5','6'].includes(up)?'Split':'Hit'); if(r==='3'||r==='2') return (['8','9','10','A'].includes(up)?'Hit':'Split'); }
  if(hv.soft){ // Soft 策略簡化
    if(v>=19) return 'Stand'; if(v===18){ return (['9','10','A'].includes(up)?'Hit': (['2','7','8'].includes(up)?'Stand':'Double')); } if(v===17||v===16||v===15){ return (['4','5','6'].includes(up)?'Double':'Hit'); } if(v===14||v===13){ return (['5','6'].includes(up)?'Double':'Hit'); }
  } else { // Hard
    if(v>=17) return 'Stand'; if(v>=13 && v<=16) return (['7','8','9','10','A'].includes(up)?'Hit':'Stand'); if(v===12) return (['4','5','6'].includes(up)?'Stand':'Hit'); if(v===11) return 'Double'; if(v===10) return (['10','A'].includes(up)?'Hit':'Double'); if(v===9) return (['3','4','5','6'].includes(up)?'Double':'Hit'); if(v<=8) return 'Hit';
  }
  return 'Hit';
}

function attachEvents(){
  dealBtn.onclick=startDeal;
  hitBtn.onclick=playerHit;
  standBtn.onclick=playerStand;
  doubleBtn.onclick=playerDouble;
  splitBtn.onclick=playerSplit;
  surrenderBtn.onclick=playerSurrender;
  insuranceBtn.onclick=buyInsurance;
  evenMoneyBtn.onclick=takeEvenMoney;
  hintBtn.onclick=showStrategyHint;
  newRoundBtn.onclick=nextRound;
  resetGameBtn.onclick=resetGame;
  clearBetBtn.onclick=clearBet;
  animToggleBtn.onclick=()=>{ state.animations=!state.animations; animToggleBtn.textContent='動畫:'+(state.animations?'開':'關'); };
}

init();
