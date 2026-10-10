function checkBudget(subscription, characters, model) {
  if(model!=='eleven_multilingual_v2')throw new Error('Modelo sem orçamento validado: '+model);
  const used=Number(subscription.character_count),limit=Number(subscription.character_limit);
  if(!Number.isFinite(used)||!Number.isFinite(limit)||used<0||limit<used)throw new Error('Saldo do fornecedor inválido.');
  const remaining=limit-used;
  if(characters+500>remaining)throw new Error(`Créditos insuficientes: necessários ${characters}, disponíveis ${remaining}. Nenhuma geração iniciada.`);
  return {characters,remaining,reserve:500,model};
}
module.exports={checkBudget};
