(function(){
  const $=s=>document.querySelector(s);
  const sup=()=>window.supabase;
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const roleCanEdit=r=>['Owner','Admin','Manager'].includes(r);
  let profile=null;
  function initials(name){return String(name||'U').trim().split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase()||'U'}
  function closeMenu(){const m=$('#profileMenu'),t=$('#profileTrigger');if(m)m.classList.add('hidden');if(t)t.setAttribute('aria-expanded','false')}
  function installHeader(){
    const host=$('#userInfo');
    if(!host)return false;
    if(host.dataset.profileUi==='1')return true;
    const raw=(host.textContent||'').trim();
    const parts=raw.split('·').map(x=>x.trim());
    const name=parts[0]||'User',role=parts[1]||'User';
    host.dataset.profileUi='1';
    host.className='profile-host';
    host.innerHTML=`<button id="profileTrigger" class="profile-trigger" type="button" aria-haspopup="true" aria-expanded="false"><span id="profileAvatar" class="profile-avatar">${esc(initials(name))}</span><span class="profile-summary"><b id="profileName">${esc(name)}</b><small id="profileRole">${esc(role)}</small></span><span class="profile-chevron">⌄</span></button><div id="profileMenu" class="profile-menu hidden"><button type="button" id="profileOpenBtn">⚙ Profile System</button><button type="button" id="passwordOpenBtn">🔒 Change Password</button><div class="profile-divider"></div><button type="button" id="profileLogoutBtn">↪ Logout</button></div>`;
    const trigger=$('#profileTrigger'),menu=$('#profileMenu');
    if(!trigger||!menu)return false;
    trigger.addEventListener('click',e=>{e.stopPropagation();const open=menu.classList.toggle('hidden')===false;trigger.setAttribute('aria-expanded',open?'true':'false')});
    $('#profileOpenBtn')?.addEventListener('click',()=>openProfileSystem());
    $('#passwordOpenBtn')?.addEventListener('click',()=>openProfileSystem('password'));
    $('#profileLogoutBtn')?.addEventListener('click',()=>$('#logout')?.click());
    document.addEventListener('click',e=>{if(!host.contains(e.target))closeMenu()});
    return true;
  }
  function syncHeader(){
    const host=$('#userInfo');
    if(!host)return false;
    if(!installHeader())return false;
    if(profile){
      const name=profile.full_name||profile.email||'User',role=profile.roles?.name||'User';
      const n=$('#profileName'),r=$('#profileRole'),a=$('#profileAvatar');
      if(n)n.textContent=name;if(r)r.textContent=role;if(a)a.textContent=initials(name);
    }
    return true;
  }
  async function loadProfile(){
    try{
      const client=sup();if(!client?.auth)return false;
      const {data:{user},error:ue}=await client.auth.getUser();if(ue||!user)return false;
      const {data,error}=await client.from('users').select('id,company_id,full_name,email,username,phone,role_id,branch_id,roles(name)').eq('auth_user_id',user.id).single();
      if(error||!data)return false;profile=data;return true;
    }catch(e){console.warn('Profile load skipped:',e);return false}
  }
  async function branchLabel(){
    if(!profile?.branch_id)return 'Head Office / All';
    try{const {data}=await sup().from('branches').select('name').eq('id',profile.branch_id).maybeSingle();return data?.name||'Assigned Branch'}catch(e){return 'Assigned Branch'}
  }
  window.openProfileSystem=async function(mode){
    closeMenu();
    if(!profile)await loadProfile();
    if(!profile)return alert('Profile is still loading. Please try again.');
    if(mode==='password')return showPasswordModal();
    const editable=roleCanEdit(profile.roles?.name),branchName=await branchLabel();
    const html=`<div class="profile-system-card"><div class="profile-hero"><div class="profile-avatar profile-avatar-lg">${esc(initials(profile.full_name||profile.email))}</div><div><h3>${esc(profile.full_name||'User')}</h3><p>${esc(profile.roles?.name||'User')} · ${esc(branchName)}</p></div></div><form id="myProfileForm"><div class="form-grid"><label>Full Name<input id="my_full_name" value="${esc(profile.full_name||'')}" ${editable?'':'disabled'}></label><label>Username<input id="my_username" value="${esc(profile.username||'')}" ${editable?'':'disabled'}></label><label>Phone<input id="my_phone" value="${esc(profile.phone||'')}" ${editable?'':'disabled'}></label><label>Email<input value="${esc(profile.email||'')}" disabled></label><label>Role<input value="${esc(profile.roles?.name||'')}" disabled></label><label>Branch<input value="${esc(branchName)}" disabled></label></div><p class="muted profile-note">${editable?'Owner, Admin and Manager can maintain profile details.':'Branch users can view their profile but cannot edit controlled details.'}</p>${editable?'<button class="primary" type="submit">Save Profile</button>':''}<button type="button" id="profileChangePassword">Change Password</button></form></div>`;
    if(typeof window.modal!=='function')return alert('Profile System is loading. Please try again.');
    window.modal('Profile System',html);
    $('#myProfileForm')?.addEventListener('submit',saveMyProfile);
    $('#profileChangePassword')?.addEventListener('click',()=>showPasswordModal());
  };
  async function saveMyProfile(e){
    e.preventDefault();
    if(!profile)return;
    const client=sup();
    const {data,error}=await client.rpc('update_my_profile',{p_full_name:$('#my_full_name')?.value||'',p_phone:$('#my_phone')?.value||'',p_username:$('#my_username')?.value||''});
    if(error)return alert(error.message);
    if(data)profile={...profile,...data,roles:profile.roles};
    if(typeof window.closeModal==='function')window.closeModal();
    syncHeader();
    if(typeof window.toast==='function')window.toast('Profile updated successfully');
  }
  function showPasswordModal(){
    if(typeof window.modal!=='function')return alert('Profile System is loading. Please try again.');
    window.modal('Change Password','<form id="passwordForm"><p class="muted">Set a new password for your CHOIX ERP login.</p><input id="new_password" type="password" minlength="8" placeholder="New password" required><input id="new_password2" type="password" minlength="8" placeholder="Confirm new password" required><button class="primary">Update Password</button></form>');
    $('#passwordForm')?.addEventListener('submit',async e=>{e.preventDefault();const a=$('#new_password')?.value||'',b=$('#new_password2')?.value||'';if(a!==b)return alert('Passwords do not match.');const {error}=await sup().auth.updateUser({password:a});if(error)return alert(error.message);if(typeof window.closeModal==='function' )window.closeModal();alert('Password updated successfully.');});
  }
  async function start(){
    syncHeader();
    await loadProfile();
    syncHeader();
  }
  let tries=0;const timer=setInterval(()=>{tries++;if(syncHeader()||tries>=40)clearInterval(timer)},250);
  start().catch(()=>{});
})();
