const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const base=process.env.QA_BASE_URL||'http://127.0.0.1:3102';
const out='qa-results';fs.mkdirSync(out,{recursive:true});
const checks=[];
async function noOverflow(page,label){const widths=await page.evaluate(()=>({page:document.documentElement.scrollWidth,viewport:innerWidth}));assert.ok(widths.page<=widths.viewport+1,label+': horizontal overflow '+JSON.stringify(widths));}
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  for(const [name,width,height] of [['phone',375,812],['tablet',768,1024],['desktop',1440,1000]]){
   const context=await browser.newContext({viewport:{width,height}}),page=await context.newPage();
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(base,{waitUntil:'networkidle'});
   await page.locator('dialog').waitFor({state:'hidden',timeout:6000});
   assert.match(await page.locator('body').innerText(),/Plataforma de aprendizagem interativa/);
   await noOverflow(page,'home '+name);
   assert.equal(await page.locator('.original-book').count(),3);
   await page.evaluate(()=>window.scrollTo(0,document.querySelector('#livros-originais').getBoundingClientRect().top+scrollY-90));
   await page.screenshot({path:path.join(out,'books-'+name+'.png')});
   await page.reload({waitUntil:'networkidle'});assert.equal(await page.locator('dialog[open]').count(),0);
   for(const slug of ['memorias-de-martha','divina-comedia-canto-i']){
    const work=JSON.parse(fs.readFileSync('content/rc-'+slug+'.json','utf8'));
    await page.goto(base+'/rc/'+slug,{waitUntil:'networkidle'});
    for(const unit of work.units){
     for(const op of unit.interactions){
      await page.locator('.rc-question').filter({hasText:op.question}).waitFor();
      assert.equal(await page.locator('.rc-feedback').count(),0);
      if(op.illustration){const img=page.locator('.rc-narrative-art img');await img.waitFor();assert.equal(await img.getAttribute('src'),op.illustration.src);await img.evaluate(el=>el.decode());assert.equal(await img.evaluate(el=>el.naturalWidth),1536);}
      await noOverflow(page,slug+' '+name+' '+op.id);
      if(op===unit.interactions[0]){
       await page.evaluate(()=>{window.scrollTo(0,0);document.querySelector('.rc-reader-canvas').scrollTop=0;});
       if(op.illustration)await page.locator('.rc-narrative-art').scrollIntoViewIfNeeded();
       await page.screenshot({path:path.join(out,slug+'-'+unit.id+'-'+name+'.png')});
      }
      for(let choice=0;choice<op.options.length;choice++){
       await page.getByRole('group',{name:op.question,exact:true}).getByRole('button',{name:op.options[choice].label,exact:true}).click();
       assert.ok((await page.locator('.rc-feedback').innerText()).includes(op.options[choice].consequence));
      }
      
      if(op!==work.units.at(-1).interactions.at(-1))await page.locator('.rc-reader-nav .primary').click();
     }
    }
    assert.equal(await page.locator('.rc-hud small').innerText(),'100%');
    await page.getByRole('button',{name:'Voltar',exact:true}).click();
    assert.equal(await page.locator('.rc-question').innerText(),work.units.at(-1).interactions.at(-2).question);
    checks.push({viewport:name,work:slug,interactions:work.units.reduce((n,u)=>n+u.interactions.length,0),choices:'all',images:'decoded'});
   }
   // The exact protected document is rendered as a local QA fixture, without changing production access.
   await page.route(base+'/__qa/alienista',r=>r.fulfill({contentType:'text/html',body:fs.readFileSync('content/Coonto_O_Alienista.html','utf8')}));
   await page.goto(base+'/__qa/alienista',{waitUntil:'networkidle'});
   await page.locator('#skipSplash').click();
   await page.locator('#splash').waitFor({state:'hidden'});
   const art=JSON.parse(fs.readFileSync('content/alienista-illustrations.json','utf8'));
   for(const [id,item] of Object.entries(art)){
    await page.evaluate(idx=>{state.idx=idx;render();},Number(id.slice(1)));
    const img=page.locator('img[src="'+item.src+'"]');await img.waitFor();await img.evaluate(el=>el.decode());
    assert.equal(await img.evaluate(el=>el.naturalWidth),1536);await noOverflow(page,'alienista '+name+' '+id);
    await img.scrollIntoViewIfNeeded();
    await page.screenshot({path:path.join(out,'alienista-'+id+'-'+name+'.png')});
   }
   assert.deepEqual(errors,[],'Browser runtime errors');
   checks.push({viewport:name,work:'o-alienista',images:6,document:'local protected-document fixture'});
   await context.close();
  }
  fs.writeFileSync(path.join(out,'browser-report.json'),JSON.stringify({base,checks,passed:true},null,2));
  console.log(JSON.stringify({passed:true,checks}));
 }finally{await browser.close();}
})().catch(error=>{fs.writeFileSync(path.join(out,'failure.txt'),error.stack);console.error(error);process.exit(1);});
