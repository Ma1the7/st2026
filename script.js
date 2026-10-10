const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const saved = new Set();
const toast = $('#toast');
let toastTimer;
function notify(message){toast.textContent=message;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),2400)}
function updateSaved(){ $('#savedCount').textContent=saved.size; $$('.save-btn').forEach(btn=>{const yes=saved.has(btn.dataset.save);btn.classList.toggle('saved',yes);btn.textContent=yes?'♥':'♡';btn.setAttribute('aria-pressed',String(yes))});}
$$('.save-btn').forEach(btn=>btn.addEventListener('click',()=>{const name=btn.dataset.save;if(saved.has(name)){saved.delete(name);notify(`«${name}» убрано из сохранённого`)}else{saved.add(name);notify(`«${name}» добавлено в сохранённое`)}updateSaved()}));
$('#savedToggle').addEventListener('click',()=>{if(!saved.size){notify('Пока ничего не сохранено — нажмите ♡ у понравившегося места.');return}notify('Сохранено: '+[...saved].join(', '))});
$('#saveRoute').addEventListener('click',()=>{if(saved.has('Маршрут: От рукописей до розового города')){saved.delete('Маршрут: От рукописей до розового города');$('#saveRoute').textContent='Сохранить маршрут ↗';notify('Маршрут удалён из сохранённого')}else{saved.add('Маршрут: От рукописей до розового города');$('#saveRoute').textContent='✓ Маршрут сохранён';notify('Маршрут добавлен в сохранённое')}updateSaved()});
const moodTexts={Архитектура:'Вам подойдёт прогулка «От рукописей до розового города» — обратите внимание на туф, аркады и городские линии.',Искусство:'Начните с Каскада и скульптурного сада, а затем загляните в Матенадаран.',Дворики:'Выберите спокойный темп и оставьте время на старые улочки Конда — уважайте частное пространство.',Еда:'Добавьте к прогулке паузу на лаваш, свежую зелень, армянский кофе и гату.',Истории:'Матенадаран, план Таманяна и оттенки туфа помогут прочитать город как открытую книгу.'};
function updateMood(){const selected=$$('.chip.active').map(b=>b.dataset.mood);$('#recommendation').textContent=selected.length?selected.map(m=>moodTexts[m]).join(' '):'Выберите интерес — и мы подскажем, с чего начать прогулку.'}
$$('.chip').forEach(btn=>btn.addEventListener('click',()=>{btn.classList.toggle('active');updateMood()}));
const mapInfo={'Матенадаран':'проспект Маштоца, 53','Каскад':'улица Таманяна','Оперный театр':'улица Туманяна, 54','Площадь Республики':'центр города','Вернисаж':'улица Арама','Конд':'к западу от проспекта Маштоца'};
function selectMap(name){$('#mapDetails').innerHTML=`<h3>${name}</h3><p>${mapInfo[name]||'Центр Еревана'}</p>`;$$('[data-map]').forEach(el=>el.classList.toggle('active',el.dataset.map===name));}
$$('[data-map]').forEach(el=>el.addEventListener('click',()=>selectMap(el.dataset.map)));
$('#menuToggle').addEventListener('click',()=>{$('.nav nav').classList.toggle('open')});
$$('.nav nav a').forEach(a=>a.addEventListener('click',()=>$('.nav nav').classList.remove('open')));
$$('.checklist input').forEach(input=>input.addEventListener('change',()=>{const all=$$('.checklist input');const count=all.filter(i=>i.checked).length;$('#checkProgress').textContent=`${count} / ${all.length} готово`}));

// Scroll-reveal: элементы мягко появляются по мере прокрутки.
const revealItems = $$('.place-card,.stop,.context-grid article,.tips-grid article');
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('reveal-in'); observer.unobserve(entry.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px' });
  revealItems.forEach(el => revealObserver.observe(el));
} else revealItems.forEach(el => el.classList.add('reveal-in'));

// Небольшой параллакс для hero на десктопе.
const heroArt = $('.hero-art');
if (heroArt && !window.matchMedia('(prefers-reduced-motion: reduce)').matches && window.matchMedia('(pointer:fine)').matches) {
  heroArt.addEventListener('pointermove', (e) => {
    const r = heroArt.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5;
    const y = (e.clientY - r.top) / r.height - .5;
    heroArt.style.transform = `perspective(900px) rotateY(${x * 3}deg) rotateX(${-y * 3}deg)`;
  });
  heroArt.addEventListener('pointerleave', () => heroArt.style.transform = '');
}
