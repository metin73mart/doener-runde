const ordersEl = document.getElementById("adminOrders");
const summaryEl = document.getElementById("summary");
const shopInput = document.getElementById("shopNameInput");
const deadlineInput = document.getElementById("deadlineInput");
const wa = document.getElementById("whatsapp");
const msg = document.getElementById("adminMsg");

function esc(s=""){
  return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function details(o){
  return [o.bread, o.meat, o.sauce, ...(o.extras||[]), o.note].filter(Boolean).join(", ");
}
function makeSummary(state){
  if(!state.orders.length) return `Hallo ${state.shopName || "Dönerbude"},\n\nnoch keine Bestellungen eingetragen.`;
  const lines = state.orders.map((o,i)=>{
    const d = details(o);
    return `${i+1}. ${o.quantity}× ${o.item}${d ? " – " + d : ""} (${o.name})`;
  });
  const total = state.orders.reduce((s,o)=>s+(Number(o.quantity)||1),0);
  return `Hallo ${state.shopName || "Dönerbude"},\n\nwir möchten gerne bestellen:\n\n${lines.join("\n")}\n\nGesamt: ${total} Gericht${total===1?"":"e"}.\nDanke!`;
}
async function load(){
  const state = await fetch("/api/state").then(r=>r.json());
  shopInput.value = state.shopName || "Dönerbude";
  deadlineInput.value = state.deadline || "";
  ordersEl.innerHTML = state.orders.length
    ? state.orders.map(o=>`<div class="order">
      <div><strong>${esc(o.name)} – ${o.quantity}× ${esc(o.item)}</strong><small>${esc(details(o))}</small></div>
      <button class="danger" onclick="removeOrder('${o.id}')">Löschen</button>
    </div>`).join("")
    : `<div class="pill">Noch keine Bestellung.</div>`;
  const summary = makeSummary(state);
  summaryEl.value = summary;
  wa.href = "https://wa.me/?text=" + encodeURIComponent(summary);
}
async function removeOrder(id){
  await fetch("/api/order/"+encodeURIComponent(id), {method:"DELETE"});
  load();
}
document.getElementById("saveSettings").addEventListener("click", async ()=>{
  await fetch("/api/settings", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({shopName:shopInput.value, deadline:deadlineInput.value})
  });
  msg.textContent = "✓ Einstellungen gespeichert";
  setTimeout(()=>msg.textContent="",2000);
  load();
});
document.getElementById("reset").addEventListener("click", async ()=>{
  if(!confirm("Alle Bestellungen löschen und neue Runde starten?")) return;
  await fetch("/api/reset", {method:"POST"});
  load();
});
document.getElementById("copy").addEventListener("click", async ()=>{
  await navigator.clipboard.writeText(summaryEl.value);
  msg.textContent = "✓ Text kopiert";
  setTimeout(()=>msg.textContent="",2000);
});
load();
setInterval(load, 5000);


async function loadShare(){
  try{
    const share = await fetch("/api/share").then(r=>r.json());
    const input = document.getElementById("shareUrl");
    const img = document.getElementById("qrCode");
    if(input) input.value = share.url || "";
    if(img && share.qr) img.src = share.qr;

    const copyLink = document.getElementById("copyLink");
    if(copyLink) copyLink.onclick = async () => {
      await navigator.clipboard.writeText(share.url);
      msg.textContent = "✓ Link kopiert";
      setTimeout(()=>msg.textContent="",2000);
    };

    const nativeShare = document.getElementById("nativeShare");
    if(nativeShare && navigator.share){
      nativeShare.hidden = false;
      nativeShare.onclick = () => navigator.share({
        title: "Döner-Runde",
        text: "Hier kannst du deine Bestellung eintragen:",
        url: share.url
      });
    }
  } catch {}
}
loadShare();
