(function(){
  const SUPABASE_URL='https://qahksphurzoojashjfyj.supabase.co';
  const SUPABASE_KEY='sb_publishable_zLxtcpAM-eTXRiV_8n8zrQ_PoZEp5pD';
  const client=()=>window.choixLoginSupabase||(window.choixLoginSupabase=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY));
  function install(){
    const form=document.querySelector('#loginForm');
    const input=document.querySelector('#email');
    if(!form||!input)return false;
    input.type='text';
    input.placeholder='Email or Username';
    form.onsubmit=async e=>{
      e.preventDefault();
      const msg=document.querySelector('#loginMsg');
      const value=input.value.trim();
      const password=document.querySelector('#password')?.value||'';
      if(!value||!password){msg.textContent='Email/username and password are required.';return}
      msg.textContent='Signing in...';
      try{
        let email=value;
        if(!value.includes('@')){
          const {data,error}=await client().from('users').select('email,is_active').eq('username',value).maybeSingle();
          if(error)throw error;
          if(!data?.email){msg.textContent='Username not found.';return}
          if(data.is_active===false){msg.textContent='This account is inactive.';return}
          email=data.email;
        }
        const {data,error}=await client().auth.signInWithPassword({email,password});
        if(error){msg.textContent=error.message;return}
        if(!data?.session){msg.textContent='Login succeeded but no session was returned.';return}
        location.reload();
      }catch(err){console.error(err);msg.textContent=err?.message||'Sign-in failed.'}
    };
    return true;
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,0));else setTimeout(install,0);
  window.addEventListener('load',install);
})();
