import { Plus, X, Globe, PanelLeft, Settings } from 'lucide-react';
import { useBrowserStore } from '../store/browser';
import { useSettingsStore } from '../store/settings';
import { cn } from '../lib/utils';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useState } from 'react';

function SortableTab({ tab, activeTabId, onRemove, onClick }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useSortable({
    id: tab.id,
  });

  const style = transform ? {
    transform: `translate3d(0px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 9999999999 : 0,
    position: 'relative'
  } : undefined;

  const [faviconError, setFaviconError] = useState(false);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        "tab-item",
        tab.loading ? "animate-pulse" : "",
        isDragging ? "tab-item-dragging" : "",
        activeTabId === tab.id ? "tab-item-active" : "tab-item-inactive"
      )}
      aria-label="tab"
    >
      <div className="tab-item-favicon">
        {!faviconError && tab.favicon && tab.url !== "zen://settings" ? (
          <img
            src={tab.favicon}
            alt={tab.url}
            aria-label={tab.url}
            title={tab.url}
            className="w-4 h-4"
            onError={() => setFaviconError(true)}
          />
        ) : tab.url === "zen://settings" ? (
          <Settings className="w-4 h-4 icon" aria-label="Settings" />
        ) : (
          <Globe className="w-4 h-4 icon" aria-label="Globe" />
        )}
      </div>
      <span className="tab-item-title" title={tab.title || tab.url} aria-label={tab.title || tab.url}>
        {tab.title || tab.url}
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(tab.id);
        }}
        className="btn-close-tab"
        aria-label="Close Tab"
        title="Close Tab"
      >
        <X className="w-4 h-4 icon" />
      </button>
    </div>
  );
}

export function Sidebar() {
  const { tabs, activeTabId, addTab, removeTab, setActiveTab, reorderTabs } = useBrowserStore();
  const { toggleSidebar, sidebarVisible } = useSettingsStore();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = tabs.findIndex((tab) => tab.id === active.id);
      const newIndex = tabs.findIndex((tab) => tab.id === over.id);
      reorderTabs(arrayMove(tabs, oldIndex, newIndex));
    }
  };

  return (
    <div
      className={cn(
        "tab-sidebar-container",
        sidebarVisible ? "sidebar-expanded" : "sidebar-collapsed"
      )}
    >
      <div className={cn("tab-sidebar", sidebarVisible ? "opacity-100" : "opacity-0")}>
        <div className="tab-sidebar-actions">
          <button
            onClick={toggleSidebar}
            className="btn-icon w-12 h-12"
            title="Toggle Sidebar"
            aria-label="Toggle Sidebar"
          >
            <PanelLeft className="w-5 h-5 text-text" />
          </button>
          <button
            onClick={() => addTab({ url: 'about:blank', title: 'New Tab' })}
            className="btn-add-new-tab"
            aria-label="New Tab"
            title="New Tab"
          >
            <Plus className="w-6 h-6 text-text" />
            <p className="base-semibold line-clamp-1">New Tab</p>
          </button>
        </div>

        <div className="tab-list-container">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={tabs} strategy={verticalListSortingStrategy}>
              {tabs.map((tab) => (
                <SortableTab
                  key={tab.id}
                  tab={tab}
                  activeTabId={activeTabId}
                  onRemove={removeTab}
                  onClick={() => setActiveTab(tab.id)}
                  aria-label="Tab"
                  title="Tab"
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </div>
  );
}