import { LayerStyle } from './styling';

interface SymbologyTemplate {
  id: string;
  name: string;
  description: string;
  style: LayerStyle;
  metadata?: Record<string, any>;
}

export class TemplateManager {
  private templates = new Map<string, SymbologyTemplate>();

  addTemplate(template: SymbologyTemplate): void {
    this.templates.set(template.id, template);
  }

  getTemplate(id: string): SymbologyTemplate | undefined {
    return this.templates.get(id);
  }

  applyTemplate(layerId: string, templateId: string): LayerStyle | undefined {
    const template = this.templates.get(templateId);
    if (template) {
      return { ...template.style };
    }
    return undefined;
  }

  listTemplates(): SymbologyTemplate[] {
    return Array.from(this.templates.values());
  }
}

export const templateManager = new TemplateManager();

// Add some default templates
templateManager.addTemplate({
  id: 'categorical-red',
  name: 'Red Categories',
  description: 'Red-based categorical symbology',
  style: {
    type: 'unique-value',
    defaultSymbol: {
      type: 'simple-fill',
      color: [255, 200, 200, 0.6],
      outline: { color: [255, 0, 0, 1], width: 1 }
    }
  }
});

templateManager.addTemplate({
  id: 'sequential-blue',
  name: 'Blue Sequential',
  description: 'Blue-based sequential symbology',
  style: {
    type: 'class-breaks',
    defaultSymbol: {
      type: 'simple-fill',
      color: [200, 200, 255, 0.6],
      outline: { color: [0, 0, 255, 1], width: 1 }
    }
  }
});