const form = document.getElementById("orderForm");
const ordersEl = document.getElementById("orders");
const countEl = document.getElementById("count");
const shopNameEl = document.getElementById("shopName");
const deadlineText = document.getElementById("deadlineText");
const msg = document.getElementById("msg");

function esc(s=""){
  return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function desc(o){
  const parts = [o.item, o.bread, o.meat, o.sauce, ...(o.extras || [])].filter(Boolean);
  return `${parts.join(" · ")}${o.note ? " · " + o.note : ""}`;
}
async function load(){
  const state = await fetch("/api/state").then(r=>r.json());
  shopNameEl.textContent = state.shopName || "Dönerbude";
  if(state.deadline){
    const d = new Date(state.deadline);
    deadlineText.textContent = "Bestellschluss: " + d.toLocaleString("de-DE");
  } else {
    deadlineText.textContent = "Bestellung offen";
  }
  countEl.textContent = `${state.orders.length} Einträge`;
  ordersEl.innerHTML = state.orders.length
    ? state.orders.map(o => `<div class="order">
        <div><strong>${esc(o.name)} – ${o.quantity}× ${esc(o.item)}</strong><small>${esc(desc(o))}</small></div>
      </div>`).join("")
    : `<div class="pill">Noch keine Bestellung.</div>`;
}
form.addEventListener("submit", async e=>{
  e.preventDefault();
  const fd = new FormData(form);
  const extras = [...form.querySelectorAll('input[type="checkbox"]:checked')].map(x=>x.value);
  const body = Object.fromEntries(fd.entries());
  body.extras = extras;
  body.quantity = Number(body.quantity || 1);

  const res = await fetch("/api/order", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(body)
  });
  if(!res.ok){
    msg.textContent = "Bitte Name und Gericht prüfen.";
    return;
  }
  form.reset();
  form.quantity.value = 1;
  msg.textContent = "✓ Bestellung eingetragen";
  await load();
  setTimeout(()=>msg.textContent="",2500);
});
load();
setInterval(load, 5000);
