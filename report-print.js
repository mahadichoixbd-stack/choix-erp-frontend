(function(){
  const $=s=>document.querySelector(s);
  const REPORT_PAGES=['reports','advancedReports','customerLedger','supplierLedger'];
  function isReportPage(){
    const t=String($('#pageTitle')?.textContent||'');
    return REPORT_PAGES.some(p=>t.toLowerCase().includes(p.toLowerCase()))||/report|ledger/i.test(t);
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
    const safeTitle=String(title||'Report').replace(/[<>]/g,'');
    const oldTitle=document.title;
    const style=document.createElement('style');
    style.id='choix-print-style';
    style.textContent=`
      @media print{
        @page{size:auto;margin:10mm}
        body>*{display:none!important}
        #app{display:block!important}
        #app>*{display:none!important}
        #app #content{display:block!important;position:static!important;width:auto!important;margin:0!important;padding:0!important;background:#fff!important;color:#111!important}
        #content .card,#content .toolbar,#content .tabs,#content .grid,#content .grid2{display:block!important}
        #content .toolbar button,#content .toolbar input,#content .tabs button,#content .section-head button,#reportPrintBtn{display:none!important}
        #content .table-wrap{overflow:visible!important}
        #content table{width:100%!important;border-collapse:collapse!important;font-size:11px!important}
        #content th,#content td{border:1px solid #ccc!important;padding:7px!important;text-align:left!important;white-space:normal!important}
        #content th{font-weight:700!important;background:#f3f4f6!important}
        #content .card{border:1px solid #ddd!important;border-radius:8px!important;padding:14px!important;margin:12px 0!important;box-shadow:none!important}
        #content .muted{color:#666!important}
        #content .stat-card{display:inline-block!important;min-width:150px!important;margin:4px!important}
        #content .stat{font-size:18px!important;font-weight:700!important}
      }
    `;
    document.head.appendChild(style);
    document.title='CHOIX ERP - '+safeTitle;
    const cleanup=()=>{
      style.remove();
      document.title=oldTitle;
      window.removeEventListener('afterprint',cleanup);
    };
    window.addEventListener('afterprint',cleanup,{once:true});
    setTimeout(()=>window.print(),50);
  };
  function boot(){
    addPrintButton();
    const target=$('#content');
    if(target)new MutationObserver(()=>setTimeout(addPrintButton,80)).observe(target,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  window.addEventListener('load',()=>setTimeout(addPrintButton,700));
})();
