(function(){
  const $=s=>document.querySelector(s);
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const editableRoles=['Owner','Admin','Manager'];
  function roleName(){return window.profile?.roles?.name||''}
  function canEdit(){return editableRoles.includes(roleName())}
  function initials(name){return String(name||'U').trim().split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase()||'U'}
  function installHeader(){
    const host=$('#userInfo'); if(!host) return false;
    if(host.dataset.profileUi==='1') return true;
    host.dataset.profileUi='1';
    host.className='profile-host';
    host.innerHTML=`<button id="profileTrigger" class="profile-trigger" type="button" aria-haspopup="true" aria-expanded="false"><span id="profileAvatar" class="profile-avatar">U</span><span class="profile-summary"><b id="profileName">User</b><small id="profileRole">Role</small></span><span class="profile-chevron">⌄</span></button><div id="profileMenu" class="profile-menu hidden"><button type="button" onclick="openProfileSystem()">⚙ Profile System</button><button type="button" onclick="openProfileSystem('password')">🔒 Change Password</button><div class="profile-divider"></div><button type="button" onclick="document.querySelector('#logout')?.click()">↪ Logout</button></div>`;
    $('#profileTrigger').onclick=()=>{const m=$('#profileMenu');const open=m.classList.toggle('hidden')===false;$('#profileTrigger').setAttribute('aria-expanded',open?'true':'false')};
    document.addEventListener('click',e=>{if(!host.contains(e.target)){const m=$('#profileMenu');if(m){m.classList.add('hidden');$('#profileTrigger')?.setAttribute('aria-expanded','false')}}});
    return true;
  }
  function sync(){
    if(!installHeader()) return;
    const p=window.profile; if(!p) return;
    const name=p.full_name||p.email||'User', role=p.roles?.name||'User';
    $('#profileName').textContent=name; $('#profileRole').textContent=role;
    $('#profileAvatar').textContent=initials(name);
  }
  window.openProfileSystem=async function(mode){
    sync(); const p=window.profile; if(!p) return alert('Profile is still loading. Please try again.');
    $('#profileMenu')?.classList.add('hidden');
    const editable=canEdit();
    if(mode==='password') return showPasswordModal();
    const branchName=window._branches?.find(b=>b.id===p.branch_id)?.name || (p.branch_id?'Assigned Branch':'Head Office / All');
    const html=`<div class="profile-system-card"><div class="profile-hero"><div class="profile-avatar profile-avatar-lg">${esc(initials(p.full_name||p.email))}</div><div><h3>${esc(p.full_name||'User')}</h3><p>${esc(p.roles?.name||'User')} · ${esc(branchName)}</p></div></div><form id="myProfileForm"><div class="form-grid"><label>Full Name<input id="my_full_name" value="${esc(p.full_name||'')}" ${editable?'':'disabled'}></label><label>Username<input id="my_username" value="${esc(p.username||'')}" ${editable?'':'disabled'}></label><label>Phone<input id="my_phone" value="${esc(p.phone||'')}" ${editable?'':'disabled'}></label><label>Email<input value="${esc(p.email||'')}" disabled></label><label>Role<input value="${esc(p.roles?.name||'')}" disabled></label><label>Branch<input value="${esc(branchName)}" disabled></label></div>${editable?'<p class="muted profile-note">Owner, Admin and Manager can maintain profile details. Branch users can view their profile but cannot edit it.</p>':'<p class="muted profile-note">This is a branch user profile. Profile details are controlled by Owner, Admin or Manager.</p>'}${editable?'<button class="primary" type="submit">Save Profile</button>':''}<button type="button" onclick="openProfileSystem('password')">Change Password</button></form></div>`;
    window._profileModalHtml=html; modal('Profile System',html);
    if(editable) $('#myProfileForm').onsubmit=saveMyProfile;
  };
  async function saveMyProfile(e){
    e.preventDefault();
    const {data,error}=await window.sb.rpc('update_my_profile',{p_full_name:$('#my_full_name').value,p_phone:$('#my_phone').value,p_username:$('#my_username').value});
    if(error) return alert(error.message);
    window.profile=data; window.profile.roles=window.profile.roles||{name:roleName()}; closeModal(); sync(); toast('Profile updated successfully');
  }
  window.saveMyProfile=saveMyProfile;
  function showPasswordModal(){
    const html='<form id="passwordForm"><p class="muted">Set a new password for your CHOIX ERP login.</p><input id="new_password" type="password" minlength="8" placeholder="New password" required><input id="new_password2" type="password" minlength="8" placeholder="Confirm new password" required><button class="primary">Update Password</button></form>';
    modal('Change Password',html); $('#passwordForm').onsubmit=async e=>{e.preventDefault();const a=$('#new_password').value,b=$('#new_password2').value;if(a!==b)return alert('Passwords do not match.');const {error}=await window.sb.auth.updateUser({password:a});if(error)return alert(error.message);closeModal();alert('Password updated successfully.');};
  }
  window.refreshProfileUi=sync;
  const timer=setInterval(()=>{if(sync()&&window.profile){clearInterval(timer)}},300);
  setTimeout(()=>clearInterval(timer),15000);
})();
