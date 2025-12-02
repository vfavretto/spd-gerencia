import { createContext, useContext, useState, type ReactNode } from 'react';
import clsx from 'clsx';

type TabsContextType = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
};

const TabsContext = createContext<TabsContextType | null>(null);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs provider');
  }
  return context;
}

type TabsProps = {
  defaultTab: string;
  children: ReactNode;
  onChange?: (tab: string) => void;
};

export function Tabs({ defaultTab, children, onChange }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleSetActiveTab = (tab: string) => {
    setActiveTab(tab);
    onChange?.(tab);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: handleSetActiveTab }}>
      {children}
    </TabsContext.Provider>
  );
}

type TabListProps = {
  children: ReactNode;
  className?: string;
};

export function TabList({ children, className }: TabListProps) {
  return (
    <div
      className={clsx(
        'flex gap-1 overflow-x-auto border-b border-slate-200 pb-px',
        className
      )}
      role="tablist"
    >
      {children}
    </div>
  );
}

type TabProps = {
  value: string;
  children: ReactNode;
  icon?: ReactNode;
  badge?: number;
};

export function Tab({ value, children, icon, badge }: TabProps) {
  const { activeTab, setActiveTab } = useTabsContext();
  const isActive = activeTab === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={() => setActiveTab(value)}
      className={clsx(
        'relative flex items-center gap-2 whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors',
        isActive
          ? 'text-primary-600'
          : 'text-slate-500 hover:text-slate-700'
      )}
    >
      {icon}
      {children}
      {badge !== undefined && badge > 0 && (
        <span
          className={clsx(
            'ml-1 rounded-full px-2 py-0.5 text-xs font-semibold',
            isActive
              ? 'bg-primary-100 text-primary-600'
              : 'bg-slate-100 text-slate-600'
          )}
        >
          {badge}
        </span>
      )}
      {isActive && (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />
      )}
    </button>
  );
}

type TabPanelProps = {
  value: string;
  children: ReactNode;
  className?: string;
};

export function TabPanel({ value, children, className }: TabPanelProps) {
  const { activeTab } = useTabsContext();

  if (activeTab !== value) {
    return null;
  }

  return (
    <div role="tabpanel" className={clsx('py-4', className)}>
      {children}
    </div>
  );
}

