/* Oracle divination flow: UI only; existing deck, interpretations and journal remain authoritative. */
(function installOracleDivinationFlow(){
 const $=id=>document.getElementById(id),ui=window.oracleUI;if(!ui)return;
 const root=$('site-root'),pane=$('or-pane-draw'),form=$('draw-form'),box=pane.querySelector('.ritual-box'),choice=$('choice-panel');
 root.classList.add('or-divination');
 let step=0;
 const titles=['認識這副牌','寫下你的問題','選擇牌陣','洗牌與選牌'];
 const create=(tag,cls,text)=>{const n=document.createElement(tag);n.className=cls||'';if(text)n.textContent=text;return n;};
 const button=(text,fn,secondary=false)=>{const b=create('button','btn'+(secondary?' btn-secondary':''),text);b.type='button';b.addEventListener('click',fn);return b;};
 const head=create('div','flow-heading');head.innerHTML='<div class="eyebrow">THE ORACLE ROOM · 神諭占卜</div><h2>從一張牌，聽見此刻的自己。</h2><p>帶著問題來，留下一個可以實踐的方向。</p>';
 const progress=create('ol','flow-progress');progress.setAttribute('aria-label','占卜步驟');titles.forEach((t,i)=>{const li=create('li');li.innerHTML='<span>'+String(i+1).padStart(2,'0')+'</span>'+t;progress.append(li);});
 const pages=titles.slice(0,3).map((t,i)=>{const s=create('section','flow-stage');s.id='flow-stage-'+i;s.hidden=i!==0;s.setAttribute('aria-label',t);return s;});
 pages[0].innerHTML='<div class="flow-deck-preview"></div><div class="flow-deck-copy"><div class="eyebrow">24 ORIGINAL ORACLE CARDS</div><h3>晴光花園</h3><p>二十四張原創神諭牌，從圖像、牌義與牌卡之間的關係，整理你眼前的問題。</p><dl><div><dt>牌組</dt><dd>24 張原創牌義，不分正逆位</dd></div><div><dt>牌陣</dt><dd>單牌提醒，或現況／阻礙／建議三牌</dd></div><div><dt>紀錄</dt><dd>提問與心得只保留在你的瀏覽器</dd></div></dl></div>';
 const artPreview=document.querySelector('.hero-card.middle .art').cloneNode(true);pages[0].querySelector('.flow-deck-preview').append(artPreview);
 pages[0].querySelector('.flow-deck-copy').append(button('選好了，下一步 →',()=>go(1)));
 pages[1].append(create('h3','','這次，你想問什麼？'));
 const topics=create('div','flow-topics');
 [['方向','目前最值得我投入注意力的是什麼？'],['工作','面對工作上的挑戰，我可以調整什麼？'],['關係','這段關係中，我現在需要看見什麼？'],['選擇','面對這個選擇，我需要看見什麼？'],['自我照顧','此刻，我最需要照顧自己哪個部分？']].forEach(([label,q])=>{topics.append(button(label,()=>{$('question').value=q;$('question').focus();},true));});
 pages[1].append(topics,form.querySelector('label[for="question"]'),$('question'),form.querySelector('.suggestions'),$('question-hint'));
 const qnav=create('div','flow-actions');qnav.append(button('← 返回牌組',()=>go(0),true),button('選擇牌陣 →',()=>go(2)));pages[1].append(qnav);
 pages[2].append(create('h3','','選擇你想看的角度'),$('mode-label'),form.querySelector('.mode-group'));
 const snav=create('div','flow-actions');snav.append(button('← 修改問題',()=>go(1),true),button('準備抽牌 →',()=>go(3)));pages[2].append(snav);
 const summary=create('div','flow-summary');summary.id='flow-summary';form.prepend(summary);form.append(button('← 更換牌陣',()=>go(2),true));
 const oldHead=pane.querySelector('.section-heading');if(oldHead)oldHead.remove();pane.prepend(head,progress,...pages);
 function go(next,focus=true){
  if(busy)return;step=next;
  if(step===3)$('draw-status').textContent='準備好了，就開始洗牌。';
  pages.forEach((p,i)=>p.hidden=i!==step);box.hidden=step!==3;choice.hidden=true;
  progress.querySelectorAll('li').forEach((li,i)=>{li.classList.toggle('active',i===step);if(i===step)li.setAttribute('aria-current','step');else li.removeAttribute('aria-current');});
  summary.replaceChildren(create('div','eyebrow',mode===3?'三張牌 · 現況／阻礙／建議':'單牌 · 此刻的提醒'),create('h3','',$('question').value.trim()||'此刻，我需要看見什麼？'));
  $('or-main').scrollTop=0;
  if(focus){const target=pages[step]?.querySelector('h3')||summary.querySelector('h3');target.tabIndex=-1;target.focus({preventScroll:true});}
 }
 document.querySelector('.or-nav').addEventListener('click',e=>{if(e.target.closest('[data-or-view]')&&selectionPhase==='shuffling'){selectionGeneration++;setBusy(false);selectionPhase='idle';}},true);
 const originalShow=ui.show;
 ui.show=(next,opts)=>{originalShow(next,opts);if(next==='draw'&&selectionPhase!=='selecting')go(step,false);};
 const showChoices=()=>{if(!choice.hidden){pages.forEach(p=>p.hidden=true);box.hidden=true;step=3;progress.querySelectorAll('li').forEach((li,i)=>li.classList.toggle('active',i===3));$('or-main').scrollTop=0;}};
 new MutationObserver(showChoices).observe(choice,{attributes:true,attributeFilter:['hidden']});
 $('reshuffle-button').addEventListener('click',()=>{box.hidden=false;choice.hidden=true;});
 const nav=document.querySelector('.or-nav'),drawNav=nav.querySelector('[data-or-view="draw"]');drawNav.innerHTML='<span>✦</span>開啟新的占卜';nav.prepend(drawNav);nav.querySelectorAll('button:not([data-or-view="draw"]) span').forEach(n=>n.textContent='·');
 const journalNav=nav.querySelector('[data-or-view="journal"]');nav.insertBefore(journalNav,nav.querySelector('[data-or-view="cards"]'));
 nav.querySelectorAll('[data-or-view="draw"]').forEach(b=>b.addEventListener('click',()=>{if(!busy){selectionPhase='idle';selectedSlots=[];go(0);}}));
 document.querySelector('.or-brand').addEventListener('click',()=>{if(!busy){originalShow('draw');go(0);}});
 $('modal-to-draw')?.addEventListener('click',()=>go(1));
 const url=new URL(window.parent.location.href);if(!url.searchParams.has('view')&&!url.searchParams.has('topic')&&!url.searchParams.has('source'))originalShow('draw',{route:false,focus:false});
 box.hidden=true;Promise.resolve(storageInitialized).then(()=>go(0,false));
 window.oracleFlow={get step(){return step;},go};
})();
