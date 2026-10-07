/** One source for the spoken text used by the reader route, CRM and production script. */
function rcAudioEntries(work){
 return work.units.flatMap(unit=>[
  {id:unit.id,text:unit.title+'. '+unit.context},
  ...(unit.interactions||[]).flatMap(op=>[
   {id:op.id+'-pre',text:op.title+'. '+op.preparation+' '+op.question+' '+op.options.map((o,i)=>'Alternativa '+(i+1)+'. '+o.label).join(' ')},
   ...op.options.map((o,i)=>({id:op.id+'-r-'+i,text:[op.reveal,o.consequence,op.discovery].filter(Boolean).join(' ')}))
  ])
 ]);
}
module.exports={rcAudioEntries};
