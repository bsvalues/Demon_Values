import { ArcGISLayer } from './layers';
import { eventManager } from './events';

export interface LayerGroup {
  id: string;
  name: string;
  description?: string;
  layers: Set<string>;
  subgroups: Set<string>;
  parentId?: string;
  expanded?: boolean;
  enabled: boolean;
}

export class GroupManager {
  private groups = new Map<string, LayerGroup>();

  createGroup(group: Omit<LayerGroup, 'layers' | 'subgroups'>): void {
    this.groups.set(group.id, {
      ...group,
      layers: new Set(),
      subgroups: new Set(),
      expanded: false,
      enabled: true
    });

    if (group.parentId) {
      const parent = this.groups.get(group.parentId);
      if (parent) {
        parent.subgroups.add(group.id);
      }
    }

    eventManager.emit({
      type: 'update',
      layerId: group.id,
      timestamp: Date.now(),
      data: { action: 'group-created' }
    });
  }

  addLayerToGroup(groupId: string, layerId: string): void {
    const group = this.groups.get(groupId);
    if (group) {
      group.layers.add(layerId);
      eventManager.emit({
        type: 'update',
        layerId: groupId,
        timestamp: Date.now(),
        data: { action: 'layer-added', layerId }
      });
    }
  }

  removeLayerFromGroup(groupId: string, layerId: string): void {
    const group = this.groups.get(groupId);
    if (group) {
      group.layers.delete(layerId);
      eventManager.emit({
        type: 'update',
        layerId: groupId,
        timestamp: Date.now(),
        data: { action: 'layer-removed', layerId }
      });
    }
  }

  toggleGroup(groupId: string, enabled?: boolean): void {
    const group = this.groups.get(groupId);
    if (group) {
      group.enabled = enabled ?? !group.enabled;
      this.toggleSubgroups(group, group.enabled);
      eventManager.emit({
        type: 'visibility',
        layerId: groupId,
        timestamp: Date.now(),
        data: { enabled: group.enabled }
      });
    }
  }

  private toggleSubgroups(group: LayerGroup, enabled: boolean): void {
    group.subgroups.forEach(subgroupId => {
      const subgroup = this.groups.get(subgroupId);
      if (subgroup) {
        subgroup.enabled = enabled;
        this.toggleSubgroups(subgroup, enabled);
      }
    });
  }

  getGroup(groupId: string): LayerGroup | undefined {
    return this.groups.get(groupId);
  }

  getGroupHierarchy(): LayerGroup[] {
    const rootGroups = Array.from(this.groups.values())
      .filter(group => !group.parentId);
    return this.sortGroups(rootGroups);
  }

  private sortGroups(groups: LayerGroup[]): LayerGroup[] {
    return groups.sort((a, b) => a.name.localeCompare(b.name));
  }
}

export const groupManager = new GroupManager();