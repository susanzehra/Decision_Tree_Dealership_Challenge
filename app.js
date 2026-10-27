"use strict";

const state={name:"",mission:0,completed:Array(6).fill(false),answers:{}};
const missionNames=["Data Garage","Training Center","Split Workshop","Tree Assembly","Prediction Road","Final Challenge"];
const game=document.querySelector("#game");

document.querySelector("#welcomeForm").addEventListener("submit",e=>{
  e.preventDefault();
  state.name=document.querySelector("#studentName").value.trim();
  if(!state.name)return;
  document.querySelector("#playerLabel").textContent=`Analyst: ${state.name}`;
  document.querySelector("#welcome").classList.add("hidden");
  render();
});
document.querySelector("#resetBtn").addEventListener("click",()=>{if(confirm("Start the entire challenge again?"))location.reload()});

function nav(){
  const n=document.querySelector("#missionNav");
  n.innerHTML=missionNames.map((x,i)=>`<div class="mission-pill ${state.completed[i]?"done":""} ${state.mission===i?"active":""}">${state.completed[i]?"✓ ":`${i+1}. `}${x}</div>`).join("");
  document.querySelector("#progressBar").style.width=`${state.completed.filter(Boolean).length/6*100}%`;
}
function head(n,title,subtitle){return `<div class="mission-head"><div class="mission-number">${n}</div><div><p class="eyebrow">Mission ${n}</p><h2>${title}</h2><p class="instruction">${subtitle}</p></div></div>`}
function feedback(text,error=false){return `<div class="feedback ${error?"error":""}">${text}</div>`}
function finishMission(){state.completed[state.mission]=true;state.mission++;render();scrollTo({top:260,behavior:"smooth"})}
function render(){nav();const screens=[m1,m2,m3,m4,m5,m6];if(state.mission<6)screens[state.mission]();else certificate()}
function actionRow(hint){return `<div class="actions"><button class="ghost hint-btn">💡 Hint</button><button class="primary check-btn">Check My Work</button></div><div class="hint-slot"></div>`}
function wireHint(text){document.querySelector(".hint-btn")?.addEventListener("click",()=>document.querySelector(".hint-slot").innerHTML=feedback(text))}

function m1(){
  game.innerHTML=head(1,"Inspect the vehicle records","Classify the fields. Which ones describe the vehicle, and which one is the answer the model learns to predict?")+`
  <div class="records"><table class="data-table"><tr><th>Price</th><th>Maintenance</th><th>Capacity</th><th>Airbag</th><th>Profitable</th></tr><tr><td>Low</td><td>Low</td><td>4</td><td>Yes</td><td>Yes</td></tr><tr><td>High</td><td>High</td><td>2</td><td>No</td><td>No</td></tr><tr><td>Medium</td><td>Low</td><td>5</td><td>Yes</td><td>Yes</td></tr></table></div>
  <p><strong>Click each field, then place it in the correct category.</strong></p><div class="token-bank" id="bank">${["Price","Maintenance","Capacity","Airbag","Profitable"].map(x=>`<button class="token" data-field="${x}">${x}</button>`).join("")}</div>
  <div class="work-grid"><div class="dropzone" data-zone="input"><h3>Input attributes</h3><div class="zone-items"></div></div><div class="dropzone" data-zone="target"><h3>Target label</h3><div class="zone-items"></div></div></div>${actionRow()}`;
  let selected=null;
  document.querySelectorAll(".token").forEach(b=>b.onclick=()=>{selected=b;document.querySelectorAll(".token").forEach(x=>x.classList.remove("selected"));b.classList.add("selected")});
  document.querySelectorAll(".dropzone").forEach(z=>z.onclick=e=>{if(!selected||e.target.closest(".token"))return;z.querySelector(".zone-items").append(selected);selected.classList.remove("selected");selected=null});
  wireHint("Four fields describe a vehicle. One field tells whether the vehicle was actually profitable.");
  document.querySelector(".check-btn").onclick=()=>{const target=[...document.querySelector('[data-zone="target"] .zone-items').children].map(x=>x.dataset.field);const inputs=[...document.querySelector('[data-zone="input"] .zone-items').children].map(x=>x.dataset.field);if(target.length===1&&target[0]==="Profitable"&&inputs.length===4){game.insertAdjacentHTML("beforeend",feedback("Correct! <strong>Profitable</strong> is the target label. The other fields are input attributes."));setTimeout(finishMission,900)}else game.insertAdjacentHTML("beforeend",feedback("Not quite. Every field must be placed, and the target is the outcome we want to predict.",true))};
}

