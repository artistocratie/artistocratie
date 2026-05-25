const cursor = document.getElementById('cursor');
  const ring = document.getElementById('cursorRing');
  let mx=0,my=0,rx=0,ry=0;
  document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;});
  function animateCursor(){cursor.style.left=mx+'px';cursor.style.top=my+'px';rx+=(mx-rx)*0.25;ry+=(my-ry)*0.25;ring.style.left=rx+'px';ring.style.top=ry+'px';requestAnimationFrame(animateCursor);}
  animateCursor();

  function openContact(){const o=document.getElementById('contactOverlay');o.classList.add('open');document.body.style.overflow='hidden';setTimeout(()=>o.classList.add('visible'),10);}
  function closeContact(){const o=document.getElementById('contactOverlay');o.classList.remove('visible');document.body.style.overflow='';setTimeout(()=>o.classList.remove('open'),400);}
  document.getElementById('contactOverlay').addEventListener('click',function(e){if(e.target===this)closeContact();});

  document.querySelector('.unlock-form').addEventListener('submit', function(e){
    e.preventDefault();
    const email = this.querySelector('input[type="email"]').value;
    const action = this.getAttribute('action');
    fetch(action + '&EMAIL=' + encodeURIComponent(email), {mode: 'no-cors'});
    this.innerHTML = '<p style="color:var(--gold);font-family:\'Cormorant Garamond\',serif;font-style:italic;font-size:18px;line-height:1.8;">Parfait. Vérifie ta boîte mail —<br>le lien vers la salle privée t\'attend.</p>';
  });
  function closeConfirm(){const o=document.getElementById('confirmOverlay');o.classList.remove('visible');document.body.style.overflow='';setTimeout(()=>o.classList.remove('open'),400);}

  function openLightbox(title,tag,medium,format,year,desc,imgSrc){
    const lb=document.getElementById('lightbox');
    document.getElementById('lightbox-title').textContent=title;
    document.getElementById('lightbox-tag').textContent=tag;
    document.getElementById('lightbox-medium').textContent=medium;
    document.getElementById('lightbox-format').textContent=format;
    document.getElementById('lightbox-year').textContent=year;
    document.getElementById('lightbox-desc').textContent=desc;
    const img=document.getElementById('lightbox-img');
    const placeholder=document.getElementById('lightbox-placeholder');
    if(imgSrc){
      img.src=imgSrc;
      img.style.display='block';
      placeholder.style.display='none';
    } else {
      img.style.display='none';
      placeholder.style.display='flex';
    }
    lb.classList.add('open');document.body.style.overflow='hidden';setTimeout(()=>lb.classList.add('visible'),10);
  }
  function closeLightbox(){const lb=document.getElementById('lightbox');lb.classList.remove('visible');document.body.style.overflow='';setTimeout(()=>lb.classList.remove('open'),400);}
  document.getElementById('lightbox').addEventListener('click',function(e){if(e.target===this)closeLightbox();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeLightbox();});

  function openRoom(name){const p=document.getElementById('room-'+name);p.classList.add('open');document.body.style.overflow='hidden';setTimeout(()=>p.classList.add('visible'),10);p.scrollTop=0;}
  function closeRoom(name){const p=document.getElementById('room-'+name);p.classList.remove('visible');document.body.style.overflow='';setTimeout(()=>p.classList.remove('open'),400);}

  let logoMorphed=false,svgRaf=null,svgCurrent=0,svgTarget=0;
  const logoTp=document.getElementById('logo-tp');
  function animateSvgText(){svgCurrent+=(svgTarget-svgCurrent)*0.06;logoTp.setAttribute('startOffset',svgCurrent.toFixed(2)+'%');if(Math.abs(svgCurrent-svgTarget)>0.05){svgRaf=requestAnimationFrame(animateSvgText);}else{svgCurrent=svgTarget;svgRaf=null;}}

  window.addEventListener('scroll',()=>{
    const scrolled=window.scrollY>60;
    document.getElementById('navbar').classList.toggle('scrolled',scrolled);
    if(scrolled&&!logoMorphed){logoMorphed=true;const t=document.getElementById('logo-text'),s=document.getElementById('logo-svg');t.style.opacity='0';setTimeout(()=>{t.style.display='none';s.style.display='block';setTimeout(()=>{s.style.opacity='1';},10);},300);}
    else if(!scrolled&&logoMorphed){logoMorphed=false;const t=document.getElementById('logo-text'),s=document.getElementById('logo-svg');s.style.opacity='0';setTimeout(()=>{s.style.display='none';t.style.display='';setTimeout(()=>{t.style.opacity='1';},10);},300);}
  });
  document.getElementById('logo-svg').addEventListener('mouseenter',()=>{svgTarget=50;if(!svgRaf)svgRaf=requestAnimationFrame(animateSvgText);});
  document.getElementById('logo-svg').addEventListener('mouseleave',()=>{svgTarget=0;if(!svgRaf)svgRaf=requestAnimationFrame(animateSvgText);});

  const reveals=document.querySelectorAll('.reveal');
  new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible');});},{threshold:0.15}).observe&&reveals.forEach(r=>new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible');});},{threshold:0.15}).observe(r));
