(function(){
  function getRole(){
    try{if(typeof profile!=='undefined' && profile?.roles?.name)return String(profile.roles.name).trim().toLowerCase()}catch(e){}
    try{if(window.profile?.roles?.name)return String(window.profile.roles.name).trim().toLowerCase()}catch(e){}
    return '';
  }
  function isManager(){return ['owner','admin','manager'].includes(getRole())}
  function allowUserManagement(){
    if(!isManager())return false;
    try{if(typeof currentPermissions!=='undefined' && Array.isArray(currentPermissions) && !currentPermissions.includes('users.manage'))currentPermissions.push('users.manage')}catch(e){}
    return true;
  }
  async function routeUsersPage(){
    allowUserManagement();
    for(let i=0;i<30;i++){
      if(typeof window.users==='function')return window.users();
      await new Promise(r=>setTimeout(r,100));
    }
    const c=document.querySelector('#content');
    if(c)c.innerHTML='<div class="card error"><h3>Users & Roles is still loading</h3><p>Please wait a moment and click Users & Roles again.</p></div>';
  }
  const originalLoadPage=window.loadPage;
  if(typeof originalLoadPage==='function'){
    window.loadPage=async function(p){
      if(p==='users')return routeUsersPage();
      if(p==='branches')allowUserManagement();
      return originalLoadPage.apply(this,arguments);
    };
  }
  window.addEventListener('load',allowUserManagement);
  setTimeout(allowUserManagement,300);
  setTimeout(allowUserManagement,1000);
  setTimeout(allowUserManagement,2500);
})();
