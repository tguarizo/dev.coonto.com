"use client";

import { ArrowRight, RotateCcw } from "lucide-react";
import { useState } from "react";

const choices = [
  {
    id: "A",
    label: "Recuar e rever as internações",
    consequence: "Sua decisão reduz a pressão sobre a Casa Verde, mas também enfraquece a autoridade de Bacamarte e abre espaço para questionarem seus critérios.",
  },
  {
    id: "B",
    label: "Manter os critérios",
    consequence: "Você preserva a lógica do seu método. A tensão cresce porque a população continua submetida a uma regra que quase ninguém consegue contestar.",
  },
  {
    id: "C",
    label: "Ampliar as internações",
    consequence: "Sua escolha radicaliza o conflito: quanto mais gente é considerada fora da norma, mais difícil fica sustentar onde termina a razão e começa a loucura.",
  },
] as const;

export function HomepageDecisionDemo() {
  const [selected, setSelected] = useState<(typeof choices)[number] | null>(null);

  return (
    <div className="decision-demo interactive-decision-demo" aria-label="Experiência rápida com O Alienista">
      <div className="decision-demo-intro">
        <span className="method-example-label"><span className="method-example-dot" />ENTENDA O COONTO EM 60 SEGUNDOS</span>
        <strong>Itaguaí começa a reagir à Casa Verde. Se você estivesse no lugar de Bacamarte, o que faria?</strong>
        <small>Não existe resposta certa aqui. Escolha apenas o que você faria.</small>
      </div>

      {!selected ? (
        <div className="decision-demo-options" role="group" aria-label="Escolha uma decisão">
          {choices.map((choice) => (
            <button key={choice.id} type="button" onClick={() => setSelected(choice)}>
              <b>{choice.id}</b><span>{choice.label}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="decision-demo-reveal" aria-live="polite">
          <span className="decision-you-chose">Você escolheu {selected.id}</span>
          <strong>{selected.label}</strong>
          <p>{selected.consequence}</p>
          <div className="decision-author-path">
            <small>E O CAMINHO DE MACHADO?</small>
            <strong>Machado leva Bacamarte a inverter o próprio critério.</strong>
            <p>Ao perceber que quase toda a cidade poderia ser considerada “louca”, o personagem passa a desconfiar da própria definição de normalidade. A experiência usa essa diferença entre a sua decisão e a do autor para tornar o conflito mais fácil de compreender e lembrar.</p>
          </div>
          <button className="decision-reset" type="button" onClick={() => setSelected(null)}><RotateCcw size={16}/>Escolher de novo</button>
        </div>
      )}

      <div className="decision-demo-result">
        <strong>Isso é o Coonto.</strong>
        <span>Você entra na história, decide, vê uma consequência e só depois descobre o caminho do autor.</span>
      </div>
      <a href="/obra/o-alienista">Entrar na experiência completa <ArrowRight size={18} aria-hidden="true" /></a>
    </div>
  );
}
