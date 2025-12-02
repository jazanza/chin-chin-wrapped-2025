import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface PaladarCerveceroStoryProps {
  palateCategory: {
    concentration: 'Fiel' | 'Explorador';
    rarity: 'Nicho' | 'Popular';
  };
  dynamicTitle: string;
  varietyExplorationRatio: number; // NEW: Add varietyExplorationRatio prop
  textColor: string;
  highlightColor: string;
}

// Helper function to get the original quadrant phrase
const getQuadrantPhrase = (palateCategory: PaladarCerveceroStoryProps['palateCategory']): string => {
  const { concentration, rarity } = palateCategory;
  if (concentration === 'Fiel' && rarity === 'Nicho') {
    return "EL CURADOR. Tu paladar es exótico y exclusivo; pocos comparten tu gusto, y eres leal a las joyas raras que encuentras.";
  } else if (concentration === 'Explorador' && rarity === 'Nicho') {
    return "EL AVENTURERO. Exploraste las etiquetas más raras de nuestra barra, demostrando un gusto refinado y un paladar incansable por lo nuevo.";
  } else if (concentration === 'Fiel' && rarity === 'Popular') {
    return "EL CLÁSICO. Eres firme en tus decisiones. Disfrutas el Top 3 de los más vendidos y lo haces con una admirable consistencia.";
  } else if (concentration === 'Explorador' && rarity === 'Popular') {
    return "EL SOCIABLE. Eres el amigo que prueba de todo. Consumes la mayoría de las cervezas populares, pero nunca te atas a una sola.";
  }
  return "Descubre tu paladar cervecero.";
};

export const PaladarCerveceroStory = ({ palateCategory, dynamicTitle, varietyExplorationRatio, textColor, highlightColor }: PaladarCerveceroStoryProps) => {
  const LOW_EXPLORATION_TITLE = "Curioso del Lúpulo (Recién Bautizado)".toUpperCase();

  // Obtener la frase subyacente (original)
  const originalQuadrantPhrase = useMemo(() => getQuadrantPhrase(palateCategory), [palateCategory]);

  let finalQuadrantPhrase = originalQuadrantPhrase;

  // Verificar si el título fue anulado por baja exploración
  if (dynamicTitle.toUpperCase() === LOW_EXPLORATION_TITLE) {
      
      // 1. Sanitización: Aseguramos que el ratio sea un número válido y finito, si no, usamos 0.
      const safeRatio = (typeof varietyExplorationRatio === 'number' && isFinite(varietyExplorationRatio)) 
                          ? varietyExplorationRatio 
                          : 0;

      // 2. Cálculo del porcentaje seguro: ¡CAMBIO AQUÍ! Usamos toFixed(1)
      const explorationPercentage = (safeRatio * 100).toFixed(1); // Muestra un decimal

      // 3. Uso del porcentaje seguro: Se mantiene igual
      finalQuadrantPhrase = `Aunque tienes un gusto interesante, apenas estás explorando el ${explorationPercentage}% de nuestra barra. ¡Te falta mucho por probar!`;
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
      <div
        className={`flex flex-col items-center justify-center p-4 max-w-2xl tracking-tight font-black leading-normal`}
      >
        <p className={cn("text-xl text-center mb-4", highlightColor)}> {/* H3 */}
          TU PALADAR CERVECERO ES:
        </p>
        <p className={cn("text-4xl text-center mb-8", highlightColor)}> {/* H2 */}
          {dynamicTitle.toUpperCase()}
        </p>
        <p className={cn("text-xl text-center", textColor)}> {/* H3 */}
          {finalQuadrantPhrase}
        </p>
      </div>
    </div>
  );
};