function m2(){
  game.innerHTML=head(2,"Protect the prediction","Training records teach the tree. Test records measure it. Keep the answer hidden while the model predicts.")+`
  <div class="car-card"><div class="car-emoji">🚙</div><div><strong>Unseen test vehicle</strong><p>Price: Medium · Maintenance: High · Capacity: 4 · Airbag: Yes</p><p>The CSV also contains its actual label: <strong>Profitable = No</strong>.</p></div></div>
  <h3>Should the prediction function read “Profitable = No” before making its prediction?</h3><div class="choice-grid"><button class="choice" data-a="yes"><strong>Yes</strong><br>It will improve accuracy.</button><button class="choice" data-a="no"><strong>No</strong><br>Reveal it only after prediction.</button></div>
  <div id="m2feedback"></div>`;
  document.querySelectorAll(".choice").forEach(b=>b.onclick=()=>{document.querySelectorAll(".choice").forEach(x=>x.classList.remove("correct","wrong"));if(b.dataset.a==="no"){b.classList.add("correct");document.querySelector("#m2feedback").innerHTML=feedback("Exactly. Reading the true label before predicting is <strong>target leakage</strong>. Predict first; compare with the label afterward.");setTimeout(finishMission,1000)}else{b.classList.add("wrong");document.querySelector("#m2feedback").innerHTML=feedback("That would give the model the answer. The accuracy would no longer be a fair test.",true)}});
}

function m3(){
  game.innerHTML=head(3,"Choose the first split","Use the stated strategy—not intuition—to select the root attribute.")+`
  <table class="data-table"><tr><th>Attribute</th><th>Distinct values</th></tr><tr><td>Price</td><td>3</td></tr><tr><td>Maintenance</td><td>3</td></tr><tr><td>Capacity</td><td>2</td></tr><tr><td>Airbag</td><td>2</td></tr></table>
  <div class="scenario"><h3>Round 1: Least Values</h3><p>Select an eligible attribute with the fewest distinct values.</p><div class="choice-grid">${["Price","Maintenance","Capacity","Airbag"].map(x=>`<button class="choice round1" data-v="${x}">${x}</button>`).join("")}</div></div>
  <div class="scenario"><h3>Round 2: Most Values</h3><p>Select an eligible attribute with the most distinct values.</p><div class="choice-grid">${["Price","Maintenance","Capacity","Airbag"].map(x=>`<button class="choice round2" data-v="${x}">${x}</button>`).join("")}</div></div>
  <div id="m3feedback"></div><div class="actions"><button class="ghost hint-btn">💡 Hint</button><button class="primary check-btn">Check Both Rounds</button></div><div class="hint-slot"></div>`;
  let a1=null,a2=null;document.querySelectorAll(".round1").forEach(b=>b.onclick=()=>{a1=b.dataset.v;document.querySelectorAll(".round1").forEach(x=>x.classList.remove("selected"));b.classList.add("selected")});document.querySelectorAll(".round2").forEach(b=>b.onclick=()=>{a2=b.dataset.v;document.querySelectorAll(".round2").forEach(x=>x.classList.remove("selected"));b.classList.add("selected")});
  wireHint("Least Values accepts Capacity or Airbag. Most Values accepts Price or Maintenance. Ties require a consistent tie rule.");
  document.querySelector(".check-btn").onclick=()=>{if(["Capacity","Airbag"].includes(a1)&&["Price","Maintenance"].includes(a2)){document.querySelector("#m3feedback").innerHTML=feedback("Correct. More than one attribute can tie. A program should document and consistently apply a tie-breaking rule.");setTimeout(finishMission,1100)}else document.querySelector("#m3feedback").innerHTML=feedback("Recheck the number of distinct values. Select one answer in each round.",true)};
}

function m4(){
  game.innerHTML=head(4,"Assemble a decision tree","Choose the correct content for each blank node. The root asks a question; each leaf gives a prediction.")+`
  <div class="mini-tree"><div class="node">Airbag?</div><div class="branches"><div class="branch"><span class="branch-label">YES</span><div class="node leaf" id="leafYes">Drop prediction</div></div><div class="branch"><span class="branch-label">NO</span><div class="node" id="midNode">Drop attribute</div><div class="branches"><div class="branch"><span class="branch-label">LOW</span><div class="node leaf" id="leafLow">Drop prediction</div></div><div class="branch"><span class="branch-label">HIGH</span><div class="node leaf" id="leafHigh">Drop prediction</div></div></div></div></div></div>
  <p><strong>Training evidence:</strong> Airbag=Yes → all profitable. For Airbag=No, Maintenance=Low → profitable; Maintenance=High → not profitable.</p>
  <div class="work-grid"><label>Airbag = Yes leaf<select id="s1"><option value="">Choose...</option><option>Profitable = Yes</option><option>Profitable = No</option><option>Maintenance?</option></select></label><label>Next decision node<select id="s2"><option value="">Choose...</option><option>Profitable = Yes</option><option>Price?</option><option>Maintenance?</option></select></label><label>Maintenance = Low leaf<select id="s3"><option value="">Choose...</option><option>Profitable = Yes</option><option>Profitable = No</option></select></label><label>Maintenance = High leaf<select id="s4"><option value="">Choose...</option><option>Profitable = Yes</option><option>Profitable = No</option></select></label></div>${actionRow()}`;
  wireHint("A decision node contains an attribute question. A leaf contains the final Yes/No prediction.");
  document.querySelector(".check-btn").onclick=()=>{const v=["s1","s2","s3","s4"].map(id=>document.querySelector(`#${id}`).value);if(JSON.stringify(v)===JSON.stringify(["Profitable = Yes","Maintenance?","Profitable = Yes","Profitable = No"])){game.insertAdjacentHTML("beforeend",feedback("Tree complete! Each branch now ends in a pure, explainable decision."));setTimeout(finishMission,1000)}else game.insertAdjacentHTML("beforeend",feedback("At least one node is incorrect. Follow the training evidence one statement at a time.",true))};
}

