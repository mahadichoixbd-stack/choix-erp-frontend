(function(){
  const $=s=>document.querySelector(s);
  const REPORT_PAGES=['reports','advancedReports','customerLedger','supplierLedger'];
  function isReportPage(){
    const p=String((typeof currentPage!=='undefined'&&currentPage)||window.currentPage||'');
    const t=String($('#pageTitle')?.textContent||'');
    return REPORT_PAGES.includes(p)||/report|ledger/i.test(t);
  }
  function addPrintButton(){
    const content=$('#content');
    if(!content||!isReportPage()||$('#reportPrintBtn'))return;
    const host=content.querySelector('.toolbar,.section-head,.tabs')||content.firstElementChild;
    if(!host)return;
    const b=document.createElement('button');
    b.id='reportPrintBtn';
    b.type='button';
    b.className='primary';
    b.textContent='🖨 Print Report';
    b.title='Print this report or save it as PDF';
    b.onclick=()=>printReport(String($('#pageTitle')?.textContent||'Report'));
    host.appendChild(b);
  }
  window.printReport=function(title){
    const content=$('#content');
    if(!content)return;
    const clone=content.cloneNode(true);
    clone.querySelectorAll('button,input,select,textarea,.no-print,#reportPrintBtn').forEach(x=>x.remove());
    const safeTitle=String(title||'Report').replace(/[<>]/g,'');
    const w=window.open('','_blank','width=1100,height=800');
    if(!w)return alert('Please allow pop-ups for CHOIX ERP to print this report.');
    const css=`body{font-family:Arial,sans-serif;margin:28px;color:#111}h1{font-size:22px;margin:0 0 6px}p.meta{color:#666;font-size:12px;margin:0 0 20px}.card{border:1px solid #ddd;border-radius:8px;padding:14px;margin:12px 0}.grid,.grid2{display:block}.data-table{width:100%;border-collapse:collapse;font-size:12px}.data-table th,.data-table td{border:1px solid #ccc;padding:7px;text-align:left}.data-table th{font-weight:700;background:#f3f4f6}.muted{color:#666}.stat-card{display:inline-block;min-width:150px;margin:4px}.stat{font-size:18px;font-weight:700}@page{size:auto;margin:10mm}@media print{body{margin:0}.card{break-inside:avoid}}`;
    w.document.write('<!doctype html><html><head><meta charset="utf-8"><title>CHOIX ERP - '+safeTitle+'</title><style>'+css+'</style></head><body><h1>CHOIX ERP — '+safeTitle+'</h1><p class="meta">Printed: '+new Date().toLocaleString()+'</p>'+clone.innerHTML+'</body></html>');
    w.document.close();
    w.focus();
    setTimeout(()=>{w.print();setTimeout(()=>w.close(),300)},250);
  };
  function boot(){addPrintButton();const target=$('#content');if(target){new MutationObserver(()=>setTimeout(addPrintButton,50)).observe(target,{childList:true,subtree:true})}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  window.addEventListener('load',()=>setTimeout(addPrintButton,500));
})();
