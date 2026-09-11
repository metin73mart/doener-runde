const form = document.getElementById("orderForm");
const ordersEl = document.getElementById("orders");
const countEl = document.getElementById("count");
const shopNameEl = document.getElementById("shopName");
const deadlineText = document.getElementById("deadlineText");
const msg = document.getElementById("msg");
const PRICES = {

  "Döner Kebap – 9,00 €": 9.00,

  "Döner Kebap Spezial – 9,50 €": 9.50,

  "Döner Kebap Antikya – 10,00 €": 10.00,

  "Kebap Vegetarisch – 9,00 €": 9.00,

  "Kebap Antikya Vegetarisch – 9,50 €": 9.50,

  "Döner Box – 9,50 €": 9.50,

  "Döner Box Antikya Vegetarisch – 9,50 €": 9.50,

  "Döner Teller – 15,00 €": 15.00,

  "Döner Teller Vegetarisch – 14,50 €": 14.50,

  "İskender Kebap – 16,50 €": 16.50,

  "Überbackung Antikya – 16,50 €": 16.50,

  "Tagesteller – 16,50 €": 16.50,

  "Döner Dürüm – 10,50 €": 10.50,

  "Dürüm Vegetarisch – 10,00 €": 10.00,

  "Dürüm Antikya – 11,50 €": 11.50,

  "Dürüm Spezial – 11,00 €": 11.00,

  "Döner Tasche – 15,00 €": 15.00,

  "Lahmacun – 6,00 €": 6.00,

  "Lahmacun mit Salat – 7,50 €": 7.50,

  "Lahmacun Jumbo – 11,00 €": 11.00,

  "Lahmacun Jumbo Spezial – 12,00 €": 12.00,

  "Lahmacun Jumbo Antikya – 12,00 €": 12.00

};
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
body.price = PRICES[body.item] || 0;

body.total = body.price * body.quantity;
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
