export interface LayerStyle {
  type: 'simple' | 'unique-value' | 'class-breaks';
  field?: string;
  defaultSymbol: Symbol;
  values?: Array<{
    value: string | number;
    symbol: Symbol;
  }>;
  breaks?: Array<{
    min: number;
    max: number;
    symbol: Symbol;
  }>;
}

interface Symbol {
  type: 'simple-fill' | 'simple-line' | 'simple-marker';
  color: [number, number, number, number];
  outline?: {
    color: [number, number, number, number];
    width: number;
  };
  size?: number;
}

export class StyleManager {
  private styles = new Map<string, LayerStyle>();

  setStyle(layerId: string, style: LayerStyle): void {
    this.styles.set(layerId, style);
  }

  getStyle(layerId: string): LayerStyle | undefined {
    return this.styles.get(layerId);
  }

  updateStyle(layerId: string, updates: Partial<LayerStyle>): void {
    const current = this.styles.get(layerId);
    if (current) {
      this.styles.set(layerId, { ...current, ...updates });
    }
  }

  getSymbolForFeature(layerId: string, feature: any): Symbol | undefined {
    const style = this.styles.get(layerId);
    if (!style) return undefined;

    switch (style.type) {
      case 'simple':
        return style.defaultSymbol;
      case 'unique-value':
        if (!style.field || !style.values) return style.defaultSymbol;
        const value = feature.attributes[style.field];
        const match = style.values.find(v => v.value === value);
        return match?.symbol || style.defaultSymbol;
      case 'class-breaks':
        if (!style.field || !style.breaks) return style.defaultSymbol;
        const numValue = parseFloat(feature.attributes[style.field]);
        const breakMatch = style.breaks.find(b => numValue >= b.min && numValue <= b.max);
        return breakMatch?.symbol || style.defaultSymbol;
    }
  }
}

export const styleManager = new StyleManager();