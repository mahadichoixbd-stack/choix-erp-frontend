(function(){
  function roleName(){return String(window.profile?.roles?.name || (typeof profile!=='undefined'&&profile?.roles?.name) || '').trim().toLowerCase()}
  function ensureUserManagementPermission(){
    const r=roleName();
    if(['owner','admin','manager'].includes(r)){
      try{ if(typeof currentPermissions!=='undefined' && !currentPermissions.includes('users.manage')) currentPermissions.push('users.manage'); }catch(e){}
      return true;
    }
    return false;
  }
  window.addEventListener('load',ensureUserManagementPermission);
  const originalLoadPage=window.loadPage;
  if(typeof originalLoadPage==='function'){
    window.loadPage=async function(p){
      if(p==='users'||p==='branches') ensureUserManagementPermission();
      return originalLoadPage.apply(this,arguments);
    };
  }
  setTimeout(ensureUserManagementPermission,1000);
  setTimeout(ensureUserManagementPermission,2500);
})();
