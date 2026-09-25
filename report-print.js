(function(){
  const $=s=>document.querySelector(s);
  function addPrintButton(){
    const content=$('#content');
    if(!content || $('#reportPrintBtn')) return;
    const title=($('#pageTitle')?.textContent||'Report').trim();
    const isReport=/report|ledger/i.test(title) || ['reports','advancedReports','customerLedger','supplierLedger'].includes(window.currentPage);
    if(!isReport) return;
    const host=content.querySelector('.toolbar,.section-head,.tabs') || content.firstElementChild;
    if(!host) return;
    const b=document.createElement('button');
    b.id='reportPrintBtn'; b.type='button'; b.className='primary'; b.textContent='🖨 Print Report';
    b.onclick=()=>printReport(title);
    host.appendChild(b);
  }
  window.printReport=function(title){
    const content=$('#content'); if(!content)return;
    const clone=content.cloneNode(true);
    clone.querySelectorAll('button,input,select,textarea,.no-print').forEach(x=>x.remove());
    const w=window.open('','_blank','width=1100,height=800');
    if(!w)return alert('Please allow pop-ups to print the report.');
    const css=`body{font-family:Arial,sans-serif;margin:28px;color:#111}h1{font-size:22px;margin:0 0 6px}p.meta{color:#666;font-size:12px;margin:0 0 20px}.card{border:1px solid #ddd;border-radius:8px;padding:14px;margin:12px 0}.grid,.grid2{display:block}.data-table{width:100%;border-collapse:collapse;font-size:12px}.data-table th,.data-table td{border:1px solid #ccc;padding:7px;text-align:left}.data-table th{font-weight:700;background:#f3f4f6}.muted{color:#666}.stat-card{display:inline-block;min-width:150px;margin:4px}.stat{font-size:18px;font-weight:700} @media print{body{margin:10mm}.card{break-inside:avoid}}`;
    w.document.write('<!doctype html><html><head><title>'+String(title).replace(/[<>]/g,'')+'</title><style>'+css+'</style></head><body><h1>CHOIX ERP — '+String(title).replace(/[<>]/g,'')+'</h1><p class="meta">Printed: '+new Date().toLocaleString()+'</p>'+clone.innerHTML+'</body></html>');
    w.document.close(); w.focus(); setTimeout(()=>{w.print();w.close()},350);
  };
  function wrap(name){
    const original=window[name];
    if(typeof original!=='function')return;
    window[name]=async function(){const r=await original.apply(this,arguments);setTimeout(addPrintButton,80);return r};
  }
  function boot(){['reports','advancedReports','customerLedger','supplierLedger'].forEach(wrap);setTimeout(addPrintButton,300)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  const obs=new MutationObserver(()=>setTimeout(addPrintButton,30));
  const target=$('#content'); if(target)obs.observe(target,{childList:true,subtree:true});
})();
