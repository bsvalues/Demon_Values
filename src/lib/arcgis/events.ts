type LayerEventType = 
  | 'load'
  | 'error'
  | 'update'
  | 'visibility'
  | 'style'
  | 'data'
  | 'metadata';

interface LayerEvent {
  type: LayerEventType;
  layerId: string;
  timestamp: number;
  data?: any;
  error?: Error;
}

type LayerEventHandler = (event: LayerEvent) => void;

export class EventManager {
  private handlers = new Map<LayerEventType, Set<LayerEventHandler>>();

  on(type: LayerEventType, handler: LayerEventHandler): void {
    let typeHandlers = this.handlers.get(type);
    if (!typeHandlers) {
      typeHandlers = new Set();
      this.handlers.set(type, typeHandlers);
    }
    typeHandlers.add(handler);
  }

  off(type: LayerEventType, handler: LayerEventHandler): void {
    const typeHandlers = this.handlers.get(type);
    if (typeHandlers) {
      typeHandlers.delete(handler);
    }
  }

  emit(event: LayerEvent): void {
    const typeHandlers = this.handlers.get(event.type);
    if (typeHandlers) {
      typeHandlers.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          console.error('Error in event handler:', error);
        }
      });
    }
  }

  clearHandlers(type?: LayerEventType): void {
    if (type) {
      this.handlers.delete(type);
    } else {
      this.handlers.clear();
    }
  }
}

export const eventManager = new EventManager();