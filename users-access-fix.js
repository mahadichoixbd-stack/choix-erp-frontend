(function(){
  function getRole(){
    try{
      if(typeof profile!=='undefined' && profile?.roles?.name) return String(profile.roles.name).trim().toLowerCase();
    }catch(e){}
    try{
      if(window.profile?.roles?.name) return String(window.profile.roles.name).trim().toLowerCase();
    }catch(e){}
    return '';
  }
  function isManager(){return ['owner','admin','manager'].includes(getRole())}

  function allowUserManagement(){
    if(!isManager()) return false;
    try{
      if(typeof currentPermissions!=='undefined'){
        if(!Array.isArray(currentPermissions)) currentPermissions=[];
        if(!currentPermissions.includes('users.manage')) currentPermissions.push('users.manage');
      }
    }catch(e){}
    return true;
  }

  async function routeUsersPage(){
    allowUserManagement();
    if(typeof window.users==='function') return window.users();
    // profile-ui.js may still be loading; give it a short chance before using
    // the legacy page implementation, which performs a stale permission check.
    for(let i=0;i<20;i++){
      await new Promise(r=>setTimeout(r,100));
      if(typeof window.users==='function') return window.users();
    }
    return typeof loadPage==='function' ? loadPage('users') : undefined;
  }

  const originalLoadPage=window.loadPage;
  if(typeof originalLoadPage==='function'){
    window.loadPage=async function(p){
      if(p==='users') return routeUsersPage();
      if(p==='branches') allowUserManagement();
      return originalLoadPage.apply(this,arguments);
    };
  }

  // If the navigation handler resolves the global lexical loadPage binding,
  // replace that binding too when possible.
  try{
    if(typeof loadPage==='function' && typeof window.users==='function'){
      // no-op: the window property assignment above is the global binding in
      // normal browser script scope.
    }
  }catch(e){}

  window.addEventListener('load',allowUserManagement);
  setTimeout(allowUserManagement,300);
  setTimeout(allowUserManagement,1000);
  setTimeout(allowUserManagement,2500);
})();