function m5(){
  game.innerHTML=head(5,"Stop, split, or use a fallback?","A recursive tree needs clear rules for unusual or finished branches.")+`
  <div id="scenarios">${[
    ["All records at this branch have label Yes.",["Create a Yes leaf","Split again","Delete the branch"],0],
    ["Labels are mixed, and unused attributes remain.",["Create a No leaf","Split again","Use the test label"],1],
    ["Labels are mixed, but no attributes remain.",["Use the majority label","Restart training","Always predict Yes"],0],
    ["A test value never appeared on the learned branch.",["Use a documented fallback","Read its true label","Change the training data"],0]
  ].map((s,i)=>`<div class="scenario"><strong>${i+1}. ${s[0]}</strong><select data-correct="${s[2]}"><option value="">Choose an action...</option>${s[1].map((x,j)=>`<option value="${j}">${x}</option>`).join("")}</select></div>`).join("")}</div>${actionRow()}`;
  wireHint("A pure node is finished. A mixed node can split only if an attribute remains. Your fallback must be consistent and documented.");
  document.querySelector(".check-btn").onclick=()=>{const sels=[...document.querySelectorAll("#scenarios select")];if(sels.every(s=>s.value!==""&&s.value===s.dataset.correct)){game.insertAdjacentHTML("beforeend",feedback("Excellent. These are the base cases that prevent recursive tree construction from continuing forever."));setTimeout(finishMission,1000)}else game.insertAdjacentHTML("beforeend",feedback("Some stopping decisions need another look.",true))};
}

function m6(){
  game.innerHTML=head(6,"Final dealership challenge","Follow the learned tree for three unseen vehicles, then calculate the model's accuracy.")+`
  <div class="mini-tree"><div class="node">Airbag?</div><div class="branches"><div class="branch"><span class="branch-label">YES</span><div class="node leaf">YES</div></div><div class="branch"><span class="branch-label">NO</span><div class="node">Maintenance?</div><div class="branches"><div class="branch"><span class="branch-label">LOW</span><div class="node leaf">YES</div></div><div class="branch"><span class="branch-label">HIGH</span><div class="node leaf">NO</div></div></div></div></div></div>
  <table class="data-table"><tr><th>Vehicle</th><th>Airbag</th><th>Maintenance</th><th>Actual</th><th>Your prediction</th></tr>
  ${[["V1","Yes","High","Yes"],["V2","No","Low","Yes"],["V3","No","High","Yes"]].map((r,i)=>`<tr>${r.map(x=>`<td>${x}</td>`).join("")}<td><select id="p${i}"><option value="">Choose...</option><option>Yes</option><option>No</option></select></td></tr>`).join("")}</table>
  <label>What is the accuracy?<select id="accuracy"><option value="">Choose...</option><option value="33">33.3%</option><option value="67">66.7%</option><option value="100">100%</option></select></label>${actionRow()}`;
  wireHint("Predictions are Yes, Yes, No. Compare each prediction with the Actual column; two of three match.");
  document.querySelector(".check-btn").onclick=()=>{const preds=[0,1,2].map(i=>document.querySelector(`#p${i}`).value);if(preds.join()===['Yes','Yes','No'].join()&&document.querySelector("#accuracy").value==="67"){game.insertAdjacentHTML("beforeend",feedback("Challenge passed! The tree predicted 2 of 3 records correctly: (2 ÷ 3) × 100 = 66.7%."));setTimeout(finishMission,1200)}else game.insertAdjacentHTML("beforeend",feedback("Trace each record from the root to one leaf, then compare predictions with the actual labels.",true))};
}

function certificate(){nav();const t=document.querySelector("#certificateTemplate").content.cloneNode(true);game.innerHTML="";game.append(t);document.querySelector("#certName").textContent=state.name;document.querySelector("#certDate").textContent=new Date().toLocaleString();game.insertAdjacentHTML("beforeend",`<div class="actions"><button class="ghost" onclick="location.reload()">Play Again</button><button class="primary" onclick="window.print()">Print / Save as PDF</button></div>`)}
